// We'll create some re-useable definitions
// because many input types are identical
// in how we want to style them.

const label = 'text-sm font-medium text-slate-700';

const textClassification = {
  label: label + ' block mb-1',
  inner: `
    border
    border-slate-300
    shadow-sm
    formkit-invalid:border-red-500
    rounded-md mb-1
    overflow-hidden
    focus-within:border-primary-500
    focus-within:ring-1
    focus-within:ring-primary-500
    formkit-invalid:focus-within:ring-red-500/50
  `,
  input:
    'w-full h-10 px-3 border-none text-base sm:text-sm placeholder-slate-400 focus:outline-none'
};
const boxClassification = {
  fieldset: 'border border-slate-300 rounded-md px-2 pb-1',
  legend: 'font-bold text-sm',
  wrapper: 'flex items-center mb-1 cursor-pointer',
  help: 'mb-2',
  input:
    'form-check-input appearance-none h-5 w-5 mr-2 border border-slate-300 rounded-md bg-white shadow-sm checked:bg-primary-500 focus:outline-none focus:ring-0 transition duration-200',
  label
};

// export our definitions using our above
// templates and declare one-offs and
// overrides as needed.
export default {
  // the global key will apply to all inputs
  global: {
    label: label + 'block mb-1',
    outer: 'mb-5 data-[disabled=true]:opacity-50',
    help: 'mt-2 text-sm text-slate-500',
    messages: 'list-none p-0 mt-1 mb-0',
    message: 'text-red-500 mb-1 text-xs'
  },
  button: {
    wrapper: 'mb-1',
    input: 'btn-primary'
  },
  color: {
    label: label + 'block mb-1',
    input:
      'w-16 h-8 appearance-none cursor-pointer border border-slate-300 rounded-md mb-2 p-1'
  },
  date: textClassification,
  'datetime-local': textClassification,
  checkbox: boxClassification,
  email: textClassification,
  file: {
    label: label + 'block mb-1',
    inner: 'max-w-mdFIXME cursor-pointer',
    input:
      'text-sm mb-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary-500 file:text-white hover:file:bg-primary-600',
    noFiles: 'block text-slate-800 text-sm mb-1',
    fileItem: 'block flex text-slate-800 text-sm mb-1',
    removeFiles: 'ml-auto text-slate-500 text-sm'
  },
  month: textClassification,
  number: textClassification,
  password: textClassification,
  radio: {
    // if we want to override a given sectionKey
    // we can do a spread of the default value
    // along with a new definition for our target.
    ...boxClassification,
    input: boxClassification.input.replace('rounded-md', 'rounded-full')
  },
  range: {
    inner: 'max-w-mdFIXME',
    input:
      'form-range appearance-none w-full h-2 p-0 bg-slate-200 rounded-full focus:outline-none focus:ring-0 focus:shadow-none'
  },
  search: textClassification,
  select: {
    ...textClassification,
    input: textClassification.input + ' data-[placeholder=true]:text-slate-400'
  },
  submit: {
    wrapper: 'mb-1',
    input: 'btn-primary'
  },
  tel: textClassification,
  text: textClassification,
  textarea: {
    ...textClassification,
    input:
      'block w-full h-32 px-3 border-none text-base placeholder-slate-400 focus:shadow-outline'
  },
  time: textClassification,
  url: textClassification,
  week: textClassification
};
