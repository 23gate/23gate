<template>
  <v-menu as="div" class="relative">
    <menu-button id="user-menu-button" class="flex text-zinc-700 items-center font-semibold hover:text-zinc-900 mx-4" aria-expanded="false" aria-haspopup="true">
      <font-awesome-icon icon="fa-regular fa-bell" class="w-5 h-5 relative top-0.5" />
      <div class="absolute top-0.5 right-4 bg-red-500 rounded-full w-2 h-2" />
    </menu-button>

    <transition-appear>
      <menu-items
        as="div"
        class="absolute top-full right-0 mt-3 w-60 origin-top-right divide-y divide-zinc-100 rounded-md bg-white text-sm font-normal text-slate-900 shadow-md ring-1 ring-slate-900/5 focus:outline-none sm:-mr-3.5 transform opacity-100 scale-100"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
        tabindex="-1"
      >
        <div class="cursor-pointer px-5 py-3 block" @click.prevent="clicked">
          One of your webhooks was disabled due to multiple delivery failures.
        </div>
      </menu-items>
    </transition-appear>
  </v-menu>
</template>

<script setup>
import { Menu as VMenu, MenuButton, MenuItems } from '@headlessui/vue';
import TransitionAppear from '@/components/TransitionAppear.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

function clicked() {
  router.push('/webhooks/');
  // FIXME dismiss notifications bar
}
</script>
