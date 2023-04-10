import { ethers } from 'ethers';

export function parseAbi(contractAbiString) {
  const _contractAbiString = (contractAbiString || '').trim();

  if (_contractAbiString.length == 0) {
    return null;
  }

  let abi = null;

  if (_contractAbiString.startsWith('[')) {
    abi = _contractAbiString;

  } else {
    abi = _contractAbiString
      .split(/\n/)
      .filter(Boolean)
      .map(line => line.replaceAll(';', '').trim());
  }

  try {
    return new ethers.Interface(abi);
  } catch {
    return null;
  }
}
