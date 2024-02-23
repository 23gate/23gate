<template>
  <page-header title="Webhooks">
    <router-link
      to="/webhook/"
      class="btn-primary ml-auto h-10"
    >
      <font-awesome-icon icon="fa-solid fa-circle-plus" class="-ml-1 mr-2 h-4 w-4" />
      Create
    </router-link>
  </page-header>

  <webhook-empty v-if="isEmpty && search === null" />

  <template v-else>
    <div class="flex justify-between mb-4">
      <input-search v-model="search" class="max-w-lg grow" />

      <reload-button class="ml-4" @click="reloadGrid" />
    </div>

    <grid
      ref="webhooks"
      :data-handler="getWebhooks"
      :columns="columns"
      :row-class="rowClass"
      @delete="deleteWebhook"
      @toggle="toggleIsEnabled"
    />
  </template>
</template>

<script setup>
import Grid from '@/components/Grid.vue';
import PageHeader from '@/components/PageHeader.vue';
import WebhookEmpty from '@/components/WebhookEmpty.vue';
import WebhookActions from '@/components/WebhookActions.vue';
import InputSearch from '@/components/InputSearch.vue';
import { ref, markRaw, shallowRef } from 'vue';
import { get, post, delete_ } from '@/useApi';
import { ethers } from 'ethers';
import { watchDebounced } from '@vueuse/core';
import { networkByChainId } from '@common/networks';
import ReloadButton from '@/components/ReloadButton.vue';
import { Modal } from '@/useModal';
import { $error } from '@/notify';

const webhooks = ref(null); // ref to the grid component

const isEmpty = shallowRef(false);

const search = shallowRef(null);

function reloadGrid() {
  if (webhooks.value?.reload) {
    webhooks.value.reload();
  }
}

watchDebounced(
  search,
  reloadGrid,
  { debounce: 500, maxWait: 1000 }
);

const columns = [
  {
    title: '#',
    prop: 'id',
    class: row => (row.isEnabled ? '' : '!opacity-40'),
    titleClass: '' // class for title cell
  },
  {
    title: 'Event',
    prop: 'abi',
    value: row => eventNameFromAbi(row),
    click: row => row.isEnabled && (search.value = eventNameFromAbi(row)),
    class: row => classForEventNameForRow(row),
    collapse: 'sm'
  },
  {
    title: 'Network',
    prop: 'chainId',
    value: row => networkByChainId[row.chainId]?.title,
    click: row => row.isEnabled && (search.value = networkByChainId[row.chainId]?.title),
    class: row => (row.isEnabled ? 'link-dashed' : '!opacity-40'),
    collapse: 'sm'
  },
  {
    title: 'Contract Address',
    prop: 'addressList',
    value: row => row.addressList?.join(' '),
    collapse: 'lg',
    class: row => (row.isEnabled ? '' : '!opacity-40') + ' whitespace-normal text-xs font-mono'
  },
  {
    title: 'URL',
    prop: 'url',
    collapse: 'xl',
    class: row => (row.isEnabled ? '' : '!opacity-40 ') + 'max-w-xs'
  },
  {
    class: 'no-animation text-right !max-w-max z-10 relative',
    component: markRaw(WebhookActions)
  }
];

const rowClass = null;
// const rowClass = (_row, index) => (index % 2 ? 'bg-zinc-500/10' : ''); // stripes class for row

function eventNameFromAbi(row) {
  const iface = new ethers.Interface(row.abi);
  return iface.fragments[0].name;
}

function classForEventNameForRow(row) {
  if (row.status == 'failed') {
    return 'text-red-500 !opacity-70'

  } else if (row.status == 'disabled') {
    return '!opacity-40';
  }

  return 'link-dashed';
}

async function getWebhooks({ limit, offset }) {
  const result = await get('/webhook/', {
    limit,
    offset,
    search: search.value ?? ''
  });

  if (!result) {
    return;
  }

  result.rows.forEach(row => row.isEnabled = row.status == 'enabled');

  isEmpty.value = !result.count;

  return { total: result.count, rows: result.rows };
}

async function deleteWebhook(row) {
  const confirm = await Modal.confirm({
    title: 'Delete webhook',
    body: `Are you sure you want to delete the webhook?`
  });

  if (!confirm) {
    return;
  }

  const result = await delete_(`/webhook/${row.id}`, {});

  if (!result?.success) {
    $error('Failed to delete webhook');
    return;
  }

  reloadGrid();
}

async function toggleIsEnabled({ row, index }) {
  const url = row.status == 'enabled' ? `/webhook/${row.id}/disable/` : `/webhook/${row.id}/enable/`;

  const { success, status } = await post(url, {});

  if (!success) {
    $error(`Failed to ${ status == 'enabled' ? 'enable' : 'disable'} webhook`);
    return;
  }

  webhooks.value.updateRow(index, { ...row, status, isEnabled: status == 'enabled' });

  if (status == 'enabled') {
    // updateUserProperties(); // FIXME
  }
}
</script>
