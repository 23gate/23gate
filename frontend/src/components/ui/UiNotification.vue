<template>
  <Notification
    v-slot="{ notifications, close }"
    v-bind="$attrs"
    ref="notification"
    enter="ease-out duration-300 transition"
    enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
    enter-to="translate-y-0 opacity-100 sm:translate-x-0"
    leave="transition ease-in duration-500"
    leave-from="opacity-100"
    leave-to="opacity-0"
    move="transition duration-500"
    move-delay="delay-300"
  >
    <slot :notifications="notifications" :close="close" />
  </Notification>
</template>

<script setup>
import { ref } from 'vue';
import { Notification } from 'notiwind';

const notification = ref(null);

defineExpose({
  notification
});
</script>