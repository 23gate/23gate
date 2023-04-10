<template>
  <div class="rounded-md ring-1 ring-gray-900/10 bg-gray-100 py-6 sm:px-6 lg:px-8">
    <transition-appear>
      <webhook-edit-form-step-one
        @next="onAbiRecieved($event)"
      />
    </transition-appear>

    <transition-appear>
      <webhook-edit-form-step-two
        v-if="currentStep >= 2"
        :webhook="webhook"
        @success="onSuccess"
      />
    </transition-appear>
  </div>
</template>

<script setup>
import { shallowRef } from 'vue';
import WebhookEditFormStepOne from '@/components/WebhookEditFormStepOne.vue';
import WebhookEditFormStepTwo from '@/components/WebhookEditFormStepTwo.vue';
import TransitionAppear from './TransitionAppear.vue';

const emit = defineEmits([ 'close' ]);

const webhook = shallowRef({});

const currentStep = shallowRef(1);

function onAbiRecieved({ chainId, address, events }) {
  webhook.value.chainId = chainId;
  webhook.value.address = address;
  webhook.value.events = events || null;

  currentStep.value = 2;
}

function onSuccess() {
  emit('close');
}
</script>