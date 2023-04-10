/* eslint-disable no-undef */

import { expect } from 'chai';
import { parseRawTransactionReceiptFromProvider, parseRawBlockFromProvider, ethersNumbersToStrings } from '../lib/Parsers.mjs';

describe('parseRawTransactionReceiptFromProvider', () => {
  it('should parse raw transaction receipt from provider correctly', () => {
    const rawReceipt = {
      blockNumber: '0x11',
      status: '0x1',
      transactionIndex: '0xab',
      type: '0x0',
      from: '0xfdc65421e0bed0ca1e73ee1924fcd2b789ed6b3d',
      to: '0x047710d10640ba000a54064a8a595354cbd31571',
      logs: [
        {
          logIndex: '0x3',
          transactionIndex: '0xa',
          blockNumber: '0x11',
          address: '0x047710d10640ba000a54064a8a595354cbd31571',
        },
      ],
    };

    const parsedReceipt = parseRawTransactionReceiptFromProvider(rawReceipt);

    expect(parsedReceipt).to.deep.equal({
      blockNumber: 17,
      status: 1,
      transactionIndex: 171,
      type: 0,
      from: '0xFdC65421e0bEd0Ca1e73EE1924FCd2B789ed6B3d',
      to: '0x047710D10640bA000a54064a8a595354cBD31571',
      logs: [
        {
          logIndex: 3,
          transactionIndex: 10,
          blockNumber: 17,
          address: '0x047710D10640bA000a54064a8a595354cBD31571',
        },
      ],
    });
  });
});

describe('parseRawBlockFromProvider', () => {
  it('should parse raw block from provider correctly', () => {
    const rawBlock = {
      number: '0x1',
      size: '0x2',
      timestamp: '0x3',
      something: 'else'
    };

    const parsedBlock = parseRawBlockFromProvider(rawBlock);

    expect(parsedBlock).to.deep.equal({
      number: 1,
      size: 2,
      timestamp: 3,
      something: 'else'
    });
  });
});


describe('ethersNumbersToStrings', () => {
  it('should return the input if it is null or undefined', () => {
    expect(ethersNumbersToStrings(null)).to.equal(null);
    expect(ethersNumbersToStrings(undefined)).to.equal(undefined);
  });

  it('should convert numbers and bigint to strings', () => {
    expect(ethersNumbersToStrings(123)).to.equal('123');
    expect(ethersNumbersToStrings(123n)).to.equal('123');
  });

  it('should not modify non-number values', () => {
    expect(ethersNumbersToStrings('abc')).to.equal('abc');
    expect(ethersNumbersToStrings(true)).to.equal(true);
  });

  it('should convert numbers in arrays to strings', () => {
    const input = [1, 2, 'a', 4, 5n];
    const expected = ['1', '2', 'a', '4', '5'];
    expect(ethersNumbersToStrings(input)).to.deep.equal(expected);
  });

  it('should convert numbers in objects to strings', () => {
    const input = {
      a: 1,
      b: 'abc',
      c: 3,
      d: 4n
    };
    const expected = {
      a: '1',
      b: 'abc',
      c: '3',
      d: '4'
    };

    expect(ethersNumbersToStrings(input)).to.deep.equal(expected);
  });

  it('should handle nested objects and arrays', () => {
    const input = {
      a: 1,
      b: [ 2, 3, { c: 4 } ],
      d: { e: 5, f: [ 6n ] }
    };

    const expected = {
      a: '1',
      b: [ '2', '3', { c: '4' } ],
      d: { e: '5', f: [ '6' ] }
    };

    expect(ethersNumbersToStrings(input)).to.deep.equal(expected);
  });
});
