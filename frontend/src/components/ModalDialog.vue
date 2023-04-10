<!-- eslint-disable vue/no-v-html -->
<template>
  <TransitionRoot as="template" :show="isModalOpen">
    <Dialog as="div" class="relative z-10" @close="hide(null)">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-md bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-max sm:p-6 overflow-y-auto"
              :class="modalClass"
            >
              <div v-if="isCloseButtonVisible" class="absolute top-0 right-0 hidden pt-5 pr-5 sm:block">
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  @click="hide(null)"
                >
                  <span class="sr-only">Close</span>
                  <font-awesome-icon icon="fa-solid fa-xmark" class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div class="sm:flex sm:items-start">
                <div
                  v-if="(iconName && iconColor)"
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                  :class="`bg-${iconColor}-100`"
                >
                  <font-awesome-icon :icon="iconName" :class="`h-6 w-6 text-${iconColor}-600`" aria-hidden="true" />
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <DialogTitle v-if="title" as="h3" class="text-lg font-medium leading-6 text-slate-900">{{ title }}</DialogTitle>
                  <div class="mt-2">
                    <component :is="component" v-if="component" :data="componentData" @close="hide" />
                    <p v-else class="text-sm text-slate-500" v-html="body" />
                  </div>
                </div>
              </div>

              <div v-if="!component" class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  ref="okButtonRef"
                  type="button"
                  class="btn-primary text-white"
                  :class="iconColor ? `border-${iconColor}-800 bg-${iconColor}-600 hover:bg-${iconColor}-800 focus:ring-${iconColor}-300` : ''"
                  @click="okClickHandler"
                  v-html="okButton"
                />
                <button
                  v-if="cancelButton"
                  type="button"
                  class="btn-primary mr-2"
                  @click="hide"
                  v-html="cancelButton"
                />
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { Modal } from '@/useModal';
import { useFocus } from '@vueuse/core';

const isModalOpen = shallowRef(false);

const isCloseButtonVisible = ref(false);
const iconName = shallowRef(null);
const iconColor = shallowRef(null);

const okButtonRef = ref(null);
const okClickHandler = shallowRef(null);
const afterHideHandler = shallowRef(null);

const title = shallowRef(null);
const body = shallowRef(null);
const validation = shallowRef(null);
const cancelButton = shallowRef('Cancel');
const okButton = shallowRef('Ok');

// Note: component must be passed as raw, use markRaw() to avoid Vue warning
const component = shallowRef(null);
const componentData = shallowRef(null);
const modalClass = shallowRef(null);

function show() {
  isModalOpen.value = true;
}

function hide(payload = null) {
  isModalOpen.value = false;
  if (afterHideHandler.value) {
    afterHideHandler.value(payload);
  }
}

function applyOptions(options = {}) {
  title.value = options.title || null;
  body.value = options.body || null;
  validation.value = options.validation || null;
  cancelButton.value = options.cancelButton ?? 'Cancel';
  okButton.value = options.okButton ?? 'Ok';
  component.value = options.component || null;
  componentData.value = options.componentData || null;
  afterHideHandler.value = options.afterHideHandler || null;
  modalClass.value = options.modalClass || null;
  isCloseButtonVisible.value = options.isCloseButtonVisible || false;

  iconName.value = options.iconName || null;
  iconColor.value = options.iconColor || null;
}

function alert(options = {}) {

  options.iconColor = options.iconColor ?? 'red';
  options.iconName = options.iconName ?? 'fa-solid fa-exclamation';

  applyOptions(options);
  cancelButton.value = null;

  return new Promise(resolve => {
    okClickHandler.value = () => {
      resolve();
      hide();
    };

    afterHideHandler.value = () => {
      resolve();
    };

    show();
    useFocus(okButtonRef, { initialValue: true });
  });
}

function confirm(options = {}) {

  options.iconColor = options.iconColor ?? 'red';
  options.iconName = options.iconName ?? 'fa-solid fa-exclamation';

  applyOptions(options);

  return new Promise(resolve => {

    okClickHandler.value = () => {
      resolve(true);
      hide();
    };

    afterHideHandler.value = () => {
      resolve(false);
    };

    show();
    useFocus(okButtonRef, { initialValue: true });
  });
}

function dialog(options = {}) {
  applyOptions(options);

  return new Promise(resolve => {
    afterHideHandler.value = payload => {
      resolve(payload);
    };

    show();
  });
}

Modal.alert = alert;
Modal.confirm = confirm;
Modal.dialog = dialog;
</script>
