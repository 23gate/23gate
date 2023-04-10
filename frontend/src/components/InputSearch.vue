<template>
  <div class="relative rounded-md h-10">
    <input
      v-model="data"
      type="search"
      class="block w-full h-full appearance-none bg-transparent py-2 pl-4 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm sm:leading-6 rounded-md border border-slate-300"
      placeholder="Find anything..."
      tabindex="0"
    ><font-awesome-icon icon="fa-solid fa-magnifying-glass" class="pointer-events-none absolute top-[11px] right-[10px] h-5 w-5 text-slate-400" />
  </div>
</template>

<script setup>
import { useVModel } from '@vueuse/core';

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const data = useVModel(props, 'modelValue', emit);
</script>