<template>
  <alert-block v-if="error" type="error" class="my-5">{{ error }}</alert-block>

  <div v-else class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 tabular-nums">
    <div v-for="item in chain" :key="item.chainId" class="relative overflow-hidden rounded-lg px-4 pt-4 pb-4 shadow sm:px-6 sm:pb-5 bg-slate-100/50">
      <div class="flex space-x-4 mb-3">
        <div class="grow text-sm text-slate-500 font-medium">
          {{ item.title }}
        </div>
        <div class="text-xs text-slate-300">
          {{ item.chainIdHr }}
        </div>
      </div>

      <div class="flex space-x-4">
        <img :src="item.icon" class="shrink-0 rounded-md h-12 w-12" alt="item.title">
        <div class="grow flex flex-col justify-between">
          <div class="text-sm leading-none text-slate-400 mt-1.5">At block</div>
          <div class="text-2xl leading-none font-semibold text-slate-900">{{ item.blockNumber }}</div>
        </div>
        <div class="text-right shrink-0 flex flex-col justify-between">
          <div class="text-sm leading-none" :class="item.isOutdated ? 'text-red-600' : 'text-green-600'">{{ unixtimeToAgeHr(item.updatedAt) }}</div>
          <div class="text-xs leading-none text-slate-400 font-semibold">{{ formatUnixtimeToDate(item.updatedAt) }}</div>
          <div class="text-xs leading-none text-slate-400 font-semibold">{{ formatUnixtimeToTime(item.updatedAt) }}</div>
        </div>
      </div>

      <div v-if="false" class="flex w-full mt-4 text-xs text-slate-400 justify-between">
        <div>
          <div>
            Delivered
          </div>
          <div class="text-slate-500">
            111
          </div>
        </div>

        <div>
          <div>
            Transactions
          </div>
          <div class="text-slate-500">
            22
          </div>
        </div>

        <div>
          <div>
            Events
          </div>
          <div class="text-slate-500">
            33
          </div>
        </div>
      </div>

      <div v-if="false" class="mt-3 pt-2 border-t">
        <span class="text-xs text-slate-400 mr-2">
          Something
        </span>
        <span class="text-xs text-slate-500">
          111
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import AlertBlock from '@/components/AlertBlock.vue';
import { networkByChainId } from '@common/networks';
import { shallowRef, onBeforeUnmount } from 'vue';
import { dayjs, unixtime } from '@/useDayjs';

const RELOAD_TIMEOUT = 10 * 1000;

const error = shallowRef(null);
const chain = shallowRef([]);
const now = shallowRef(unixtime());

let timeout = null;
const interval = setInterval(() => {
  now.value = unixtime();
}, 1000)



onBeforeUnmount(() => {
  clearTimeout(timeout);
  clearInterval(interval);
});

async function get() {
  error.value = null;

  let response;
  try {
    response = await fetch('/api-public/stats/');

  } catch (error) {
    error.value = "Cannot load status";
    chain.value = [];
    setTimeout(get, RELOAD_TIMEOUT);
    return;
  }

  let json = null;
  try {
    json = await response.json();

  } catch (error) {
    error.value = "Cannot parse JSON";
    chain.value = [];
    setTimeout(get, RELOAD_TIMEOUT);
    return;
  }

  if (json.chain) {
    const now = unixtime();

    json.chain.forEach(entry => {
      entry.chainIdHr = '0x' + entry.chainId.toString(16);
      entry.icon = networkByChainId[entry.chainId]?.icon || null;
      entry.title = networkByChainId[entry.chainId]?.title || null;
      entry.isOutdated = now - entry.updatedAt >= networkByChainId[entry.chainId]?.outdatedThresholdSeconds;
    });

    chain.value = json.chain;

  } else {
    chain.value = [];
  }

  timeout = setTimeout(get, RELOAD_TIMEOUT);
}

get();

function formatUnixtimeToDate(timestamp) {
  return dayjs.unix(timestamp).format('YYYY-MM-DD');
}

function formatUnixtimeToTime(timestamp) {
  return dayjs.unix(timestamp).format('HH:mm:ss');
}

function unixtimeToAgeHr(timestamp) {
  const diffSeconds = now.value - timestamp;
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  return dayjs.unix(timestamp).fromNow();
}
</script>
