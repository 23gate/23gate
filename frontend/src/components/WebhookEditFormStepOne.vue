<template>
  <div class="md:grid md:grid-cols-3 md:gap-6">
    <div v-if="shouldShowDevelopmentHint" class="col-span-3 md:grid md:grid-cols-2 md:gap-6 text-sm text-slate-400 mb-10">
      <div class="col">
        Development tools for BSC:
        <br>
        <a class="font-mono link-dashed" href="#" @click.prevent="fillChainIdAndAddress(0x38, '0x55d398326f99059fF775485246999027B3197955')">0x55d398326f99059fF775485246999027B3197955</a> USDT
        <br>
        <a class="font-mono link-dashed" href="#" @click.prevent="fillChainIdAndAddress(0x38, '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56')">0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56</a> BUSD (emulated unverified)
      </div>
      <div class="col">
        Development tools for Polygon:
        <br>
        <a class="font-mono link-dashed" href="#" @click.prevent="fillChainIdAndAddress(0x89, '0xc2132D05D31c914a87C6611C10748AEb04B58e8F')">0xc2132D05D31c914a87C6611C10748AEb04B58e8F</a> USDT
        <br>
        <a class="font-mono link-dashed" href="#" @click.prevent="fillChainIdAndAddress(0x89, '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619')">0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619</a> WETH
      </div>
    </div>

    <div class="md:col-span-1">
      <div class="px-4 sm:px-0">
        <h3 class="text-lg font-medium leading-6 text-slate-900">Step 1</h3>
        <p class="mt-1 text-sm text-slate-600">Please choose the network and type in the contract address to watch events on.</p>
      </div>
    </div>

    <div class="mt-5 md:col-span-2 md:mt-0">

      <form-kit
        v-slot="{ state: { valid } }"
        type="form"
        :actions="false"
        autocomplete="off"
        spellcheck="false"
        @submit="onSubmit"
      >

        <div class="shadow sm:rounded-md">
          <div class="space-y-6 bg-white px-4 py-5 sm:p-6 sm:rounded-t-md" :class="{ 'sm:rounded-b-md': isFormDisabled }">
            <form-kit
              id="chainId"
              v-model="chainId"
              :type="networkSelect"
              label="Chain"
              placeholder="Select network"
              validation="required"
              validation-visibility="dirty"
              :validation-messages="{
                required: 'Please select chain'
              }"
              :options="networksListForSelect"
              :classes="{
                input: 'add-transition text-like',
                help: 'float-left formkit-disabled:hidden',
                messages: 'float-right text-right mt-0',
              }"
              :disabled="isFormDisabled"
              aria-autocomplete="list"
            />

            <form-kit
              id="address"
              v-model.trim="address"
              type="text"
              label="Contract address"
              validation="matches:/^\s*0x[a-fA-F0-9]{40}\s*$/"
              validation-visibility="dirty"
              :validation-messages="{
                matches: 'Please enter a valid contract address'
              }"
              :classes="{
                input: 'add-transition text-like',
                help: 'float-left formkit-disabled:hidden',
                messages: 'float-right text-right mt-0',
              }"
              :disabled="isFormDisabled"
              aria-autocomplete="list"
            />
          </div>

          <div v-if="!isFormDisabled" class="px-4 py-3 text-right sm:px-6 bg-gray-50 sm:rounded-b-md">
            <form-kit type="submit" outer-class="!mb-0" class="btn btn-primary" :disabled="!address || !valid">
              Continue
              <font-awesome-icon icon="fa-solid fa-arrow-right" class="ml-2 h-4 w-4" />
            </form-kit>
          </div>
        </div>
      </form-kit>
    </div>
  </div>

</template>

<script setup>
import { createInput } from '@formkit/vue';
import { onMounted, shallowRef } from 'vue';
import { get } from '@/useApi';
import { networksListForSelect } from '@common/networks';
import { $error } from '@/notify';
import SelectDropdown from '@/components/SelectDropdown.vue';

const networkSelect = createInput(SelectDropdown);

const shouldShowDevelopmentHint = Boolean(!import.meta.env.PROD);

const emit = defineEmits([ 'next' ]);

onMounted(() => document.querySelector('#chainId')?.focus());

const chainId = shallowRef('');
const address = shallowRef(null);
const isFormDisabled = shallowRef(false);

function fillChainIdAndAddress(c, a) {
  if (isFormDisabled.value) {
    return;
  }
  chainId.value = c;
  address.value = a;
}

async function onSubmit() {
  const result = await get('/abi/', { address: address.value, chainId: chainId.value });

  if (!result) {
    $error("Server-side error","Couldn't get ABI.");
    return;
  }

  const { success, events } = result;

  if (!success) {
    $error("Server-side error","Couldn't get ABI.");
    return;
  }

  isFormDisabled.value = true;
  emit('next', { address: address.value, chainId: chainId.value, events });
}
</script>
