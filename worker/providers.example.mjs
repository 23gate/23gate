export const providers = {
  // chainId
  0x38: [
    {
      // RPC provider URL
      url: 'http://...',

      // Set to true if the provider supports the `eth_getBlockReceipts` method. Hint: `geth` does not while `erigon` does. Quicknode does as well.
      useGetBlockReceipts: true,

      // Poll the RPC provider this often. Set to slightly more than the block time of the network if you are running your own node or 15-30s if not.
      pollInterval: '14s',

      // After how many seconds since the last successful block increment we should abandon this RPC provider and switch to another one.
      blockExpirationTimeout: '75s',

      // Set to false to temporarily disable
      isEnabled: true
    },

    // multiple providers are supported
  ]
};
