<template>
  <page-header title="Webhook" :identifier="id">
    <button
      type="button"
      class="btn-primary ml-auto h-10"
      @click="onDeleteWebhookClicked"
    >
      <font-awesome-icon icon="fa-solid fa-trash-can" class="h-4 w-4 mr-2" />
      Delete
    </button>
    <button
      type="button"
      class="btn-primary ml-4 h-10"
      @click="onArchiveClicked"
    >
      <font-awesome-icon icon="fa-solid fa-box-archive" class="h-4 w-4 mr-2" />
      Archive
    </button>
  </page-header>


  <transition-appear>
    <div v-if="webhook" class="mb-10 pt-5">
      <dl>
        <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium">
            Status
          </dt>
          <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2 text-slate-500">
            <div class="flex">
              <div v-if="webhook.status == 'failed'" class="text-red-600">
                Webhook has been disabled due to multiple delivery failures.
              </div>
              <div v-else-if="webhook.status == 'enabled'">
                Enabled
              </div>
              <div v-else>
                Disabled
              </div>
              <div class="flex items-center justify-center ml-auto">
                <input
                  type="checkbox"
                  class="appearance-none cursor-pointer w-9 hover:checked:bg-primary-300 active:checked:bg-primary-300 focus:checked:bg-primary-300 checked:bg-primary-300 !h-5 bg-slate-400/30 rounded-full before:inline-block before:rounded-full before:bg-primary-500 before:h-4 before:w-4 checked:before:translate-x-full shadow-inner transition-all duration-300 before:ml-0.5 before:mt-0.5 border-none !bg-none !outline-none !ring-0 !ring-offset-0 !ring-transparent"
                  :checked="webhook.status == 'enabled'"
                  @change="toggleIsEnabled"
                >
              </div>
            </div>
          </dd>
        </div>
        <div class="pt-1.5 pb-3 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium pt-1.5">
            URL
          </dt>
          <dd class="text-sm sm:mt-0 sm:col-span-2 text-slate-500 pt-1 pr-1 -mr-1">
            <div class="flex relative transition">
              <form-kit
                id="urlForm"
                type="form"
                :classes="{
                  form: `w-full ${ !isEditEnabled ? 'force-disabled' : '' }`
                }"
                :actions="false"
                autocomplete="off"
                spellcheck="false"
                @submit="onSubmit"
                @click="onEditClicked"
                @keydown.esc="onEditCancel"
              >
                <form-kit
                  id="url"
                  v-model="url"
                  type="text"
                  validation="url"
                  validation-visibility="dirty"
                  :validation-messages="{
                    url: 'Please enter a valid URL'
                  }"
                  :classes="{
                    outer: 'mb-0',
                    inner: 'focus-within:ring-0 focus-within:ring-offset-0',
                    input: 'add-transition text-like -my-[1px]',
                    help: 'float-left formkit-disabled:hidden',
                    messages: 'float-right text-right mt-0',
                  }"
                  aria-autocomplete="list"
                />
              </form-kit>

              <div class="ml-auto">
                <template v-if="isEditEnabled">
                  <button type="button" class="btn-primary h-10 w-10 ml-2" @click="onEditCancel">
                    <font-awesome-icon icon="fa-solid fa-circle-xmark" class="h-4 w-4" />
                  </button>
                  <button type="submit" form="urlForm" class="btn-primary h-10 w-10 ml-2">
                    <font-awesome-icon icon="fa-solid fa-circle-check" class="h-4 w-4" />
                  </button>
                </template>

                <button
                  v-else
                  type="button"
                  class="h-8 relative -top-1 rounded-md shadow-xs inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:border-black-500 focus:outline-none focus:ring-1 focus:ring-black-500"
                  @click.prevent="onEditClicked"
                >
                  <font-awesome-icon icon="fa-solid fa-pen-to-square" class="mr-2 h-3 text-slate-400" />
                  Edit
                </button>
              </div>
            </div>
          </dd>
        </div>
        <div class="pb-3 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium">
            Event
          </dt>
          <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2 text-slate-500">
            {{ eventName }}
          </dd>
        </div>
        <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium">
            Contract Address
          </dt>
          <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2 text-slate-500 font-mono">
            <div v-for="address in webhook.addressList" :key="address">{{ address }}</div>
          </dd>
        </div>
        <div class="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
          <dt class="text-sm font-medium">
            Network
          </dt>
          <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2 text-slate-500">
            <div>{{ networkByChainId[webhook.chainId]?.title }}</div>
          </dd>
        </div>
      </dl>
    </div>
  </transition-appear>

  <div class="flex justify-between items-center border-t border-slate-300 py-4">
    <div v-if="pendingPayloadsCount">
      Current pending:
      <span class="inline-flex items-center rounded-full bg-primary-300 px-2.5 py-0.5 ml-2 text-xs font-medium text-slate-800">{{ pendingPayloadsCountHr }}</span>
    </div>
    <div v-else class="opacity-40 text-slate-500">
      No currently pending payloads. All delivered or nothing ever happens.
    </div>
    <div class="flex items-center">
      <button
        type="button"
        class="btn-primary h-10"
        :disabled="!pendingPayloadsCount"
        @click="onDeletePayloadsClicked"
      >
        <font-awesome-icon icon="fa-solid fa-trash-can" class="h-4 w-4 mr-2" />
        Delete all
      </button>

      <reload-button class="ml-4" @click="getPendingPayloads" />
    </div>
  </div>

  <payload-pending-list v-if="pendingPayloadsCount" :id="id" :key="id" :payloads="pendingPayloadsRows" />
