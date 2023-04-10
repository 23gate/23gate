<template>
  <transition
    :enter-active-class="`transition duration-300 ease-in-out origin-${origin}`"
    :enter-from-class="`transform scale-${axis}-0 opacity-0`"
    :enter-to-class="`transform scale-${axis}-100 opacity-100`"
    :leave-active-class="`transition duration-200 ease-in-out origin-${origin}`"
    :leave-from-class="`transform scale-${axis}-100 opacity-100`"
    :leave-to-class="`transform scale-${axis}-0 opacity-0`"
    mode="out-in"
    appear
  >
    <slot />
  </transition>
</template>

<script setup>
defineProps({
  origin: {
    type: String,
    default: 'top'
  },
  axis: {
    type: String,
    default: 'y'
  }
});
</script>