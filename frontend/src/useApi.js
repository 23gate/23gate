import { ref } from 'vue';

export const isLoading = ref(false);

const Loader = {
  timeout: null,
  count: 0,

  start(_timeout = config.timeout) {
    clearTimeout(this.timeout);

    this.count++;

    if (_timeout) {
      this.timeout = setTimeout(() => isLoading.value = true, _timeout);

    } else {
      isLoading.value = true;
    }
  },

  stop() {
    this.count--;

    if (this.count > 0) {
      return;
    }

    clearTimeout(this.timeout);

    isLoading.value = false;
  }
};

export const config = {
  /// Loader show timeout
  timeout: 500
};

export function configureApi(_config = {}) {
  Object.entries(_config).forEach(([ key, value ]) => config[key] = value);
}

async function _fetch(url, options = {}) {
  Loader.start(options.timeout);

  const _options = {...options};

  if (!_options.headers) {
    _options.headers = {};
  }

  _options.headers.accept = 'application/json';
  _options.headers['content-type'] = 'application/json';

  const _url = '/api' + url;

  let response = null;
  try {
    response = await fetch(_url, _options);
  } catch {
    // eslint-disable-line no-empty
  }

  Loader.stop();

  if (!response) {
    if (config.onException) {
      config.onException();
    }

    return null;
  }

  if (!response?.ok) {
    if (config.onServerError) {
      config.onServerError(response);
    }

    return null;
  }

  const result = await response.json();
  if (!result.success) {
    if (config.onNoSuccess) {
      config.onNoSuccess(result);
    }

    return null;
  }

  return result;
}

export async function get(url, data = null, options = {}) {
  const _options = {
    ...options,
    method: 'GET'
  };

  const searchParams = data ? ('?' + new URLSearchParams(data)) : '';

  return _fetch(url + searchParams, _options);
}

export async function post(url, data = null, options = {}) {
  const _options = {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  };

  return _fetch(url, _options);
}

export async function put(url, data = null, options = {}) {
  const _options = {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined
  };

  return _fetch(url, _options);
}

export async function delete_(url, data = null, options = {}) {
  const _options = {
    ...options,
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined
  };

  return _fetch(url, _options);
}
