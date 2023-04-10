<template>
  <div class="">
    <div class="hidden sm:block" aria-hidden="true">
      <div class="py-5">
        <div class="border-t border-gray-200" />
      </div>
    </div>

    <form-kit
      v-slot="{ state: { valid } }"
      type="form"
      :actions="false"
      autocomplete="off"
      spellcheck="false"
      @submit="onSubmit"
    >
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <h3 class="text-lg font-medium leading-6 text-slate-900">Step 2</h3>
            <p class="mt-1 text-sm text-slate-600">Which ABI should we use to parse, which event should we watch and for how many blocks.</p>
          </div>
        </div>

        <div class="mt-5 md:col-span-2 md:mt-0">
          <div class="shadow sm:rounded-md">
            <div class="space-y-6 bg-white px-4 py-5 sm:p-6 sm:rounded-md">

              <div v-if="!webhook.events" class="rounded-md bg-blue-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <font-awesome-icon icon="fa-solid fa-circle-info" class="text-blue-500" />
                  </div>
                  <div class="ml-3 flex-1 md:flex md:justify-between">
                    <p class="text-sm text-blue-700">
                      We couldn't get ABI from Etherscan so please specify the ABI manually.
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="webhook.events && !isAbiVisible" class="flex items-center rounded-md bg-slate-100 border-slate-100 pl-5 py-3 pr-3">
                <font-awesome-icon icon="fa-solid fa-wand-magic-sparkles" class="w-5 h-5 mr-4 text-slate-400" />
                <div class="grow text-slate-500">
                  ABI automatically detected with Etherscan
                </div>
                <button
                  type="button"
                  class="h-8 relative rounded-md shadow-xs inline-flex items-center border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:border-black-500 focus:outline-none focus:ring-1 focus:ring-black-500"
                  @click="isAbiVisible = true"
                >
                  <font-awesome-icon icon="fa-solid fa-pen-to-square" class="mr-2 h-3 text-slate-400" />
                  Edit
                </button>
              </div>

              <form-kit
                v-if="isAbiVisible"
                id="abiString"
                v-model.trim="abiString"
                name="abiString"
                type="textarea"
                label="Contract ABI"
                placeholder="ABI (as list of events or JSON artifact)"
                help="Please paste the JSON ABI or a plain list of Solidity Events"
                validation="required|abi"
                :validation-rules="{
                  abi: node => Boolean(parseAbi(node.value))
                }"
                validation-visibility="dirty"
                :validation-messages="{
                  abi: 'Please enter a valid abi'
                }"
                :classes="{
                  input: 'add-transition text-like rounded-md',
                  help: 'float-left formkit-disabled:hidden text-slate-400 mt-0 text-xs',
                  messages: 'float-right text-right mt-0'
                }"
                aria-autocomplete="list"
              />

              <div v-if="proxyImplementation" class="rounded-md bg-blue-50 p-5 my-6">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <font-awesome-icon icon="fa-solid fa-circle-info" class="h-5 w-5 text-blue-400" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm text-blue-700">
                      <p>
                        This contract looks like a proxy so we have also downloaded ABI from the implementation
                        <span class="text-base font-medium">{{ proxyImplementation }}</span>
                        and presented events list from both the implementation and proxy contract.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form-kit
                id="event"
                v-model="event"
                name="event"
                :type="customSelect"
                label="Contract event"
                placeholder="Please select an event"
                validation="required"
                validation-visibility="dirty"
                :options="options"
                :classes="{
                  input: 'add-transition text-like',
                  help: 'float-left formkit-disabled:hidden',
                  messages: 'float-right text-right mt-0',
                }"
                :disabled="!options.length"
                aria-autocomplete="list"
              />

              <form-kit
                id="confirmations"
                v-model="confirmations"
                name="confirmations"
                type="number"
                label="After this many confirmations"
                help="COMING SOON!"
                placeholder="count"
                disabled="true"
                :validation-messages="{
                  confirmations: 'Please enter a valid count'
                }"
                :classes="{
                  input: 'add-transition text-like',
                  help: 'float-left formkit-disabled:hidden text-green-700 mt-0 text-xs',
                  messages: 'float-right text-right mt-0',
                }"
                aria-autocomplete="list"
              />

              <form-kit
                v-if="false"
                id="confirmations"
                v-model="confirmations"
                name="confirmations"
                :type="customSelect"
                label="After this many confirmations"
                placeholder="count"
                :options="confirmationsOptions"
                :validation-messages="{
                  confirmations: 'Please enter a valid count'
                }"
                :classes="{
                  input: 'add-transition text-like',
                  help: 'float-left formkit-disabled:hidden text-green-700 mt-0 text-xs',
                  messages: 'float-right text-right mt-0'
                }"
                aria-autocomplete="list"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="hidden sm:block" aria-hidden="true">
        <div class="py-5">
          <div class="border-t border-gray-200" />
        </div>
      </div>

      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <h3 class="text-lg font-medium leading-6 text-slate-900">Step 3</h3>
            <p class="mt-1 text-sm text-slate-600">Specify your server Endpoint URL and test the webhook delivery.</p>
          </div>
        </div>

        <div class="mt-5 md:col-span-2 md:mt-0">
          <div class="shadow sm:rounded-md">
            <div class="space-y-6 bg-white px-4 py-5 sm:p-6 sm:rounded-t-md">
              <form-kit
                id="url"
                v-model.trim="url"
                name="url"
                type="text"
                label="Endpoint URL"
                placeholder="URL"
                validation="url"
                validation-visibility="dirty"
                :validation-messages="{
                  url: 'Please enter a valid URL'
                }"
                :classes="{
                  input: 'add-transition text-like',
                  help: 'float-left formkit-disabled:hidden',
                  messages: 'float-right text-right mt-0',
                }"
                :disabled="testStatus == TEST_STATUS_IN_PROGRESS"
                aria-autocomplete="list"
              />
            </div>

            <div class="space-y-6 bg-white px-4 pb-5 sm:px-6 sm:pb-6">
              <div class="text-slate-500 text-sm mb-10">
                Test webhooks are sent with <code class="text-slate-700 bg-slate-100 py-1 px-3 rounded-md mx-2">isLive:&nbsp;false</code> in JSON and filled with random values,
                resembling those of the real event.
                See <a href="https://github.com/23gate/23gate/blob/master/docs/TestingWebhooks.md" target="_blank" class="underline text-slate-600 hover:text-slate-800">docs</a>
                for more information on webhook testing.
              </div>

              <alert-block v-if="testStatus == TEST_STATUS_IN_PROGRESS" type="info">
                Waiting for test to finish...
              </alert-block>
              <alert-block v-else-if="testStatus == TEST_STATUS_VALIDATED" type="success">
                Test passed. We have received HTTP status <b>{{ testHttpResponseStatus }}</b> from your endpoint.
              </alert-block>
              <alert-block v-else-if="testStatus == TEST_STATUS_FAILED && testHttpResponseStatus == 0" type="warning">
                We couldn't start the test or get test results. Please try again.
              </alert-block>
              <alert-block v-else-if="testStatus == TEST_STATUS_FAILED && testHttpResponseStatus == 599" type="error">
                We couldn't connect to your server or resolve your domain.
              </alert-block>
              <alert-block v-else-if="testStatus == TEST_STATUS_FAILED" type="error">
                Test failed. We have received an unexpected HTTP status <b>{{ testHttpResponseStatus }}</b> from your endpoint.
              </alert-block>
              <alert-block v-else type="info">
                Ready to test webhook.
              </alert-block>
            </div>

            <div class="flex px-4 py-3 sm:px-6 bg-gray-50 sm:rounded-b-md">
              <div>
                <button type="button" :disabled="(!abiString || !event || !url || !valid || testStatus == TEST_STATUS_IN_PROGRESS)" class="btn-primary" @click.prevent="test">
                  <template v-if="(testStatus == TEST_STATUS_IN_PROGRESS)">
                    Testing...
                    <font-awesome-icon icon="fa-solid fa-hourglass" class="ml-2 h-4 w-4" />
                  </template>
                  <template v-else>
                    Test delivery
                  </template>
                </button>
              </div>

              <form-kit type="submit" outer-class="ml-auto !mb-0" :disabled="(!abiString || !event || !url || !valid || testStatus !== TEST_STATUS_VALIDATED)">
                Create
                <font-awesome-icon icon="fa-solid fa-arrow-right" class="ml-2 h-4 w-4" />
              </form-kit>
            </div>
          </div>
        </div>
      </div>
    </form-kit>
  </div>
