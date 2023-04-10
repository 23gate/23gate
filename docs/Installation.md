# Installation

This is quite a typical Single-Page Application (SPA) built on Node.js backend with a Vue.js-powered frontend.

In order to run 23gate you will need:

1. An RPC provider for every network you are interested in. We strongly recommend running your own instance for high-traffic events monitoring.
2. Recent node.js installed.
3. MySQL up and running with a separate database created for the application.
4. API keys for all Etherscan instances on networks that you want to run 23gate on. This is required for ABI fetching.

Note: MySQL is mandatory because we use the full-text index for certain features. It should not be very hard to port this code to other SQL databases, this just haven't been done yet.

## Prepare

### Web backend

In `backend/`:

1. Copy `etherscans.example.json` to `etherscans.json`. Edit the file and replace `REPLACE_ME` with your own API key for every network you would like to run on.
2. Copy `.env_example` to `.env`. Edit the file and put MySQL connection string into it.
3. `npm --only=prod install` to install required node packages.
4. Run `sync.mjs` to create database.


### Workers

In `worker/`:

1. Copy `providers.example.mjs` to `providers.mjs`. Edit RPC providers list and their configuration.
2. Copy `.env_example` to `.env`. Edit `.env`. Make sure that `LOG_DIR` folder exists.
3. `npm --only=prod install` to install required node packages.


### Web frontend

Web is already built in `frontend-dist/`. Should you need to rebuild, follow these steps in `frontend/`:

1. `npm install`
2. `npm run build`


## Run

### Start backend

In `backend/` run `node index.mjs`. You should be able to open web, login and start creating your webhooks.


### Start workers

In `worker/` run the following for every network you want to run on:

```
node downloader.mjs CHAIN_ID
node parser.mjs CHAIN_ID
```

Replace `CHAIN_ID` with the actual chain id. For example,

```
node downloader.mjs 0x89
node parser.mjs 0x89
```

Run the sender, a single instance for all chains:

```
node sender.mjs
```
