<template>
  <ui-notification-group>
    <ui-notification>
      <template #default="{ notifications, close, hovering }">
        <ui-notification-message
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @close="close(notification.id)"
          @mouseenter="hovering(notification.id, true)"
          @mouseleave="hovering(notification.id, false)"
        />
      </template>
    </ui-notification>
  </ui-notification-group>
</template>

<script setup>
import UiNotificationGroup from '@/components/ui/UiNotificationGroup.vue';
import UiNotification from '@/components/ui/UiNotification.vue';
import UiNotificationMessage from '@/components/ui/UiNotificationMessage.vue';
</script>
