import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { plugin, defaultConfig } from '@formkit/vue';
import { generateClasses } from '@formkit/tailwindcss';
import theme from '@/formkit-theme';
import { configureApi } from '@/useApi';
import { $error } from '@/notify';
import { FontAwesomeIcon } from '@/fontawesome';
import '@/useDark';
import { VTooltip } from 'floating-vue';

import 'highlight.js/styles/stackoverflow-light.css';
import 'floating-vue/dist/style.css';
import '@/assets/css/main.scss';

configureApi({
  onException: () => {
    $error("Request failed", "Couldn't perform request. Try again later.");
  },

  onNoSuccess: json => {
    $error("Failed", json.message || "Something is wrong.");
  },

  onServerError: response => {
    console.log(response);

    $error("Server-side error","Couldn't perform request. Try again later.");
  }
});

createApp(App)
  .directive('tooltip', VTooltip)
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(router)
  .use(
    plugin,
    defaultConfig({
      config: {
        classes: generateClasses(theme)
      }
    })
  )
  .mount('#app');
