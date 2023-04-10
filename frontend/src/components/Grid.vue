<template>
  <grid-table
    :rows="rows"
    :row-class="rowClass"
    :columns="columns"
    :sort="query.sort"
    :is-direction-desc="query.isDirectionDesc"
    v-bind="$attrs"
    @sort="sortBy"
  />

  <grid-paginator v-if="showPaginator" v-model="page" :pages="pages" :range="paginatorRange" :no-input="!paginatorInput" />
</template>

<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>
import GridTable from '@/components/GridTable.vue';
import GridPaginator from '@/components/GridPaginator.vue';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, watch } from 'vue';
import { $error } from '@/notify';

defineExpose({
  reload,
  updateRow,
  showCreatedRow
});

const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },

  rowClass: {
    type: [String, Function],
    default: null
  },

  dataHandler: {
    type: Function,
    default: () => ({ total: 0, rows: [] })
  },

  showPaginator: {
    type: Boolean,
    default: true
  },

  paginatorRange: {
    type: Number,
    default: 1
  },

  paginatorInput: {
    type: Boolean,
    default: true
  },

  perPage: {
    type: Number,
    default: 10
  }
});

const total = ref(0);
const rows = ref([]);

const router = useRouter();
const route = useRoute();

const query = computed({
  get: () => ({
    limit: route.query.limit || props.perPage,
    offset: parseInt(route.query.offset || 0, 10),
    sort: route.query.sort || null,
    isDirectionDesc: route.query.direction == 'DESC'
  }),
  set: val => {
    const _query = Object.assign({}, route.query, {
      limit: val.limit,
      offset: val.offset
    });

    if (val.sort) {
      _query.sort = val.sort;
      _query.direction = val.isDirectionDesc ? 'DESC' : 'ASC'
    }

    router.push({ path: route.path, query: _query });
  }
});

const page = computed({
  get: () => parseInt(query.value.offset / query.value.limit, 10) + 1,
  set: val => {
    const _query = {...query.value};
    _query.offset = _query.limit * (val - 1);
    query.value = _query;
  }
});

const pages = computed(() => parseInt(total.value / query.value.limit, 10) + (total.value % query.value.limit ? 1 : 0));

async function getRows() {
  const _query = {
    limit: query.value.limit,
    offset: query.value.offset,
    sort: query.value.sort || '',
    direction: query.value.isDirectionDesc ? 'DESC' : 'ASC'
  }

  let result;
  try {
    result = await props.dataHandler(_query);
  } catch (err) {
    console.error(err);
    $error("Request failed", "Couldn't call data handler");
    return;
  }

  if (!result) {
    return;
  }

  total.value = result.total;
  rows.value = result.rows;
}

function sortBy(column) {
  query.value = {
    limit: query.value.limit,
    offset: 0,
    sort: column,
    isDirectionDesc: query.value.sort == column ? !query.value.isDirectionDesc : false
  };
}

function updateRow(index, row) {
  if ((index ?? null) === null) {
    console.error('Internal bug', 'Index must be set in updateRow');
    return;
  }
  if (!rows.value[index]) {
    console.error('Internal bug', 'Index not exists in updateRow');
    return;
  }
  if (rows.value[index].id !== row.id) {
    console.error('Internal bug', 'Row was changed before updateRow');
    return;
  }
  rows.value[index] = row;
}

async function reload() {
  return getRows();
}

function showCreatedRow() {
  if (query.value.offset === 0 && query.value.sort == 'id' && query.value.isDirectionDesc) {
    getRows();
    return;
  }

  query.value = {
    limit: query.value.limit,
    offset: 0,
    sort: 'id',
    isDirectionDesc: true
  };
}

watch(
  [ () => route.query, () => route.path ],
  ([ , path ], [ , oldPath ]) => {
    if (path !== oldPath) {
      return;
    }
    getRows();
  }
);

getRows();
</script>