</template>

<script setup>
import { createInput } from '@formkit/vue';
import { shallowRef, watch, onMounted, computed } from 'vue';
import { parseAbi } from '@/parseAbi';
import { ethers } from 'ethers';
import { post, get } from '@/useApi';
import AlertBlock from '@/components/AlertBlock.vue';
import SelectDropdown from '@/components/SelectDropdown.vue';

const customSelect = createInput(SelectDropdown);

const props = defineProps({
  webhook: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['success']);

const TEST_STATUS_IDLE = 'idle';
const TEST_STATUS_VALIDATED = 'validated';
const TEST_STATUS_FAILED = 'failed';
const TEST_STATUS_IN_PROGRESS = 'inprogress';

const confirmationsOptions = [
  { label: '0 (immediately)', value: 0 },
  { label: '3 (fast)', value: 3 },
  { label: '6 (optimistic)', value: 6 },
  { label: '50 (recommended for polygon)', value: 50 }
];

const proxyImplementation = computed(() => props.webhook.events?.implementation || null);

const abiString = shallowRef(parseEventsToAbi());
const isAbiVisible = shallowRef(!abiString.value);
const event = shallowRef(''); // NOTE: See issue https://github.com/formkit/formkit/issues/415
const url = shallowRef(null);
const confirmations = shallowRef(1);

const testStatus = shallowRef(TEST_STATUS_IDLE);
const testHttpResponseStatus = shallowRef(false);
watch(url, () => testStatus.value = TEST_STATUS_IDLE);

onMounted(() => document.querySelector(abiString.value ? '#event' : '#abiString')?.focus());

watch(abiString, value => {
  if (!value) {
    options.value = [];
    event.value = '';
    return;
  }

  const abi = parseAbi(value);
  if (!abi) {
    event.value = '';
    options.value = [];
    return;
  }

  const eventFragments = abi.fragments.filter(f => ethers.Fragment.isEvent(f));

  let isEventInOptions = false;
  options.value = eventFragments.map(eventFragment => {
    const _event = eventFragment.format('full');
    if (_event === event.value) {
      isEventInOptions = true;
    }
    return {
      value: _event,
      label: _event.replace(/^\s*event\s+/i, '')
    }
  });

  if (!isEventInOptions) {
    event.value = '';
  }
});

const options = shallowRef([]);
if (props.webhook.events) {
  let events = [];
  if (props.webhook.events.implementationEvents?.events?.length) {
    events = props.webhook.events.implementationEvents?.events.map(e => ({ label: e.replace(/^\s*event\s+/i, ''), value: e }))
  }
  if (props.webhook.events.events?.length) {
    const _events = props.webhook.events.events.map(e => ({ label: e.replace(/^\s*event\s+/i, ''), value: e }));
    events = events.length && _events.length ? [ ...events, { separator: true },..._events] : [ ...events, ..._events];
  }

  options.value = events;
}

function parseEventsToAbi() {
  if (!props.webhook.events) {
    return null;
  }

  let result = '';
  if (props.webhook.events.implementationEvents?.events?.length) {
    result += props.webhook.events.implementationEvents?.events.join('\n') + '\n';
  }
  if (props.webhook.events.events?.length) {
    result += props.webhook.events.events.join('\n') + '\n';
  }

  return result;
}

async function onSubmit(context) {
  const webhook = {
    url: context.url,
    event: context.event,
    addressList: props.webhook.address,
    chainId: props.webhook.chainId,
    confirmations: context.confirmations
  };

  const response = await post('/webhook/', { webhook });
  if (response?.success) {
    emit('success');
  }
}

async function test() {
  const webhook = {
    url: url.value,
    event: event.value,
    addressList: props.webhook.address,
    chainId: props.webhook.chainId,
    confirmations: confirmations.value
  };

  testHttpResponseStatus.value = null;
  testStatus.value = TEST_STATUS_IN_PROGRESS;

  const response = await post('/webhook/test/', { webhook });
  if (!response?.success) {
    testHttpResponseStatus.value = 0;
    testStatus.value = TEST_STATUS_FAILED;
    return;
  }

  const responseAfterTest = await get(`/webhook/test/${response.id}/`);
  if (!responseAfterTest) {
    testHttpResponseStatus.value = 0;
    testStatus.value = TEST_STATUS_FAILED;
    return;
  }

  testHttpResponseStatus.value = responseAfterTest.status;

  if (responseAfterTest.status >= 200 && responseAfterTest.status < 300) {
    testStatus.value = TEST_STATUS_VALIDATED;
  } else {
    testStatus.value = TEST_STATUS_FAILED;
  }
}
</script>
