import { notify } from 'notiwind';

function $error(title, text) {
  return notify(
    {
      title,
      text,
      type: 'error'
    },
    5000
  );
}

function $success(title, text) {
  return notify(
    {
      title,
      text,
      type: 'success'
    },
    3000
  );
}

export {
  $error,
  $success,
  notify
};
