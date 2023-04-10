<template>
  <div :class="`rounded-md bg-${color}-50 p-4`">
    <div class="flex">
      <div class="flex-shrink-0">
        <font-awesome-icon :icon="icon" :class="`h-5 w-5 text-${color}-400`" aria-hidden="true" />
      </div>
      <div class="ml-3 grow">
        <p :class="`text-sm font-medium text-${color}-800`"><slot /></p>
      </div>
      <div v-if="isDissmissable" class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button type="button" :class="`inline-flex rounded-md bg-${color}-50 p-1.5 text-${color}-500 hover:bg-${color}-100 focus:outline-none focus:ring-2 focus:ring-${color}-600 focus:ring-offset-2 focus:ring-offset-${color}-50`">
            <span class="sr-only">Dismiss</span>
            <font-awesome-icon icon="fa-solid fa-xmark" class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'success'
  },
  isDissmissable: {
    type: Boolean,
    default: false
  }
});

const color = computed(() => {
  switch (props.type) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    case 'warning':
      return 'yellow';
    case 'info':
      return 'blue';
    default:
      return 'green';
  }
});

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return 'fa-solid fa-check-circle';
    case 'error':
      return 'fa-solid fa-exclamation-circle';
    case 'warning':
      return 'fa-solid fa-exclamation-triangle';
    case 'info':
      return 'fa-solid fa-info-circle';
    default:
      return 'fa-solid fa-check-circle';
  }
});
</script>