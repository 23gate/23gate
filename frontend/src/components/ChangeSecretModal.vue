<template>

  <div class="flex items-center text-lg max-w-md">
    <div class="grow opacity-60 w-96">
      <div v-if="secret" class="transition duration-200 font-mono text-sm" :class="{ '!h-0 overflow-y-hidden opacity-0': isHidden }">
        {{ secret }}
      </div>
      <div v-if="isHidden" class="relative -top-1 left-0.5" :class="{ 'animation-appear': !secret }">
        <span v-for="key in 38" :key="key" class="inline-block w-1 h-1 mr-1 rounded-full bg-current" />
      </div>
    </div>

    <div class="grow-0 shrink-0 ml-10" :class="{ 'invisible': !secret }">
      <button class="btn-primary !p-2">
        <font-awesome-icon v-if="isHidden" icon="fa-solid fa-eye" class="w-5 h-5" @click="isHidden=!isHidden" />
        <font-awesome-icon v-else icon="fa-solid fa-eye-slash" class="w-5 h-5" @click="isHidden=!isHidden" />
      </button>
      <copy-to-clipboard :text="secret" class="ml-3" />
    </div>
  </div>

  <div class="flex justify-between items-center mt-10 peer-last-of-type:mt-2">
    <button class="btn-primary ml-auto" @click="regenerateSecret">
      <spinner v-if="loading" class="!w-5 !h-5 !border-2" />
      <font-awesome-icon v-else icon="fa-solid fa-repeat" class="w-5 h-4 my-0.5 mr-2" />
      Generate new secret
    </button>
  </div>


</template>

<script setup>
import { shallowRef } from 'vue';
import { get } from '@/useApi';
import { $success } from '@/notify';
import Spinner from '@/components/Spinner.vue';
import CopyToClipboard from '@/components/CopyToClipboard.vue';

// eslint-disable-next-line vue/require-prop-types
defineProps(['data']);
defineEmits(['close']);

const loading = shallowRef(false);
const isHidden = shallowRef(true);
const secret = shallowRef(null);

async function getSecret() {
  const response = await get('/secret/');

  if (response?.secret) {
    secret.value = response.secret;
  }
}

async function regenerateSecret() {
  loading.value = true;

  const response = await get('/secret/regenerate/');

  loading.value = false;

  if (response?.secret) {
    isHidden.value = false;
    $success('Secret generated', 'Please make sure to update your server-side code.');
    secret.value = response.secret;
  }
}

getSecret();
</script>

<style lang="scss" scoped>
.animation-appear span {
  animation: appear 1.6s infinite linear;
}

@for $i from 1 through 16 {
  .animation-appear span:nth-child(#{$i}n) {
      animation-delay: #{$i * 0.1}s;
  }
}

@keyframes appear {
  0% {
    opacity: 0;
  }
  50%,
  100% {
    opacity: 1;
  }
}
</style>