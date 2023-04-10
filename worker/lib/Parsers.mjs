import { getAddress } from 'ethers';
import isNumber from 'is-number';

export function parseRawTransactionReceiptFromProvider(receipt) {
  receipt.blockNumber = parseInt(receipt.blockNumber, 16);
  receipt.status = parseInt(receipt.status, 16);
  receipt.transactionIndex = parseInt(receipt.transactionIndex, 16);
  receipt.type = parseInt(receipt.type, 16);

  if (receipt.from) {
    receipt.from = getAddress(receipt.from);
  }

  if (receipt.to) {
    receipt.to = getAddress(receipt.to);
  }

  receipt.logs.forEach(log => {
    log.logIndex = parseInt(log.logIndex, 16);
    log.transactionIndex = parseInt(log.transactionIndex, 16);
    log.blockNumber = parseInt(log.blockNumber, 16);
    if (log.address) {
      log.address = getAddress(log.address);
    }
  });

  return receipt;
}

export function parseRawBlockFromProvider(rawBlock) {
  rawBlock.number = parseInt(rawBlock.number, 16);
  rawBlock.size = parseInt(rawBlock.size, 16);
  rawBlock.timestamp = parseInt(rawBlock.timestamp, 16);
  return rawBlock;
}

export function ethersNumbersToStrings(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (isNumber(value) || typeof value === 'bigint') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(ethersNumbersToStrings);
  }

  if (typeof value == 'object') {
    return Object.fromEntries(
      Object
        .entries(value)
        .map(([ key, _value ]) => [ key, ethersNumbersToStrings(_value) ])
    );
  }

  return value;
}
