<template>
  <the-stats />

  <template v-if="!isAuthenticated">
    <page-header title="23gate: we deliver EVM blockchain Events as webhooks" class="mt-24" />

    <p>It looks deceptively simple to watch for Events on EVM blockchains, but it's actually quite a complicated task.</p>
    <p>RPC endpoints often disconnect, leading to missed blocks and messed up Events. You'd have to watch for forks and keep track of blocks scanned and transactions parsed. You'd have to wait for confirmations. You'd need to store and manage a local state for all of that.</p>
    <p>23gate handles all that for you and sends you a clear webhook when the Event definitely happened.</p>
  </template>

  <page-header title="Important pages" class="mt-24" />

  <large-link icon="fa-solid fa-person-harassing" title="Documentation and quickstart" subtitle="Sample server and service description" href="https://23gate.gitbook.io/23gate/" />
  <large-link class="mt-8" icon="fa-solid fa-person-drowning" title="FAQ" subtitle="Frequently Asked Questions" href="https://23gate.gitbook.io/23gate/faq" />
  <large-link class="mt-8" icon="fa-solid fa-pizza-slice" title="Payload" subtitle="JSON format description and details" href="https://23gate.gitbook.io/23gate/payload-format" />
</template>

<script setup>
import PageHeader from '@/components/PageHeader.vue';
import LargeLink from '@/components/LargeLink.vue';
import TheStats from '@/components/TheStats.vue';
import { isAuthenticated } from '@/useSession';
</script>

<style lang="scss" scoped>
p {
  @apply text-slate-500 py-3;
  max-width: 810px;
}
</style>

