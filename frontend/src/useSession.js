import { computed, shallowRef } from "vue";

export const userProperties = shallowRef(null);

export const isAuthenticated = computed(() => (userProperties.value?.email ?? null) !== null);

export const isUserLoading = shallowRef(true);

async function whoami() {
  const options = {
    headers: {
      accept: 'application/json'
    }
  };

  const url = '/api/whoami/';

  let response = null;
  try {
    response = await fetch(url, options);
  } catch {
    return null;
  }

  if (response.status === 401) {
    return null;
  }

  const json = await response.json();
  console.log(json);
  return json;
}

export async function getUserInfo() {
  isUserLoading.value = true;
  userProperties.value = await whoami();
  isUserLoading.value = false;
}

export async function logout() {
  userProperties.value = null;
  window.location = '/login/logout';
}
