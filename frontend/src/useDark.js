import { useDark } from '@vueuse/core';

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: null, // FIXME: use 'dark' for dark mode
  valueLight: null
});

export {
  isDark
};
