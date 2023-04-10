<template>
  <a href="#" class="text-slate-600 text-sm hover:underline inline-flex items-center text-right ml-5" @click.prevent="emit('view', { row, index })">
    <font-awesome-icon icon="fa-solid fa-eye" class="h-3 w-3 mr-1" />
    <span class="hidden md:inline">View</span>
  </a>
</template>

<script setup>
defineProps({
  row: {
    type: Object,
    default: () => {}
  },
  index: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['view']);
</script>
