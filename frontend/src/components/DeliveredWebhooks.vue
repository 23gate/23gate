<template>
  <div v-tooltip.bottom="`We have delivered ${count} total webhooks to your apps`" class="relative mx-4 cursor-default">
    <dt>
      <div class="absolute top-0 bottom-0 left-0 flex items-center text-slate-400">
        <font-awesome-icon icon="fa-solid fa-dove" class="w-5 h-5" />
      </div>
      <p class="ml-6 truncate text-[10px] text-slate-400 leading-3">Delivered</p>
    </dt>
    <dd class="ml-6 flex items-baseline">
      <p class=" font-semibold text-slate-500 leading-3">{{ countHr }}</p>
    </dd>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  count: {
    type: Number,
    default: 0
  }
});

const countHr = computed(() => {
  if (props.count < 1000) {
    return props.count;
  }

  if (props.count < 1000000) {
    return (props.count / 1000).toFixed(1) + 'k';
  }

  return (props.count / 1000000).toFixed(1) + 'm';
});
</script>
