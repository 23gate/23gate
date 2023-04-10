import 'dotenv/config';
import ms from 'ms';
import { ethers } from 'ethers';
import { sequelize } from '../backend/models/index.mjs';
import { setTimeout } from 'node:timers/promises';
import { createLogger } from './lib/Logger.mjs';
import { ethersNumbersToStrings } from './lib/Parsers.mjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

BigInt.prototype.toJSON = function() { return this.toString(); };

const DEADLOCK_INTERVAL = 100;
const INTERVAL_BETWEEN_ZERO_TRANSACTIONS_TO_PARSE = ms('1.3s')
const INTERVAL_BETWEEN_TRANSACTIONS_TO_PARSE = ms('0.5s');

const argv = yargs(hideBin(process.argv))
  .wrap(180)
  .command('* <chainId>', "run", yargs => {
    yargs.positional('chainId', {
      describe: 'chainId',
      type: 'number'
    })
  })
  .parse();

let isExiting = false;
const chainId = argv.chainId;

let logger = null;

function chainIdHr() {
  return chainId ? ('0x' + chainId.toString(16)) : 'unknown';
}

function reparseEventArgs(args) {
  let result;
  try {
    result = args.toObject();
  } catch {
    // we will fall here in case the event arguments are unnamed in the ABI, so this has to stay an array
    result = args.toArray()[0];
  }

  return reparseArgsArrayIntoObject(result);
}

function reparseArgsArrayIntoObject(args) {
  const results = {};

  for (const [ key, value ] of Object.entries(args)) {
    if (key === parseInt(key, 10).toString()) { // key is an index
      results[key] = value;
      continue;
    }

    const _key = key == '_length' ? 'length' : key; // special case for ethers.js decoding

    results[_key] = value;
  }

  return ethersNumbersToStrings(results);
}

function ifaceParseLog(iface, log) {
  try {
    return iface.parseLog(log);
  } catch {
    return null;
  }
}

async function loadWebhooks() {
  const webhooks = await sequelize.models.Webhook.findAll({
    where: {
      status: 'enabled',
      chainId
    },
    attributes: ['id', 'addressList', 'abi', 'url', 'userId'],
    raw: true
  });

  for (const webhook of webhooks) {
    webhook.abi = new ethers.Interface(webhook.abi);

    const event = webhook.abi.fragments[0];

    webhook.keys = [];
    for (const address of sequelize.models.Webhook.parseAddressListString(webhook.addressList)) {
      webhook.keys.push(event.topicHash + '-' + address);
    }
  }

  return webhooks;
}

function parse(transactionReceipt, webhooks, payloadList) {
  if (!transactionReceipt.logs?.length) {
    return;
  }

  const logsByTopic0AndAddress = {};

  for (const log of transactionReceipt.logs) {
    const key = log.topics[0] + '-' + log.address;

    logsByTopic0AndAddress[key] ||= [];
    logsByTopic0AndAddress[key].push(log);
  }

  for (const webhook of webhooks) {
    for (const key of webhook.keys) {
      if (!logsByTopic0AndAddress[key]) {
        continue;
      }

      logger.trace(`Got match on tx=${transactionReceipt.transactionHash} webhook=${webhook.id}`);

      for (const log of logsByTopic0AndAddress[key]) {
        const parsed = ifaceParseLog(webhook.abi, log);
        if (!parsed) {
          logger.warn(`Couldn't parse ${log.transactionHash} for webhook ${webhook.id}`);
          continue;
        }

        logger.trace(`Found eventName=${parsed.name} in tx=${transactionReceipt.transactionHash} webhook=${webhook.id}`);

        payloadList.push({
          eventName: parsed.name,
          log,
          args: reparseEventArgs(parsed.args),
          transactionReceipt,
          webhook
        });
      }
    }
  }
}

function createPayloads(payloadList) {
  if (payloadList?.length == 0) {
    return [];
  }

  const nextRequestAt = new Date();

  return payloadList.map(({ eventName, log, args, transactionReceipt, webhook }) => {
    const payload = sequelize.models.Payload.createPayload({
      webhookId: webhook.id,
      log,
      eventName,
      args,
      chainId,
      transactionReceipt
    });

    const payloadJsonString = JSON.stringify(payload);

    return {
      url: webhook.url,
      webhookId: webhook.id,
      userId: webhook.userId,
      address: log.address,
      logIndex: log.logIndex,
      transactionIndex: transactionReceipt.transactionIndex,
      transactionHash: transactionReceipt.transactionHash,
      chainId,
      blockNumber: transactionReceipt.blockNumber,
      eventName,
      nextRequestAt,
      payload: payloadJsonString
    };
  });
}

async function savePayloadsAndDeleteTransactions(records, transactionHashList, c = 0) {
  if (c > 0) {
    await setTimeout(DEADLOCK_INTERVAL);
  }

  c++;

  const startedAt = Date.now();

  try {
    await sequelize.transaction(async transaction => {
      if (records.length > 0) {
        await sequelize.models.Payload.bulkCreate(records, { ignoreDuplicates: true, transaction });
      }

      await sequelize.models.Transaction.destroyTransactionsByHashList(transactionHashList, transaction);
    });

  } catch (e) {
    if (e.parent?.code == 'ER_LOCK_DEADLOCK') {
      if (c > 1) {
        logger.warn(`savePayloadsAndDeleteTransactions DEADLOCKED in ${Date.now() - startedAt}ms at try ${c}`);
      }

      return savePayloadsAndDeleteTransactions(records, transactionHashList, c);
    }

    throw e;
  }
}

async function processDownloadedTransactions() {
  do {
    if (isExiting) {
      return;
    }

    const transactionsList = await sequelize.models.Transaction.findTransactionsToParseByChainId(chainId, 300);
    if (transactionsList.length == 0) {
      logger.trace('Zero transactions to parse');
      await setTimeout(INTERVAL_BETWEEN_ZERO_TRANSACTIONS_TO_PARSE);
      continue;
    }

    const webhooks = await loadWebhooks();

    logger.trace(`Found ${transactionsList.length} transactions to parse for ${webhooks.length} webhooks`);

    const payloadList = [];

    for (const transaction of transactionsList) {
      parse(transaction.json, webhooks, payloadList)
    }

    const records = createPayloads(payloadList);

    await savePayloadsAndDeleteTransactions(records, transactionsList.map(t => t.transactionHash));

    if (isExiting) {
      return;
    }

    await setTimeout(INTERVAL_BETWEEN_TRANSACTIONS_TO_PARSE);
  } while (!isExiting);
}

function localCreateLogger() {
  logger = createLogger('parser-' + chainIdHr());
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

if (process.send) {
  process.send('ready');
}

logger.debug(`Started with chainId=${chainIdHr()}`);

await processDownloadedTransactions();

logger.debug(`Done, closing db`);

await sequelize.close();

logger.debug(`Db closed, exit`);
process.exit(0);
