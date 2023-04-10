import 'dotenv/config';
import { sequelize } from '../backend/models/index.mjs';
import { Sequelize } from 'sequelize';
import { createLogger } from './lib/Logger.mjs';
import { setTimeout } from 'node:timers/promises';
import axios from 'axios';
import ms from 'ms';

BigInt.prototype.toJSON = function() { return this.toString(); };

const isProduction = process.env.NODE_ENV == 'production';

const TEST_WEBHOOK_SIGNATURE_SECRET = 'slavaukraini';

const RETRY_DELAY_MAX_SECONDS = 6 * 60 * 60;
const MAX_PAYLOAD_AGE_SECONDS = isProduction ? (2 * 24 * 60 * 60) : 60;

const WAIT_BETWEEN_NO_PAYLOADS_MS = ms('1s');
const WAIT_BETWEEN_PAYLOADS_FOUND_MS = ms('0.1s');

const MAX_HUNG_MINUTE = 3;

const WEBHOOK_TIMEOUT_MS = ms('5s');

const MAX_PAYLOADS_TO_PROCESS_COUNT = 100;

const EXPIRE_PAYLOADS_INTERVAL = ms('1h');
const EXPIRE_ABANDONED_REQUESTS_INTERVAL = ms('3m');
const EXPIRE_PAYLOADS_AFTER_MINUTE = 1440 * 7;

let logger = null;

let lastPayloadFinishedExpireAt = 0;
let lastAbandonHungRequestsDeletedAt = 0;

let isExiting = false;

async function abandonHungRequests() {
  if (Date.now() - lastAbandonHungRequestsDeletedAt < EXPIRE_ABANDONED_REQUESTS_INTERVAL) {
    return;
  }

  await sequelize.query('UPDATE Payload SET isSending = 0 WHERE isSending = 1 AND requestStartedAt <= NOW() - INTERVAL ? MINUTE', {
    replacements: [ MAX_HUNG_MINUTE ],
    type: Sequelize.QueryTypes.UPDATE
  });

  lastAbandonHungRequestsDeletedAt = Date.now(); // eslint-disable-line require-atomic-updates
}

async function expirePayloadFinished() {
  if (Date.now() - lastPayloadFinishedExpireAt < EXPIRE_PAYLOADS_INTERVAL) {
    return;
  }

  await sequelize.models.PayloadFinished.expire(EXPIRE_PAYLOADS_AFTER_MINUTE);

  lastPayloadFinishedExpireAt = Date.now(); // eslint-disable-line require-atomic-updates
}

async function doPost({ url, data, timestamp, signature, webhookId }) {
  try {
    return await axios.request({
      method: 'POST',
      url,
      headers: {
        'User-Agent': 'Webhooks bot',
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'X-Signature': signature,
        'X-Timestamp': timestamp
      },
      data,
      timeout: WEBHOOK_TIMEOUT_MS,
      maxRedirects: 1,
      validateStatus: null,
      maxContentLength: 1024 * 1024 * 30,
      maxBodyLength: 1024 * 1024 * 30
    });
  } catch (e) {
    logger.debug(e, `post on url=${url} for webhook=${webhookId}`);
    return null;
  }
}

