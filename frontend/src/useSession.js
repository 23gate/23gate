import * as Session from "supertokens-web-js/recipe/session";
import { config } from '@/useApi';
import { computed, shallowRef } from "vue";

export const userId = shallowRef(null);

export const userProperties = shallowRef({});

export const isAuthenticated = computed(() => userId.value !== null);

export const isUserLoading = shallowRef(true);

async function whoami() {
  const options = {
    headers: {
      accept: 'application/json'
    }
  };

  const url = config.prefix + '/whoami/';

  let response = null;
  try {
    response = await fetch(url, options);
  } catch {
    return null;
  }

  const json = await response.json();
  return json;
}

export async function getUserInfo() {
  isUserLoading.value = true;

  const session = await Session.doesSessionExist();

  if (session) {
    [ userId.value, userProperties.value ] = await Promise.all([
      Session.getUserId(),
      whoami()
    ]);

    isUserLoading.value = false;

    return;
  }

  isUserLoading.value = false;
  userId.value = null;
  userProperties.value = {};
}

export async function updateUserProperties() {
  if (!userId.value) {
    return;
  }

  const result = await whoami();
  if (!result) {
    return;
  }

  userProperties.value = result;
}

setInterval(updateUserProperties, 10000);

export async function logout() {
  await Session.signOut();
  userId.value = null;
  userProperties.value = {};
  window.location = '/';
}
