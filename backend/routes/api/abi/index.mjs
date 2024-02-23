import { getAbi } from '../../../helpers/etherscan.mjs';
import { ethers } from 'ethers';

export default async function routes(instance) {
  instance.get(
    '/',

    {
      schema: {
        query: {
          type: 'object',
          properties: {
            chainId: {
              type: 'number'
            },
            address: {
              type: 'string'
            }
          },
          required: [ 'address', 'chainId' ]
        }
      }
    },

    async request => {
      let address;

      try {
        address = ethers.getAddress(request.query.address);
      } catch {
        return { success: false, message: "Failed to parse address" };
      }

      if (process.env.NODE_ENV !== 'production') {
        // emulate BUSD as unverified
        if (address === '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56') {
          return { success: true, abi: null };
        }
      }

      const result = await getAbi(address, request.query.chainId);
      if (!result) {
        return { success: false, message: "Unknown network" };
      }

      return result;
    }
  );
}
