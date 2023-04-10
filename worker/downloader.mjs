import 'dotenv/config';
import ms from 'ms';
import got from 'got';
import https from 'https';
import http from 'http';
import { sequelize } from '../backend/models/index.mjs';
import { setTimeout } from 'node:timers/promises';
import { createLogger } from './lib/Logger.mjs';
import { providers } from './providers.mjs';
import { ethers } from 'ethers';
import { isContractAddressInBloom, isTopicInBloom } from 'ethereum-bloom-filters';
import { parseRawTransactionReceiptFromProvider, parseRawBlockFromProvider } from './lib/Parsers.mjs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const GETTRANSACTIONRECEIPT_RETRY_INTERVAL = ms('3s');
const GETTRANSACTIONRECEIPT_RETRY_COUNT = 5;

const PROVIDER_HTTP_REQUEST_TIMEOUT = ms('10s');
const PROVIDER_HTTP_RETRY_DELAY = ms('6s');
const PROVIDER_HTTP_RETRY_COUNT = 5;
const PROVIDER_KEEPALIVE_TIMEOUT = ms('60s');

const DEFAULT_PROVIDER_BLOCK_EXPIRATION_TIMEOUT = '90s';
const DEFAULT_PROVIDER_POLL_INTERVAL = '10s'

const PAUSE_ON_PROVIDER_SWITCH_TIMEOUT = ms('10s');

const DEADLOCK_INTERVAL = 100;

let agent = null;

let isExiting = false;

let chainId = null;
let logger = null;

let providerConfig = null;
let providerConfigIndex = 0;

let providerSendId = 1;

const gotInstance = got.extend({
  timeout: {
    request: PROVIDER_HTTP_REQUEST_TIMEOUT
  },

  followRedirect: false,

  throwHttpErrors: false,

  retry: {
    methods: [ 'POST' ],
    statusCodes: [
      401, 403, 404, 408, 413, 429,
      500, 502, 503, 504, 521, 522, 524
    ],
    errorCodes: [
      'ETIMEDOUT',
      'ECONNRESET',
      'EADDRINUSE',
      'ECONNREFUSED',
      'EPIPE',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN'
    ],
    limit: PROVIDER_HTTP_RETRY_COUNT,
    maxRetryAfter: undefined,
    calculateDelay: retryObject => retryObject.attemptCount >= retryObject.retryOptions.limit ? 0 : PROVIDER_HTTP_RETRY_DELAY,
    backoffLimit: PROVIDER_HTTP_RETRY_DELAY,
    noise: 100
  },

	hooks: {
		afterResponse: [
			(response, retryWithMergedOptions) => {
        if (response.headers['content-type'] !== 'application/json') {
					return retryWithMergedOptions({});
        }

				return response;
			}
		]
	},
	mutableDefaults: true
});

function hexNumber(num) {
  return '0x' + num.toString(16);
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

  const uniques = {};

  for (const webhook of webhooks) {
    const abi = new ethers.Interface(webhook.abi);

    const topic0 = abi.fragments[0].topicHash;
    const address = sequelize.models.Webhook.parseAddressListString(webhook.addressList)[0]; // FIXME remove support for multiple addresses?

    uniques[topic0 + '-' + address] = [topic0, address];
  }

  return Object.values(uniques);
}

function parseProviders() {
  for (const _providers of Object.values(providers)) {
    for (const provider of _providers) {
      provider.pollInterval = ms(provider.pollInterval || DEFAULT_PROVIDER_POLL_INTERVAL);
      provider.blockExpirationTimeout = ms(provider.blockExpirationTimeout || DEFAULT_PROVIDER_BLOCK_EXPIRATION_TIMEOUT);
    }
  }

  for (const chainId of Object.keys(providers)) {
    providers[chainId] = providers[chainId].filter(p => p.isEnabled);
  }
}

async function providerSend(method, params = [], c = 0) {
  // the same retry delay and retries count is applied for non-json responses
  if (c >= PROVIDER_HTTP_RETRY_COUNT) {
    return null;
  }

  if (c > 0) {
    await setTimeout(PROVIDER_HTTP_RETRY_DELAY);
  }

  let response = null, responsePromise;

  try {
    responsePromise = gotInstance(providerConfig.url, {
      method: 'POST',

      agent,

      json: {
        method,
        params,
        id: providerSendId++,
        jsonrpc: '2.0'
      }
    });

    response = await responsePromise;

  } catch (e) {
    logger.error(`Failed request method=${method}, params=${JSON.stringify(params)}, error.code=${e.code}`);
    return null;
  }

  if (!response?.ok) {
    logger.error(`Failed request method=${method}, params=${JSON.stringify(params)}, response.status=${response.statusCode}`);
    return null;
  }

  try {
    return await responsePromise.json();

  } catch (e) {
    logger.error(`Can't parse JSON response method=${method}, params=${JSON.stringify(params)}, response.status=${response.statusCode}, response.body=${response.body}, will retry`);
    return await providerSend(method, params, c + 1);
  }
}

