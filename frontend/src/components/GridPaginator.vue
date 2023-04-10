<template>
  <nav class="border-t-2 border-transparent px-4 pb-5 flex items-center justify-between sm:px-0 -z-10">
    <div class="-mt-px w-0 flex-1 flex">
      <a
        href="#"
        class="border-t-2 border-transparent pt-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 pr-1"
        :class="{ disabled: page == 1 }"
        @click.prevent="page--"
      >
        <font-awesome-icon icon="fa-solid fa-arrow-left-long" class="mr-3 h-4 w-4 text-slate-400" />
        Previous
      </a>
    </div>

    <div class="hidden md:-mt-px md:flex">
      <template v-for="index in pageList" :key="index">
        <input v-if="isInputShown(index)" type="text" class="relative top-2 inline-block p-0 rounded-md w-12 h-10 text-center text-slate-600 border-slate-300" :value="page" @change="jumpTo">

        <a
          v-else-if="isPageShown(index)"
          href="#"
          class="min-w-[3rem] border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 border-t-2 pt-4 inline-flex justify-center items-center text-sm font-medium"
          :class="{'border-slate-500 text-slate-600 pointer-events-none': page == index}"
          @click.prevent="page = index"
        >
          {{ index }}
        </a>

        <span v-else-if="isDotsShown(index)" class="min-w-[3rem] border-transparent text-slate-500 border-t-2 pt-4 inline-flex justify-center items-center text-sm font-medium"> ... </span>
      </template>
    </div>

    <div class="-mt-px w-0 flex-1 flex justify-end">
      <a
        href="#"
        class="border-t-2 border-transparent pt-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 pl-1"
        :class="{ disabled: !pages || page == pages }"
        @click.prevent="page++"
      >
        Next
        <font-awesome-icon icon="fa-solid fa-arrow-right-long" class="ml-3 h-4 w-4 text-slate-400" />
      </a>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
    validator: value => value > 0
  },

  pages: {
    type: Number,
    default: 0
  },

  range: {
    type: Number,
    default: 1
  },

  noInput: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([ 'update:modelValue' ]);

const page = computed({
  get: () => props.modelValue,
  set: val => {
    if (val < 1 || val > props.pages) {
      console.error('Wrong paginator page value');
      return;
    }

    emit('update:modelValue', val);
  }
});

const pageList = computed(() => [...Array(props.pages).keys()].map(x => x + 1));

function isInputShown(index) {
  if (props.noInput) {
    return false;
  }

  if (page.value !== index) {
    return false;
  }

  if (props.pages <= props.range * 2 + 5) {
    return false;
  }

  return true;
}

function isPageShown(index) {

  if (index == 1 || index == props.pages) {
    return true;
  }

  if (props.pages <= props.range * 2 + 5) {
    return true;
  }

  if (index >= page.value - props.range && index <= page.value + props.range) {
    return true;
  }

  if (page.value <= props.range + 3 && index <= props.range * 2 + 3) {
    return true;
  }

  if (page.value >= props.pages - props.range - 2 && index >= props.pages - props.range * 2 - 2) {
    return true;
  }

  return false;
}

function isDotsShown(index) {
  if (index == 2 && !isPageShown(index)) {
    return true;
  }

  if (index == props.pages - 1 && !isPageShown(index)) {
    return true;
  }

  return false;
}

function jumpTo(event) {
  const val = parseInt(event.target.value, 10) || 0;
  if (val < 1 || val > props.pages) {
    event.target.value = page.value;
    return;
  }
  page.value = val;
}
</script>
