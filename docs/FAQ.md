# FAQ

## How do I test my webhook to make sure it's all working?

See [Testing webhooks](/docs/TestingWebhooks.md).

## What is the format of the JSON payload?

See [Payload format](/docs/PayloadFormat.md).

## How many confirmations are considered enough for the event to finalize?

At this point we deliver webhook immediately after we see it on the blockchain but in the near future we'll let you specify the count of confirmations to wait before delivering webhooks.

## Can I use this service for production?

At ariadne.finance we do.

## What networks are supported?

All EVM-compatible networks with typical EVM RPC endpoint.

## Are webhooks delivered one after another or in parallel?

All payloads for *a single webhook* you created in your dashboard are delivered *sequentially.* All webhooks you have added are delivered *in parallel.*

## How do I properly sort events on my side?

Use `blockNumber`, then `transactionIndex` then `logIndex`.

## How do I check for duplicate events?

Use `transactionHash` + `logIndex` as your primary key. No two events can take the same spot (`logIndex`) in the same transaction (`transactionHash`).

## What is the retry policy?

We will retry to deliver webhooks with a timeout increasing 2x (but limited to 6h) on every failure. We will give up after 48h.

**Note:** Only 200-299 HTTP status responses from your endpoint are considered a success. Any other response constitutes a failure.

## How do I get events on Proxy contracts?

Events on proxy implementation contracts are still emitted in the context of the original address although Etherscan will show you only the `ProxyUpgraded` events. What you should do is take the ABI of the actual implementation contract and paste it into Create webhook dialog instead of the one that we have automatically provided.

## How are the forks (blockchain reorgs) handled?

Not handled yet, this is why "Confirmations count" is coming soon in the webhook edit screen. For now you should query your RPC endpoint for the transaction hash after a while and make sure that it still exists.

## Will I need to run my own RPC node?

Probably yes. Currently `downloader.js` does download every block to match required events with bloom filters, so you'll have ≈7,200 RPC calls on Ethereum Mainnet and probably tens of thousands on Polygon or BSC.

## Who created 23gate?

23gate is made by the team at Ariadne Finance:

* [Egor Egorov](https://github.com/egorFiNE) me@egorfine.com
* [Roman Zhbadinskyi](https://github.com/insky) zhbadynskyi@gmail.com

## How is the code licensed?

Apache 2.0. See [LICENSE](/LICENSE).