async function eth_getTransactionReceipt(transactionHash) {
  const response = await providerSend('eth_getTransactionReceipt', [ transactionHash ]);
  return response ? parseRawTransactionReceiptFromProvider(response.result) : undefined;
}

async function eth_getBlock(blockNumber) {
  const response = await providerSend('eth_getBlockByNumber', [ hexNumber(blockNumber), false ]);
  return response ? parseRawBlockFromProvider(response.result) : undefined;
}

async function eth_getBlockReceipts(blockNumber) {
  const response = await providerSend('eth_getBlockReceipts', [ hexNumber(blockNumber) ]);
  return response ? response.result.map(parseRawTransactionReceiptFromProvider) : undefined;
}

async function net_version() {
  const response = await providerSend('net_version');
  return response ? parseInt(response?.result) : undefined;
}

async function eth_getBlockNumber() {
  const response = await providerSend('eth_blockNumber');
  return response ? parseInt(response.result) : undefined;
}

async function downloadReceiptsForBlock(block) {
  if (providerConfig.useGetBlockReceipts) {
    return await downloadReceiptsForBlockViaGetBlockReceipts(block);
  }

  return await downloadReceiptsForBlockViaGetBlockAndTransactions(block);
}

async function getTransactionReceipts(transactionHashList, blockNumber) {
  const receiptByTransactionHash = {};

  let retryCount = 0;
  let currentTransactionHashList = Array.from(transactionHashList);

  do {
    if (isExiting) {
      return null;
    }

    logger.trace(`Will download ${currentTransactionHashList.length} transactions`);
    const results = await Promise.allSettled(currentTransactionHashList.map(eth_getTransactionReceipt));
    logger.trace(`Downloaded ${results.length} results`);

    const isThereRejectedResults = results.find(result => result.status == 'rejected');
    if (isThereRejectedResults) {
      logger.fatal("Rejected promises found on eth_getTransactionReceipt, must never happen");
      return undefined;
    }

    const downloadedHashes = currentTransactionHashList;
    currentTransactionHashList = [];

    results.forEach(({ value: receipt }, index) => {
      if (receipt === undefined || receipt === null) { // failed to download or not found
        currentTransactionHashList.push(downloadedHashes[index]);
      } else {
        receiptByTransactionHash[receipt.transactionHash] = receipt;
      }
    });

    if (currentTransactionHashList.length > 0) {
      logger.debug(
        currentTransactionHashList,
        `Undownloaded transactions for ${currentTransactionHashList.length}/${transactionHashList.length} transactions for block ${blockNumber} at try ${retryCount}`
      );

      if (retryCount++ >= GETTRANSACTIONRECEIPT_RETRY_COUNT) {
        logger.warn(`I give up on ${currentTransactionHashList.length}/${transactionHashList.length} for block=${blockNumber}`);
        break;
      }

      await setTimeout(GETTRANSACTIONRECEIPT_RETRY_INTERVAL);
    }
  } while (currentTransactionHashList.length);

  return transactionHashList
    .map(transactionHash => receiptByTransactionHash[transactionHash])
    .filter(r => Boolean(r));
}

async function downloadReceiptsForBlockViaGetBlockAndTransactions(block) {
  const receipts = await getTransactionReceipts(block.transactions, block.number);

  if (receipts === undefined) {
    return undefined;
  }

  const nonEmptyReceipts = receipts.filter(receipt => receipt.logs?.length > 0);

  logger.trace(`getTransactionReceipt block ${block.number}: got ${nonEmptyReceipts.length} receipts with logs`);

  return nonEmptyReceipts;
}

async function downloadReceiptsForBlockViaGetBlockReceipts(block, c = 0) {
  if (c >= GETTRANSACTIONRECEIPT_RETRY_COUNT) {
    return undefined;
  }

  const receipts = await eth_getBlockReceipts(block.number);

  if (receipts === undefined) {
    return undefined;
  }

  if (receipts === null) {
    await setTimeout(GETTRANSACTIONRECEIPT_RETRY_INTERVAL);
    return await downloadReceiptsForBlockViaGetBlockReceipts(block, c + 1);
  }

  const nonEmptyReceipts = receipts.filter(receipt => receipt?.logs?.length > 0);
  logger.trace(`eth_getBlockReceipts ${block.number}: got ${nonEmptyReceipts.length} receipts with logs`);
  return nonEmptyReceipts;
}

async function saveTransactions(receipts, blockNumber, c = 0) {
  if (c > 0) {
    await setTimeout(DEADLOCK_INTERVAL);
  }

  c++;

  const startedAt = Date.now();

  try {
    await sequelize.transaction(async transaction => {
      if (receipts?.length > 0) {
        await sequelize.models.Transaction.ingestReceiptsForChainId(receipts, chainId, transaction);
      }
      await sequelize.models.Chain.setByChainId(
        chainId,
        {
          blockNumber
        },
        transaction
      );
    });

  } catch (e) {
    if (e.parent?.code == 'ER_LOCK_DEADLOCK') {
      logger.warn(`ingestReceiptsForChainId DEADLOCKED in ${Date.now() - startedAt}ms at try ${c}`);
      return saveTransactions(receipts, blockNumber, c);
    }

    throw e;
  }
}

