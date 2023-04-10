# Testing webhooks

How to make sure your code is okay before going to production

## Testing your endpoint

Before going live you would want to test how is your endpoint actually performing.

There is a "Test" button in the "Create webhook" dialog. It sends you a dummy payload with random values roughly corresponding to the expected event payload. We will then show you the results of a single delivery attempt.

A few things to note regarding test payloads:

1. The payload will contain `isLive: false` key in order to distinguish it from actual live events which will have `isLive: true`.
2. `webhookId` is set to 0.
3. Authorization header is signed with `slavaukraini` secret instead of your actual user secret.
4. `args` will NOT contain emulated values but rather a static dummy value. Please accommodate that in your webhook handler.

## Testing live actual events

You can use a wonderful https://webhook.site to see the actual webhook payload format before pointing the app to your endpoint.
