<template>
  <div v-if="isUserLoading" class="w-full h-full flex justify-center items-center">
    <div class="relative w-full p-10 sm:w-1/2 bg-slate-200 rounded-md">
      <div class="w-full h-4 rounded-md shim text-slate-600/70" />
    </div>
  </div>

  <transition
    enter-active-class="transition ease-in-out duration-200 transform"
    enter-from-class="-translate-y-full"
    enter-to-class="translate-y-0"
    leave-active-class="transition ease-in-out duration-200 transform"
    leave-from-class="translate-y-0"
    leave-to-class="-translate-y-full"
    appear
  >
    <the-navbar v-if="!isUserLoading" class="relative z-[1]"><router-view name="title" /></the-navbar>
  </transition>

  <router-view v-slot="{ Component }">
    <div class="fixed top-0 bottom-0 pt-36 w-full h-full overflow-y-auto flex flex-col">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0"
        enter-to-class="transform opacity-100"
        leave-active-class="transition duration-200 ease-out"
        leave-from-class="transform opacity-100"
        leave-to-class="transform opacity-0"
        mode="out-in"
        appear
      >
        <div :key="$route.path" class="container grow">
          <component :is="Component" v-if="!isUserLoading" />
        </div>
      </transition>

      <transition
        enter-active-class="transition ease-in-out duration-200 transform"
        enter-from-class="-translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition ease-in-out duration-200 transform"
        leave-from-class="translate-y-0"
        leave-to-class="-translate-y-full"
        appear
      >
        <the-footer v-if="!isUserLoading" class="grow-0 shrink-0" />
      </transition>
    </div>
  </router-view>

  <the-load-indicator v-if="!isUserLoading && isLoading" />

  <the-notifier />

  <modal-dialog />
</template>

<script setup>
import TheNavbar from '@/components/TheNavbar.vue';
import TheFooter from '@/components/TheFooter.vue';
import TheNotifier from '@/components/TheNotifier.vue';
import TheLoadIndicator from '@/components/TheLoadIndicator.vue';
import ModalDialog from '@/components/ModalDialog.vue';
import { isLoading } from '@/useApi';
import { getUserInfo, isUserLoading } from '@/useSession';

getUserInfo();
</script>
