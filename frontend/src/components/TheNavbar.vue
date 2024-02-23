<template>
  <header class="relative z-1 w-full flex-none text-sm font-semibold leading-6 bg-white text-slate-900">
    <nav aria-label="Global" class="container">
      <div class="relative flex items-center py-[2.125rem]">
        <div class="absolute inset-x-0 bottom-0 h-px bg-slate-900/5" />

        <router-link to="/" class="mr-auto flex-none text-slate-900 relative">
          <the-logo />
        </router-link>

        <div class="hidden lg:flex lg:items-center">
          <router-link to="/webhooks/" class="block rounded-md py-2 px-4 text-sm text-slate-700" active-class="bg-slate-100">
            Webhooks
          </router-link>

          <router-link to="/payloads/" class="block rounded-md py-2 px-4 text-sm text-slate-700" active-class="bg-slate-100">
            Archive
          </router-link>

          <a class="block rounded-md py-2 px-4 text-sm text-slate-700" href="https://github.com/23gate/23gate/tree/master/docs" target="_blank">
            Docs
          </a>
        </div>

        <delivered-webhooks v-if="false" :count="0" />

        <failed-webhook v-if="userProperties?.isFailedWebhook" />

        <the-theme-toggler v-if="false" class="mx-4" />

        <div class="lg:ml-4 lg:flex lg:items-center lg:border-l lg:border-slate-900/15 lg:pl-8">
          <spinner v-if="isUserLoading" />

          <v-menu v-else-if="isAuthenticated" as="div" class="relative">
            <menu-button id="user-menu-button" class="flex items-center font-semibold hover:text-slate-900" aria-expanded="false" aria-haspopup="true">
              <span class="hidden items-center md:flex">
                Account
                <svg aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg" class="ml-3 h-3 w-3 stroke-slate-400">
                  <path d="M9.75 4.125 6 7.875l-3.75-3.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>

              <span class="md:hidden -my-1 ml-6 -mr-1 flex h-8 w-8 items-center justify-center lg:hidden">
                <svg viewBox="0 0 24 24" class="h-6 w-6 stroke-slate-900">
                  <path d="M3.75 12h16.5M3.75 6.75h16.5M3.75 17.25h16.5" fill="none" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </span>
            </menu-button>

            <transition-appear>
              <menu-items
                as="div"
                class="absolute top-full right-0 mt-3 w-60 origin-top-right divide-y divide-slate-100 rounded-md bg-white text-sm font-normal text-slate-900 shadow-md ring-1 ring-slate-900/5 focus:outline-none sm:-mr-3.5 transform opacity-100 scale-100"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
                tabindex="-1"
              >
                <div class="truncate py-3 px-3.5" role="none">
                  <div class="text-xs text-slate-500" role="none">Signed in as</div>
                  <div class="mt-0.5 font-semibold" role="none">
                    {{ userProperties?.email }}
                  </div>
                </div>

                <div class="py-1.5 lg:hidden" role="none">
                  <menu-item
                    as="a"
                    href="#"
                    class="block px-3.5 py-1.5 hover:bg-slate-100"
                    role="menuitem"
                    tabindex="-1"
                    @click.prevent="router.push('/webhooks/')"
                  >
                    Webhooks
                  </menu-item>

                  <menu-item
                    as="a"
                    href="#"
                    class="block px-3.5 py-1.5 hover:bg-slate-100"
                    role="menuitem"
                    tabindex="-1"
                    @click.prevent="router.push('/payloads/')"
                  >
                    Archive
                  </menu-item>

                  <menu-item
                    as="a"
                    target="_blank"
                    href="https://github.com/23gate/23gate/tree/master/docs"
                    class="block px-3.5 py-1.5 hover:bg-slate-100"
                    role="menuitem"
                    tabindex="-1"
                  >
                    Docs
                  </menu-item>
                </div>

                <div class="py-1.5" role="none">
                  <menu-item
                    as="a"
                    href="#"
                    class="block px-3.5 py-1.5 hover:bg-slate-100"
                    role="menuitem"
                    tabindex="-1"
                    @click.prevent="changeSecret"
                  >
                    User secret
                  </menu-item>
                </div>

                <div class="py-1.5" role="none">
                  <menu-item
                    as="a"
                    href="#"
                    class="block px-3.5 py-1.5 hover:bg-slate-100"
                    role="menuitem"
                    tabindex="-1"
                    @click.prevent="changePassword"
                  >
                    Change password
                  </menu-item>

                  <menu-item
                    as="a"
                    href="#"
                    class="block px-3.5 py-1.5 hover:bg-slate-100"
                    role="menuitem"
                    tabindex="-1"
                    @click.prevent="logout"
                  >
                    Sign out
                  </menu-item>
                </div>
              </menu-items>
            </transition-appear>
          </v-menu>

          <a v-else href="https://github.com/login/oauth/authorize?scope=user:email&client_id=f90cf799edc87ea497b6" class="btn-primary"> Sign In </a>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { Menu as VMenu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import Spinner from '@/components/Spinner.vue';
import TheLogo from '@/components/TheLogo.vue';
import TheThemeToggler from '@/components/TheThemeToggler.vue';
import DeliveredWebhooks from '@/components/DeliveredWebhooks.vue';
import FailedWebhook from '@/components/FailedWebhook.vue';
import ChangeSecretModal from '@/components/ChangeSecretModal.vue';
import TransitionAppear from '@/components/TransitionAppear.vue';
import { markRaw, watch } from 'vue';
// import { $error } from '@/notify';
import { Modal } from '@/useModal';
import { isUserLoading, isAuthenticated, userProperties, logout } from '@/useSession';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';

watch(isAuthenticated, v => console.log('isAuth', v), { immediate: true });

const route = useRoute();
const router = useRouter();

async function changePassword() {
  router.push('/a/reset-password');
}

function changeSecret() {
  Modal.dialog({
    title: 'User secret',
    component: markRaw(ChangeSecretModal),
    modalClass: 'max-w-md'
  });
}
</script>
