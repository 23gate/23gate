import { createWebHistory, createRouter } from 'vue-router';

import WebhookListPage from '@/views/WebhookListPage.vue';
import WebhookEditPage from '@/views/WebhookEditPage.vue';
import WebhookViewPage from '@/views/WebhookViewPage.vue';
import PayloadListPage from '@/views/PayloadListPage.vue';
import StartPage from '@/views/StartPage.vue';
import AuthPage from '@/views/AuthPage.vue';
import ErrorPage from '@/views/ErrorPage.vue';

import Session from "supertokens-web-js/recipe/session";

const authGuard = async () => ((await Session.doesSessionExist()) ? true : '/a/');

const routes = [
  {
    path: '/',
    component: StartPage
  },

  {
    path: '/a/:pathMatch(.*)*',
    name: 'AuthPage',
    component: AuthPage
  },

  {
    path: '/webhooks/',
    name: 'WebhookListPage',
    component: WebhookListPage,
    beforeEnter: authGuard
  },

  {
    path: '/webhook/',
    name: 'WebhookCreatePage',
    component: WebhookEditPage,
    beforeEnter: authGuard
  },

  {
    path: '/webhook/:id(\\d+)/',
    name: 'WebhookViewPage',
    component: WebhookViewPage,
    props: true,
    beforeEnter: authGuard
  },

  {
    path: '/payloads/',
    name: 'PayloadListPage',
    component: PayloadListPage,
    props: true,
    beforeEnter: authGuard
  },

  {
    path: '/:catchAll(.*)',
    name: 'ErrorPage',
    component: ErrorPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  }
});

export default router;
