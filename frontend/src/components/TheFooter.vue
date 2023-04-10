<template>
  <footer>
    <div class="mx-auto max-w-7xl py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
      <div class="flex justify-center space-x-6 md:order-2">
        <a href="https://t.me/two_three_gate" target="_blank">
          <span class="sr-only">Telegram</span>
          <font-awesome-icon icon="fa-brands fa-telegram" class="h-6 w-6" aria-hidden="true" />
        </a>

        <a href="https://github.com/23gate/23gate/" target="_blank">
          <span class="sr-only">Github</span>
          <font-awesome-icon icon="fa-brands fa-github" class="h-6 w-6" aria-hidden="true" />
        </a>

        <a href="mailto:me@egorfine.com">
          <span class="sr-only">Email</span>
          <font-awesome-icon icon="fa-solid fa-envelope" class="h-6 w-6" aria-hidden="true" />
        </a>

        <a href="https://twitter.com/23gatecom" target="_blank">
          <span class="sr-only">Twitter</span>
          <font-awesome-icon icon="fa-brands fa-twitter" class="h-6 w-6" aria-hidden="true" />
        </a>
      </div>

      <div class="mt-8 md:order-1 md:mt-0">
        <p class="text-center text-base text-slate-400">
          <span>&copy; 2022-2023 The 23gate team</span>

          <span class="mx-5 boredr-slate-200 border-l" />

          Made in <span class="text-lg mx-1 relative top-[2px]" style="opacity: 0.6">🇺🇦</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
a {
  @apply text-slate-400 hover:text-slate-500;
}
</style>
