<template>
  <div class="main-logo">
    <img :src="src" alt="23gate logo">
  </div>
</template>

<script setup>
import { isDark } from '@/useDark';
import { computed } from 'vue';

const src = computed(() => (isDark.value ? '/23gate.svg' : '/23gate.svg'));
</script>