let lastBlockNumber = 0;
let lastBlockNumberAt = 0;

async function downloadTransactions() {
  do {
    if (isExiting) {
      return;
    }

    const blockNumber = await eth_getBlockNumber();

    if (isExiting) {
      return;
    }

    logger.trace(`Got block ${blockNumber}`);

    if (blockNumber > lastBlockNumber) {
      lastBlockNumberAt = Date.now();
    }

    const diffMs = Date.now() - lastBlockNumberAt;
    if (diffMs >= providerConfig.blockExpirationTimeout) {
      logger.warn(`Expired block=${blockNumber} at=${lastBlockNumberAt}`);
      return;
    }

    if (!blockNumber) {
      logger.error(`Got undefined block, retrying`);
      await setTimeout(providerConfig.pollInterval);
      continue;
    }

    if (blockNumber <= lastBlockNumber) {
      logger.debug(`Got block=${blockNumber} which is <= previous block=${lastBlockNumber}`);
      await setTimeout(providerConfig.pollInterval);
      continue;
    }

    logger.trace(`Will download blocks ${lastBlockNumber + 1} .. ${blockNumber}`);

    const topicsAndAddressList = await loadWebhooks();

    for (let currentBlockNumber = lastBlockNumber + 1; currentBlockNumber <= blockNumber; currentBlockNumber++) {
      if (isExiting) {
        return;
      }

      const result = await downloadBlock(currentBlockNumber, topicsAndAddressList);
      if (!result) {
        return;
      }

      lastBlockNumber = currentBlockNumber; // eslint-disable-line require-atomic-updates
    }

    if (!isExiting) {
      await setTimeout(providerConfig.pollInterval);
    }
  } while (!isExiting);
}

async function downloadBlock(blockNumber, topicsAndAddressList) {
  const block = await eth_getBlock(blockNumber);
  if (!block) {
    logger.fatal(`Couldn't download block ${blockNumber}`);
    return false;
  }

  if (isExiting) {
    return false;
  }

  let receipts = null;

  if (block.transactions.length > 0) {
    const shouldDownload = topicsAndAddressList.find(([ topic0, address ]) => isContractAddressInBloom(block.logsBloom, address) && isTopicInBloom(block.logsBloom, topic0));
    if (shouldDownload) {
      logger.trace(`Downloading block=${block.number}`);

      receipts = await downloadReceiptsForBlock(block);

      if (receipts === undefined) {
        logger.fatal(`Couldn't download block receipts`);
        return false;
      }
    }
  }

  await saveTransactions(receipts, block.number);

  logger.trace(`Synced block ${block.number} with ${receipts?.length || 'zero'} receipts`);

  return true;
}

function localCreateLogger() {
  logger = createLogger('downloader-' + '0x' + chainId.toString(16));
}

function initHttpAgent() {
  const agentOptions = {
    keepAlive: true,
    keepAliveMsecs: PROVIDER_KEEPALIVE_TIMEOUT,
    maxSockets: 50
  };

  if (providerConfig.url.startsWith('https')) {
    agent = {
      https: new https.Agent(agentOptions)
    };

  } else {
    agent = {
      http: new http.Agent(agentOptions)
    };
  }
}

async function switchProviderConfig() {
  providerConfig = providers[chainId][providerConfigIndex];
  providerConfigIndex++;

  if (providerConfigIndex == providers[chainId].length) {
    providerConfigIndex = 0;
  }

  initHttpAgent();

  logger.info(`Switched to ${providerConfig.url}`);

  const netVersion = await net_version();
  if (netVersion !== chainId) {
    logger.fatal(`net_version=${netVersion} while chainId=${chainId} for provider url=${providerConfig.url}`);
    process.exit(0);
  }
}

const argv = yargs(hideBin(process.argv))
  .wrap(180)
  .command('* <chainId>', "run", yargs => {
    yargs.positional('chainId', {
      describe: 'chainId',
      type: 'number'
    })
  })
  .parse();

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

process.on('SIGUSR1', () => {
  logger.warn('SIGUSR1');
  switchProviderConfig();
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

parseProviders();

chainId = argv.chainId;

localCreateLogger();

switchProviderConfig();

logger.debug(`Started with rpc=${providerConfig.url}`);

lastBlockNumber = await sequelize.models.Chain.getLastSyncedBlockByChainId(chainId);

// first ever launch on a blockchain
if (lastBlockNumber == 0) {
  lastBlockNumber = await eth_getBlockNumber();

  if (!lastBlockNumber) {
    logger.fatal(`Can't get last block number from provider on initial start, exit`);
    process.exit(2);
  }
}

lastBlockNumberAt = Date.now();

logger.info(`Starting with last block number=${lastBlockNumber}`);

if (process.send) {
  process.send('ready');
}

do {
  await downloadTransactions();
  if (isExiting) {
    break;
  }

  await switchProviderConfig();
  await setTimeout(PAUSE_ON_PROVIDER_SWITCH_TIMEOUT);
} while (!isExiting);

logger.debug(`Done, closing db`);

await sequelize.close();

logger.debug(`Db closed, exit`);
process.exit(0);
