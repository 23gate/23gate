<template>
  <grid-table
    :rows="payloads"
    :columns="columns"
  />

  <div v-if="shouldShowMore" class="mt-2 mb-20 text-right opacity-40">...and more</div>
</template>

<script setup>
import GridTable from '@/components/GridTable.vue';
import { computed } from 'vue';
import { dayjs } from '@/useDayjs';
import { networkByChainId } from '@common/networks';

const props = defineProps({
  id: {
    type: String,
    default: null
  },
  payloads: {
    type: Array,
    default: () => ([])
  }
});

const shouldShowMore = computed(() => props.payloads.length > 10);

const columns = [
  {
    title: 'Tx Hash',
    prop: 'transactionHash',
    click: row => window.open(networkByChainId[row.chainId].explorerUrl + row.transactionHash, '_blank'),
    class: 'link-dashed link-external font-mono text-xs max-w-0 xl:max-w-xs'
  },
  {
    title: 'Address',
    prop: 'address',
    class: 'font-mono text-xs max-w-0 xl:max-w-xs'
  },
  {
    title: 'Age',
    value: row => formatAgeOrPending(row),
    class: row => (row.requestCount == 0 ? 'italic' : '') + ' tabular-nums'
  },
  {
    title: 'Retries',
    value: row => row.requestCount || '',
    class: 'tabular-nums'
  },
  {
    title: 'Retry',
    value: row => formatNextRetryOrEmpty(row),
    class: 'tabular-nums'
  },
  {
    title: 'HTTP',
    value: row => row.responseStatus || '',
    class: row => classForHttpStatus(row.responseStatus)
  }
];

function formatAgeOrPending(row) {
  return row.requestCount == 0 ? '(pending)' : dayjs(row.createdAt).fromNow(true);
}

function formatNextRetryOrEmpty(row) {
  return row.requestCount == 0 ? '' : dayjs().to(row.nextRequestAt, true);
}

function classForHttpStatus(status) {
  if (!status) {
    return '';
  }

  return (status >= 200 && status < 300) ? 'text-lime-600' : 'text-rose-700';
}
</script>
