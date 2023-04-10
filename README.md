# 23gate

**23gate delivers blockchain Events as webhooks.**

23gate is watching for Solidity and Vyper events of your choice and deliver webhooks to your app. We take care of managing confirmations and recovert. You will receive a reliable, clean webhook once the event has definitely happened, and we go the extra mile to ensure that we never miss any.

# Installation

You will need recent node.js and perhaps your own RPC provider(s). You will need a fairly recent MySQL instance running.

Note: MySQL is mandatory because we use the full-text index for certain features. It should not be very hard to port this code to other SQL databases, just haven't been done yet.

## Web backend

Prepare MySQL database with login, password and database name. Signup for etherscan instances for networks that you want to run 23gate on.

In `backend/`:

1. Copy `etherscans.example.json` to `etherscans.json`. Edit the file and replace `REPLACE_ME` with your own API key for every network you would like to run on.
2. Copy `.env_example` to `.env`. Edit the file and put MySQL connection string into it.
3. `npm --only=prod install` to install required node packages.
4. Run `sync.mjs` to create database.


## Workers

In `worker/`:

1. Copy `providers.example.mjs` to `providers.mjs`. Edit RPC providers list and their configuration.
2. Copy `.env_example` to `.env`. Edit `.env`. Make sure that `LOG_DIR` folder exists.
3. `npm --only=prod install` to install required node packages.


## Web frontend

Web is already built in `frontend-dist/`. Should you need to rebuild, follow these steps in `frontend/`:

1. `npm install`
2. `npm run build`


# Start web

In `backend/` run `node index.mjs`. You should be able to open web, login and start creating your webhooks.


# Start workers

In `worker/` run the following for every network you want to run on:

```
node downloader.mjs CHAIN_ID
node parser.mjs CHAIN_ID
```

For example,

```
node downloader.mjs 0x89
node parser.mjs 0x89
```

Run the sender, a single instance for all chains:

```
node sender.mjs
```

# Support

Open issues here.