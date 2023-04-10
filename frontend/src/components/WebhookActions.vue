<template>
  <Popover class="absolute inset-0">
    <PopoverButton class="absolute inset-0 flex justify-center items-center" @click="show">
      <font-awesome-icon icon="fa-solid fa-ellipsis" class="h-4 w-4 mr-1" />
    </PopoverButton>

    <transition-appear origin="center">
      <PopoverPanel v-if="isOpened" class="absolute top-[5px] right-[5px] w-screen max-w-max" static>
        <OnClickOutside @trigger="close">
          <div class="isolate inline-flex rounded-md shadow-lg">
            <button
              type="button"
              class="h-8  relative inline-flex items-center rounded-l-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:border-black-500 focus:outline-none focus:ring-1 focus:ring-black-500"
              @click="emit('delete', row)"
            >
              <font-awesome-icon icon="fa-solid fa-trash-can" class="mr-2 h-3 text-slate-400" />
              Delete
            </button>

            <button
              v-if="row.status == 'enabled'"
              type="button"
              class="h-8  relative -ml-px inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:border-black-500 focus:outline-none focus:ring-1 focus:ring-black-500"
              @click="emit('toggle', { row, index })"
            >
              <font-awesome-icon icon="fa-solid fa-ban" class="mr-2 h-3 text-slate-400" />
              Disable
            </button>

            <button
              v-else
              type="button"
              class="h-8  relative -ml-px inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:border-black-500 focus:outline-none focus:ring-1 focus:ring-black-500"
              @click="emit('toggle', { row, index })"
            >
              <font-awesome-icon icon="fa-solid fa-circle-check" class="mr-2 h-3 text-slate-400" />
              Enable
            </button>

            <router-link :to="`/webhook/${row.id}/`" class="h-8 relative -ml-px inline-flex items-center rounded-r-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:border-black-500 focus:outline-none focus:ring-1 focus:ring-black-500">
              <font-awesome-icon icon="fa-solid fa-pen-to-square" class="mr-2 h-3 text-slate-400" />
              View
            </router-link>
          </div>
        </OnClickOutside>
      </PopoverPanel>
    </transition-appear>
  </Popover>
</template>

<script setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import TransitionAppear from '@/components/TransitionAppear.vue';
import { shallowRef, watch } from 'vue';
import { OnClickOutside } from '@vueuse/components';

const props = defineProps({
  row: {
    type: Object,
    default: () => {}
  },
  index: {
    type: Number,
    default: null
  },
  isRowHovered: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle', 'delete']);

const isOpened = shallowRef(false);

watch(() => props.isRowHovered, val => isOpened.value = val);

function show() {
  isOpened.value = true;
}

function close() {
  isOpened.value = false;
}
</script>
