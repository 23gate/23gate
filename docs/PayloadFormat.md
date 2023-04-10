# Payload format

Here's an example for a typical ERC20 `Approval` event:

```json
{
  "v": 1,

  "isLive": true,

  "webhookId": 333,

  "event": {
    "address": "0x55d398326f99059fF775485246999027B3197955",
    "logIndex": 413,
    "name": "Approval",
    "args": {
      "owner": "0x7B147033004bF1cE612A882F7A86Bf5D44a43A65",
      "spender": "0xC01B5257e5c429CAC258B150FE8F2d7D241a09C9",
      "value": "10000000000000000000000000"
    }
  },

  "transaction": {
    "chainId": 56,
    "from": "0x7B147033004bF1cE612A882F7A86Bf5D44a43A65",
    "to": "0x55d398326f99059fF775485246999027B3197955",
    "transactionIndex": 108,
    "transactionHash": "0x5581f46543135da144167e4ef4ef665d4aebcdc9a6d8b58c9bca3c9e3ce5ae19",
    "blockNumber": 23475325
  }
}
```

`v` payload version format, currently `1`.

`isLive` always true for real live payloads as compared to test payloads sent from the "create webhook" page.

`webhookId` is the unique id of the webhook being sent. Note: it is NOT a sequential payload id but rather the id of your webhook settings in the app UI.

`transaction` transaction properties this event was generated from. Fields are self-explanatory.

`event` actual EVM event data:

`event.address` address that generated the event. Please note that this could be different from the transaction sender.

`event.name` event name as parsed by the ABI you have provided when creating webhook.

`event.logIndex` order of the event in transaction.

`event.args` event args as parsed by the ABI you have provided when creating webhook.

**Note:** only named arguments are provided in `args` in case the ABI specifies named arguments. Otherwise only numeric arguments are provided like that:

```json
{
  "v": 1,

  ...

  "event": {
    "args": {
      "0": "0x7B147033004bF1cE612A882F7A86Bf5D44a43A65",
      "1": "0xC01B5257e5c429CAC258B150FE8F2d7D241a09C9",
      "2": "10000000000000000000000000"
    }
  },
  ...
```

**Note: all Number values in args are encoded as strings.**

