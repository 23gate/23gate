<template>
  <Listbox v-model="value" as="div">
    <div class="relative mt-1">
      <ListboxButton v-slot="{ open }" :disabled="context.disabled" class="!leading-6 relative w-full cursor-default rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm disabled:opacity-100">
        <span v-if="(value.value ?? null) !== null" class="flex w-full items-center">
          <img v-if="value.icon" :src="value.icon" class="w-5 h-5 rounded-md mr-2" alt="">
          <div class="grow truncate">
            {{ value.label }}
          </div>
        </span>
        <span v-else class="block truncate">{{ context.attrs.placeholder }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5 text-slate-400 transition-transform" :class="{ 'rotate-180': open }">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </ListboxButton>

      <transition-appear>
        <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ListboxOption v-for="(option, key) in options" :key="key" v-slot="{ active, selected }" :disabled="option.attrs?.disabled" as="template" :value="option">
            <li v-if="option.separator" class="border-b border-slate-200 my-1" />
            <li v-else :class="[active ? 'bg-slate-100' : '', option.attrs?.disabled ? 'opacity-50' : '', 'flex relative cursor-default select-none py-2 pl-3 pr-9']">
              <img v-if="option.icon" :src="option.icon" class="w-5 h-5 rounded-md mr-2" alt="">
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">{{ option.label }}</span>

              <span v-if="selected" class="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition-appear>
    </div>
  </Listbox>

</template>

<script setup>
import TransitionAppear from '@/components/TransitionAppear.vue';
import { computed } from 'vue';
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/vue';

const props = defineProps({
  context: {
    type: Object,
    required: true
  }
});

const options = computed(() => props.context.attrs.options);

const value = computed({
  get: () => options.value.find(el => el.value == props.context?.value) || {},
  set: val => {
    props.context.node.input(val.value);
  }
});
</script>