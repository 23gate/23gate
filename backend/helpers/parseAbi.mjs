import { ethers } from 'ethers';

export function parseAbi(contractAbi) {
  if (!contractAbi) {
    return null;
  }

  let contractInterface;
  try {
    contractInterface = new ethers.Interface(contractAbi);
  } catch (error) {
    return null;
  }

  return contractInterface;
}