async function sendPayload(payload, userSecrets) {
  const secret = payload.userId ? userSecrets[payload.userId] : TEST_WEBHOOK_SIGNATURE_SECRET;
  if (!secret) {
    logger.error(`Can't find user secret for payload id=${payload.id} userId=${payload.userId}`);

    await sequelize.models.Payload.moveToFinished({
      responseStatus: 0,
      ...payload
    });
    return;
  }

  const timestamp = Date.now().toString();
  const signature = sequelize.models.Payload.signPayload(payload.payload + '.' + timestamp, secret);

  const response = await doPost({
    url: payload.url,
    webhookId: payload.webhookId,
    data: payload.payload,
    timestamp,
    signature
  });

  logger.trace(`HTTP response payload=${payload.id} url=${payload.url} status=${response ? response.status : 'oops'}`);

  payload.requestCount++;

  const responseValues = {
    responseHeaders: response ? serializeHeaders(response.status, response.statusText, response.headers) : null,
    responseStatus: response ? response.status : 599,
    responseBody: (response?.data || '').toString()
  };

  if (response?.status >= 200 && response?.status < 300) {
    await sequelize.models.Payload.moveToFinished({
      ...payload,
      ...responseValues
    });

    return;
  }

  const diffS = Math.floor((Date.now() - payload.createdAt.getTime()) / 1000);

  if (!payload.webhookId || diffS >= MAX_PAYLOAD_AGE_SECONDS) {
    await sequelize.models.Payload.moveToFinished({
      ...payload,
      ...responseValues
    });
    return;
  }

  await sequelize.models.Payload.update(
    {
      isSending: false,
      nextRequestAt: calculateNextRequestAt(payload.requestCount),
      ...payload,
      ...responseValues
    },
    {
      where: {
        id: payload.id
      }
    }
  );

  await sequelize.models.Webhook.incrementFailedCountAndPossiblyDisableById(payload.webhookId);
}

function calculateNextRequestAt(requestCount) {
  const deltaSeconds = Math.min(2 + requestCount ** 2, RETRY_DELAY_MAX_SECONDS);

  return new Date(Date.now() + deltaSeconds * 1000);
}

function serializeHeaders(status, statusText, headers) {
  const list = [ status + ' ' + statusText ];

  for (const [ header, value ] of Object.entries(headers)) {
    list.push(header + ': ' + value);
  }

  return list.join('\n') + '\n';
}

async function sendPayloadList(payloadList, userSecrets) {
  for (const payload of payloadList) {
    await sendPayload(payload, userSecrets);
    if (isExiting) {
      return;
    }
  }
}

async function sendPayloadListByWebhookId(payloadListByWebhookId, userSecrets) {
  const promises = Object.values(payloadListByWebhookId).map(payloadList => sendPayloadList(payloadList, userSecrets));
  return await Promise.all(promises);
}

async function loadUserSecrets() {
  const records = await sequelize.models.User.findAll({
    attributes: ['id', 'secret'],
    raw: true
  });

  // yeah, you could use .reduce() to make the code unreadable
  const hash = {};
  for (const record of records) {
    hash[record.id] = record.secret;
  }
  return hash;
}

async function cycleRun() {
  do {
    if (isExiting) {
      return;
    }

    await expirePayloadFinished();
    await abandonHungRequests();

    if (isExiting) {
      return;
    }

    const records = await sequelize.models.Payload.findPayloadsToSend(MAX_PAYLOADS_TO_PROCESS_COUNT);
    if (records.length == 0) {
      if (isExiting) {
        return;
      }

      await setTimeout(WAIT_BETWEEN_NO_PAYLOADS_MS);
      continue;
    }

    const userSecrets = await loadUserSecrets();

    const payloadListByWebhookId = {};
    for (const record of records) {
      if (!payloadListByWebhookId[record.webhookId]) {
        payloadListByWebhookId[record.webhookId] = [];
      }

      payloadListByWebhookId[record.webhookId].push(record);
    }

    await sendPayloadListByWebhookId(payloadListByWebhookId, userSecrets);

    if (isExiting) {
      return;
    }

    await setTimeout(WAIT_BETWEEN_PAYLOADS_FOUND_MS);
  } while (!isExiting);
}

function localCreateLogger() {
  logger = createLogger('sender');
}

process.on('SIGINT', () => {
  if (isExiting) {
    logger.fatal("Force exit");
    process.exit(0);
  }

  logger.debug("Will exit");
  isExiting = true;
});

process.on('SIGHUP', () => {
  logger.flush();
  localCreateLogger();
});

process.on('uncaughtException', e => {
  console.error("uncaughtException, force exit");
  console.error(e);
  process.exit(1);
})

process.on('unhandledRejection', e => {
  console.error("unhandledRejection, force exit");
  console.error(e);
  process.exit(1);
});

localCreateLogger();

logger.debug(`Started`);

if (process.send) {
  process.send('ready');
}

await cycleRun();

logger.debug(`Done, closing db`);

await sequelize.close();

logger.debug(`Db closed, exit`);
process.exit(0);
