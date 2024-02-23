import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { parseAbi } from './parseAbi.mjs';
import * as url from 'url';

const dirname = url.fileURLToPath(new URL('.', import.meta.url));

const etherscansConfigFilename = path.join(dirname, '..', 'etherscans.json');
const abiCacheFilename = path.join(dirname, '..', 'abi-cache.json');

let cache = {};
let explorerUrlByChainId;
let isLoaded = false;

function load() {
  if (isLoaded) {
    return;
  }

  explorerUrlByChainId = JSON.parse(fs.readFileSync(etherscansConfigFilename));

  if (fs.existsSync(abiCacheFilename)) {
    cache = JSON.parse(fs.readFileSync(abiCacheFilename));
  }

  isLoaded = true;
}

function saveCache() {
  fs.writeFileSync(abiCacheFilename, JSON.stringify(cache, null, "\t") + "\n");
}

export async function getAbi(address, chainId) {
  load();

  if (!explorerUrlByChainId[chainId]) {
    return null;
  }

  const cacheKey = chainId + '-' + address;

  if (cache[cacheKey]) {
    let implementationEvents;
    if (cache[cacheKey].implementation) {
      const result = await getAbi(cache[cacheKey].implementation, chainId);
      implementationEvents = result.events;
    }
    return { success: true, events: { ...cache[cacheKey], implementationEvents } };
  }

  const explorerUrl = explorerUrlByChainId[chainId].replace('%ADDRESS%', address);

  let response;
  try {
    response = await fetch(explorerUrl);
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to fetch contract ABI from Etherscan" };
  }

  let abiJson;
  try {
    abiJson = await response.json();
  } catch (error) {
    console.log(error);
    return { success: false, message: "Failed to get contract ABI from Etherscan" };
  }

  if (abiJson.status === '0') {
    return { success: false, message: "Failed to get contract ABI from Etherscan" };
  }

  if (abiJson.status !== '1') {
    console.log(`Fetch contract ABI from Etherscan error: status '${abiJson.status}', message '${abiJson.message}'`);
    return { success: false, message: "Fetched contract ABI from Etherscan with wrong status" };
  }

  if (!abiJson.result?.[0]) {
    return { success: false, message: "Failed to get contract ABI from Etherscan" };
  }

  let implementationEvents;
  if (abiJson.result[0].Implementation) {
    const result = await getAbi(abiJson.result[0].Implementation, chainId);
    implementationEvents = result.events;
  }

  const parsedAbi = parseAbi(abiJson.result[0].ABI);
  if (!parsedAbi) {
    return { success: false, message: "Cannot parse ABI" };
  }

  const eventFragments = parsedAbi.fragments.filter(f => ethers.Fragment.isEvent(f));
  if (eventFragments.length === 0) {
    return { success: false, message: "Zero events in ABI" };
  }

  const events = eventFragments.map(f => f.format('full'));

  cache[cacheKey] = { events, implementation: abiJson.result[0].Implementation }; // eslint-disable-line require-atomic-updates
  saveCache();

  return { success: true, events: { ...cache[cacheKey], implementationEvents } };
}
