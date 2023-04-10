<template>
  <div class="btn-primary h-10 w-10 text-slate-400" @click="toggleDark">
    <font-awesome-icon v-if="isDark" icon="fa-regular fa-lightbulb" class="h-5 w-5" />
    <font-awesome-icon v-else icon="fa-solid fa-lightbulb" class="h-5 w-5" />
  </div>
</template>

<script setup>
import { isDark } from '@/useDark';

function toggleDark() {
  isDark.value = !isDark.value;
}
</script>
