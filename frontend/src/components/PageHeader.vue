<template>
  <div class="sm:flex sm:items-center mt-2 mb-10">
    <div class="sm:flex-auto">
      <h1 class="text-2xl font-semibold opacity-80">
        {{ title }}
        <span v-if="identifier" class="text-slate-400 ml-2">#{{ identifier }}</span>
      </h1>
      <p v-if="subtitle" class="mt-2 text-sm opacity-60">{{ subtitle }}</p>
    </div>
    <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: null
  },
  identifier: {
    type: String,
    default: null
  }
})
</script>