</template>

<script setup>
import { ethers } from 'ethers';
import PageHeader from '@/components/PageHeader.vue';
import PayloadPendingList from '@/components/PayloadPendingList.vue';
import TransitionAppear from '@/components/TransitionAppear.vue';
import ReloadButton from '@/components/ReloadButton.vue';
import { get, post, delete_ } from '@/useApi';
import { ref, shallowRef, watch, computed } from 'vue';
import { $success, $error } from '@/notify';
import { Modal } from '@/useModal';
import { networkByChainId } from '@common/networks';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const webhook = ref(null);

const pendingPayloadsCount = shallowRef(null);
const pendingPayloadsCountHr = computed(() => (pendingPayloadsCount.value === null ? '(none)' : pendingPayloadsCount.value));

const pendingPayloadsRows = shallowRef([]);

const eventName = computed(() => {
  if (!webhook.value) {
    return '';
  }

  const iface = new ethers.Interface(webhook.value.abi);
  return iface.fragments[0].format('full');
});

const initialUrl = shallowRef(null);
const isEditEnabled = shallowRef(false);

const url = computed({
  get() {
    return webhook.value?.url;
  },
  set(value) {
    webhook.value.url = value;
  }
});

watch(
  () => props.id,
  () => {
    getWebhook();
    getPendingPayloads();
  },
  { immediate: true }
);

async function getPendingPayloads() {
  const result = await get(`/payload-pending/${props.id}/`);
  if (!result.success) {
    $error('Oops', "Couldn't get pending payloads. Try again later?")
    return;
  }

  pendingPayloadsCount.value = result.count;
  pendingPayloadsRows.value = result.rows;
}

async function getWebhook() {
  const { webhook: _webhook } = await get(`/webhook/${props.id}/`);
  webhook.value = _webhook || {};
  initialUrl.value = _webhook?.url;
}

async function toggleIsEnabled() {
  const url = webhook.value.status == 'enabled' ? `/webhook/${props.id}/disable/` : `/webhook/${props.id}/enable/`;

  const { success, status } = await post(url, {});

  if (!success) {
    return;
  }

  $success('Success', 'Webhook saved.');

  webhook.value.status = status;

  if (status == 'enabled') {
    // updateUserProperties(); // FIXME
  }
}

function onEditClicked() {
  isEditEnabled.value = true;
  document.querySelector('#url')?.focus();
}

function onEditCancel() {
  isEditEnabled.value = false;
  webhook.value.url = initialUrl.value;
  document.querySelector('#url')?.blur();
}

async function onSubmit() {
  if (url.value === initialUrl.value) {
    isEditEnabled.value = false;
    document.querySelector('#url')?.blur();
    return;
  }

  const { success } = await post(`/webhook/${props.id}/update_url/`, { url: url.value });

  if (!success) {
    return;
  }

  $success('Success', 'Webhook saved.');

  isEditEnabled.value = false;
  initialUrl.value = url.value;

  document.querySelector('#url')?.blur();
}

async function onDeletePayloadsClicked() {
  const confirm = await Modal.confirm({
    title: 'Delete pending payloads',
    body: `Are you sure you want to delete pending payloads?`
  });

  if (!confirm) {
    return;
  }

  const result = await delete_(`/payload-pending/${props.id}/`, {});

  if (!result.success) {
    return;
  }

  $success('Success', 'Pending payloads deleted.');

  pendingPayloadsCount.value = 0;
  pendingPayloadsRows.value = [];
}

function onArchiveClicked() {
  router.push({ name: 'PayloadListPage', query: { search: '#' + props.id } });
}

async function onDeleteWebhookClicked() {
  const confirm = await Modal.confirm({
    title: 'Delete webhook',
    body: `Are you sure you want to delete the webhook?`
  });

  if (!confirm) {
    return;
  }

  const result = await delete_(`/webhook/${props.id}`, {});

  if (result?.success) {
    router.push('/webhooks/');
  }
}

</script>

<style lang="scss" scoped>
  :deep(.add-transition) {
    transition: all 0.3s ease;
  }
  :deep([data-disabled]),
  :deep(.force-disabled) {
    .text-like {
      margin-top: -10px;
      padding: 0;
      margin-left: -1px;
      border-color: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      outline: none !important;
      font-size: 14px;
      resize: none;
      @apply text-slate-500;
    }
    .formkit-help {
      display: none;
    }
    .formkit-inner {
      border-color: transparent !important;
      box-shadow: none !important;
      overflow: visible;
    }
    input:-internal-autofill-selected {
      background-color: transparent !important;
      @apply text-slate-500;
    }
  }
</style>