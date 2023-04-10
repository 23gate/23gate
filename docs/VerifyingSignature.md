# Verifying signature


Webhooks are delivered with a `X-Signature` header. Signature for payload version 1 is HMAC SHA384 of payload JSON string plus a period plus the `X-Timestamp` header.

Here is a sample code of signature validation in node.js:

```javascript
function verifySignature(payload, userSecret, xSignatureHeader, xTimestampHeader) {
  // Stringify payload with *NO* formatting
  const payloadJsonString = JSON.stringify(payload);

  // Make a string out of stringified payload and the timestamp HTTP header
  const signatureVerificationString = payloadString + '.' + xTimestampHeader;

  // Calculate the correct signature
  const correctSignature = crypto
    .createHmac('sha384', userSecret)
    .update(signatureVerificationString)
    .digest('base64');

  // Check if the received signature equals to the correct one
  return correctSignature == xSignatureHeader;
}
```

**Note:** bear in mind the `X-Timestamp` header which contains the timestamp of the HTTP request in **milliseconds.** It's a good practice to check if the request came just recently in order to prevent replay attacks. [Read more about replay in webhooks](https://webhooks.fyi/security/replay-prevention).
