<template>
  <div class="w-full h-1 shim text-slate-600/70" />
  <div class="fixed transform inset-0 z-[999999] pointer-events-non bg-transparent" @contextmenu.stop.prevent />
  <input ref="input" type="text" class="opacity-0" @blur="focus" @keydown.stop.prevent>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const input = ref(null);

watchEffect(() => {
  input.value?.focus();
},
{
  flush: 'post'
});

function focus() {
  input.value?.focus();
}
</script>