<template>
  <page-header title="Archive" />

  <div class="flex justify-between mb-4">
    <input-search v-model="search" class="max-w-lg grow" />

    <reload-button class="ml-4" @click="reload" />
  </div>

  <grid
    ref="payloads"
    :data-handler="getPayload"
    :columns="columns"
    @view="viewPayload"
  />
</template>

<script setup>
import PageHeader from '@/components/PageHeader.vue';
import InputSearch from '@/components/InputSearch.vue';
import ReloadButton from '../components/ReloadButton.vue';
import Grid from '@/components/Grid.vue';
import PayloadActions from '@/components/PayloadActions.vue';
import PayloadDialog from '@/components/PayloadDialog.vue';
import { Modal } from '@/useModal';
import { get } from '@/useApi';
import { formatISOToFullDate } from '@/useDayjs';
import { networkByChainId } from '@common/networks';
import { ref, computed, markRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDebounceFn } from '@vueuse/core'

const router = useRouter();
const route = useRoute();

const setSearch = useDebounceFn(value => {
  const query = { ...route.query };
  if (value) {
    query.search = value;
  } else {
    delete query.search;
  }
  router.replace({ query });
}, 500)

const search = computed({
  get() {
    return route.query?.search || null;
  },
  set(value) {
    setSearch(value);
  }
});

const payloads = ref(null); // ref to the grid component

const columns = [
  {
    title: "Webhook",
    prop: 'webhookId',
    value: row => '#' + row.webhookId
  },
  {
    title: 'Event',
    prop: 'eventName',
    click: row => search.value = row.eventName,
    class: 'link-dashed',
    collapse: 'md'
  },
  {
    title: "Network",
    prop: 'chainId',
    value: row => networkByChainId[row.chainId]?.title,
    click: row => search.value = networkByChainId[row.chainId]?.title,
    class: 'link-dashed',
    collapse: 'md'
  },
  {
    title: 'Tx Hash',
    prop: 'transactionHash',
    click: row => window.open(networkByChainId[row.chainId].explorerUrl + row.transactionHash, '_blank'),
    class: 'link-dashed link-external font-mono text-xs max-w-xs md:max-w-0',
    collapse: 'md'
  },
  {
    title: 'Address',
    prop: 'address',
    class: 'font-mono text-xs max-w-xs md:max-w-0',
    collapse: 'md'
  },
  {
    title: 'Created',
    value: row => formatISOToFullDate(row.createdAt),
    class: 'tabular-nums',
    collapse: 'md'
  },
  {
    title: 'HTTP',
    value: row => row.responseStatus,
    class: row => classForHttpStatus(row.responseStatus) + ' tabular-nums',
    collapse: 'sm'
  },
  {
    class: 'no-animation text-right !max-w-max',
    component: markRaw(PayloadActions)
  }
];

function classForHttpStatus(status) {
  if (!status) {
    return '';
  }

  return (status >= 200 && status < 300) ? 'text-lime-600' : 'text-rose-700';
}

async function getPayload(context) {
  if (search.value) {
    context.search = search.value;
  }
  const result = await get('/payload-finished/', context);

  if (!result) {
    return;
  }

  return { total: result.count, rows: result.rows };
}

function viewPayload({ row }) {
  Modal.dialog({
    title: 'Payload',
    component: markRaw(PayloadDialog),
    componentData: { row },
    isCloseButtonVisible: true
  });
}

function reload() {
  payloads.value.reload();
}
</script>
