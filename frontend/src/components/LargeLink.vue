<template>
  <a class="flex items-center rounded-lg px-4 py-4 shadow hover:shadow-md sm:px-6 sm:py-6 bg-slate-100/50" :href="href" target="_blank">
    <font-awesome-icon :icon="icon" class="w-10 h-10 text-slate-400 mr-7 ml-2" />
    <div class="grow">
      <div class="text-slate-600 font-medium text-lg">{{ title }}</div>
      <div class="text-slate-400">{{ subtitle }}</div>
    </div>
    <font-awesome-icon icon="fa-solid fa-arrow-right" class="w-8 h-8 text-slate-300 ml-7 mr-2" />
  </a>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  href: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  }
});
</script>
