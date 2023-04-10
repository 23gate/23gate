# Quickstart

*23gate: we deliver EVM blockchain Events as webhooks*

It looks deceptively simple to watch for Solidity Events on EVM blockchains, but it's actually quite a complicated task.

Why?

* RPC endpoints often disconnect, leading to missed blocks and messed up Events;
* You'd have to keep track of networks forks on your own;
* You'd have to keep track of blocks scanned and transactions parsed;
* You'd have to wait for count of confirmations;
* You'd need to store local state in your application in order to track all of the above.

23gate handles all the edge cases and sends you a clear webhook when the Event definitely happened.

## Quickstart in 3 easy steps

0. Install the application on your server as per [Installation](/docs/Installation.md).

1. Launch this sample node.js code on your externally accessible server:

<details>
<summary>Sample webhook listener</summary>

```javascript
import http from 'node:http';

// Create a local server to receive data from
const server = http.createServer();

// Listen to the request event
server.on('request', (request, response) => {
  // Ignore everything that is not a webhook request
  if (request.url !== '/event' || request.method !== 'POST') {
    response.writeHead(404);
    response.end();
    return;
  }

  // Download all POST data (assume it's json)
  let body = '';
  request.on('data', chunk => body += chunk.toString());

  request.on('end', () => {
    // Display webhook event
    console.log(JSON.parse(body));

    // Signal success so that webhook isn't delivered once again
    response.writeHead(200);
    response.end('OK');
  });
});

// listen on port 8888
server.listen(8888);
```
</details>

Or the same code but also with signature verifications:

<details>
<summary>Sample webhook listener with signature verifications</summary>

```javascript
import http from 'node:http';

// Create a local server to receive data from
const server = http.createServer();

// Listen to the request event
server.on('request', (request, res) => {

  // Ignore everything that is not a webhook request
  if (request.url !== '/event' || request.method !== 'POST') {
    res.writeHead(404);
    res.end();
    return;
  }

  // Download all POST data (assume it's json)
  let body = '';
  request.on('data', chunk => body += chunk.toString());

  request.on('end', () => {
    // Display webhook event
    console.log(JSON.parse(body));

    // Make a string out of stringified payload and the timestamp HTTP header
    const stringToDigest = body + '.' + request.headers['x-timestamp'];

    // Calculate the correct signature
    const correctSignature = crypto
      .createHmac('sha384', 'slavaukraini') // Note: this is default secret for test webhooks
      .update(stringToDigest)
      .digest('base64');

    // Check if the received signature equals to the correct one
    if (correctSignature == request.headers['x-signature']) {
      // Signal success so that webhook isn't delivered once again
      res.writeHead(200);
      res.end('OK');
      return;
    }

    // Signature validation failed.
    res.writeHead(401);
    res.end('FAIL');
  });
});

const port = 8888;

// listen
server.listen(port);

console.log(`Example webhook server with signature validation is listening on http://<YOUR_IP>:${port}/event`);
```
</details>

2. Head over to your installed app and create a webhook that listens for the **Approval** event on contract `0x55d398326f99059fF775485246999027B3197955` (USDT) on the **BNB Chain.** Then, type in the proper **Endpoint URL** of your recently launched server.

> Can't launch a server right now? No problem: use the wonderful https://webhook.site/ service for testing.

3. In just a few seconds, you'll see incoming webhook notifications of the USDT approvals happening on the BNB Chain.

## Important pages

1. [FAQ](/docs/FAQ.md)
2. [Payload format](/docs/PayloadFormat.md)
