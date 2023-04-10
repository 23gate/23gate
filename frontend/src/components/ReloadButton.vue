<template>
  <button ref="button" class="btn-outline w-10 h-10" @click="rotate"><font-awesome-icon icon="fa-solid fa-rotate" class="h-4" :class="isRotated ? '-rotate-180' : 'transition-transform'" /></button>
</template>

<script setup>
import { ref, shallowRef } from 'vue';

const isRotated = shallowRef(false);
const button = ref(null);

function rotate() {
  isRotated.value = !isRotated.value;
  button.value.blur();
  setTimeout(() => {
    isRotated.value = false;
  }, 200);
}
</script>