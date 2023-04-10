<template>
  <page-header title="Create new webhook" />

  <webhook-edit-form @close="onClose" />
</template>

<script setup>
import PageHeader from '@/components/PageHeader.vue';
import WebhookEditForm from '@/components/WebhookEditForm.vue';
import { useRouter } from 'vue-router';
import { $success } from '@/notify';

const router = useRouter();

function onClose() {
  $success('Success', 'Webhook saved.');
  router.push('/webhooks/');
}
</script>
