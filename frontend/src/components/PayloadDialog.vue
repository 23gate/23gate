<template>

  <dl>
    <div class="property">
      <dt>Event</dt>
      <dd>{{ data.row.eventName }}</dd>
    </div>

    <div class="property">
      <dt>Contract address</dt>
      <dd class="font-mono">{{ data.row.address }}</dd>
    </div>

    <div class="property">
      <dt>Network</dt>
      <dd>{{ networkByChainId[data.row.chainId]?.title }}</dd>
    </div>

    <div class="property">
      <dt>URL</dt>
      <dd>{{ data.row.url }}</dd>
    </div>

    <div class="property">
      <dt>Created</dt>
      <dd class="tabular-nums">{{ formatISOToFullDate(data.row.createdAt) }}</dd>
    </div>

    <div class="property">
      <dt>Block number</dt>
      <dd class="tabular-nums">{{ data.row.blockNumber }}</dd>
    </div>

    <div class="property">
      <dt>Tx Hash</dt>
      <dd class="font-mono">{{ data.row.transactionHash }}</dd>
    </div>

    <div class="px-4 sm:px-6 my-4 text-xs overflow-x-auto max-w-full whitespace-pre-wrap font-mono text-left">{{ payloadHr }}</div>
  </dl>
</template>

<script setup>
import { computed } from 'vue';
import { networkByChainId } from '@common/networks';
import { formatISOToFullDate } from '@/useDayjs';

const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  }
});

const payloadHr = computed(() => {
  let json = null;
  try {
    json = JSON.parse(props.data.row.payload);
  } catch (e) {
    return '(failed to parse payload)';
  }

  return JSON.stringify(json, null, "    ");
});
</script>

<style lang="scss">
dt {
  @apply text-left text-sm font-medium opacity-60;
}
dd {
  @apply mt-1 text-left text-sm sm:col-span-4 sm:mt-0 opacity-90 truncate;
}
.property {
  @apply px-4 py-5 sm:grid sm:grid-cols-5 sm:gap-4 sm:px-6;
  &:nth-child(odd) {
    @apply bg-slate-500/5;
  }
}
</style>
