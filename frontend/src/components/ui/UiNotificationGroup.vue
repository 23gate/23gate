<template>
  <NotificationGroup group="">
    <div class="fixed inset-0 flex items-start justify-end px-4 pt-0 pb-6 pointer-events-none z-[15]">
      <div class="w-full max-w-sm">
        <slot />
      </div>
    </div>
  </NotificationGroup>
</template>

<script setup>
import { NotificationGroup } from 'notiwind';
</script>
