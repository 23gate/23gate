<template>
  <div class="flex flex-col">
    <div class="-my-2">
      <div class="inline-block min-w-full py-2 align-middle">
        <div class="shadow shadow-slate-200/20 border border-slate-300 rounded-md">
          <table class="w-full min-w-full rounded-md border-slate-300" :class="dataLoadedClass">

            <thead class="bg-slate-400/10 sticky top-0">
              <tr>
                <th
                  v-for="(column, key) in columns"
                  :key="`th_${key}`"
                  scope="col"
                  class="sticky top-0 z-10 py-3 px-2 sm:px-3 lg:px-4 text-left text-sm font-semibold text-slate-500 dark:text-white/60 h-10 leading-4 first:rounded-tl last:rounded-tr"
                  :class="titleClass(column)"
                >
                  <component :is="column.titleComponent" v-if="column.titleComponent" v-bind="$attrs" class="align-middle" />
                  <a v-else-if="column.sortable" href="#" class="group inline-flex" @click.prevent="sortBy(column.prop || key)">
                    {{ column.title }}
                    <span
                      class="ml-2 flex-none rounded-md text-slate-400"
                      :class="(column.prop == sort || key === sort) ? 'bg-slate-200 text-slate-500 group-hover:bg-slate-300' : 'invisible group-hover:visible group-focus:visible'"
                    >
                      <font-awesome-icon icon="fa-solid fa-chevron-down" class="h-4 w-4" :class="(column.prop == sort || key === sort) && isDirectionDesc ? 'rotate-0' : 'rotate-180'" />
                    </span>
                  </a>
                  <template v-else>
                    {{ column.title }}
                  </template>
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-400/30">
              <tr v-for="(row, index) in rows" :key="row.id" :class="rowClass(row, index)" @mouseenter="(hoveredRow = index)" @mouseleave="(hoveredRow = null)">

                <td
                  v-for="(column, key) in columns"
                  :key="`td_${index}_${key}`"
                  class="px-2 sm:px-3 lg:px-4 py-3 text-sm text-slate-500"
                  :class="columnClass(column, row)"
                  @click="column.click ? column.click(row, index) : null"
                >
                  <component :is="column.component" v-if="column.component" :row="{...row}" :index="index" :is-row-hovered="(hoveredRow === index)" v-bind="$attrs" />

                  <template v-else>
                    {{ cellContent(column, row) }}
                    <dl v-if="key == 0" class="font-normal">
                      <template v-for="(col, k) in columns" :key="`td_${index}_${key}_${k}`">
                        <template v-if="col.collapse">
                          <dt class="sr-only" :class="`${col.collapse}:hidden`">{{ col.title }}</dt>
                          <dd class="mt-1 truncate opacity-60" :class="collapsedColumnClass(col, row) + ` ${col.collapse}:hidden`" @click="col.click ? col.click(row, index) : null">{{ cellContent(col, row) }}</dd>
                        </template>
                      </template>
                    </dl>
                  </template>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch } from 'vue';

// NOTE: Excess reactivity in case we pass "item" not "{...item}" in <component :is="column.component">
const props = defineProps({
  rowClass: {
    type: [String, Function],
    default: null
  },
  rows: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    default: () => []
  },
  sort: {
    type: String,
    default: null
  },
  isDirectionDesc: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([ 'sort' ]);

const dataLoadedClass = ref('data-loaded');

const hoveredRow = shallowRef(false);

watch(
  () => props.rows,
  () => {
    dataLoadedClass.value = 'data-loaded';
    setTimeout(() => { dataLoadedClass.value = ''; }, 100);
  },
  { immediate: true }
);

function rowClass(row, index) {
  if (typeof props.rowClass === 'function') {
    return props.rowClass(row, index);
  }
  return props.rowClass;
}

function titleClass(column) {
  const classes = [''];
  if (column.collapse) {
    classes.push('hidden', `${column.collapse}:table-cell`);
  }
  if (column.titleClass) {
    classes.push(column.titleClass);
  }
  if (props.rows.length) {
    classes.push('border-b', 'border-slate-300');
  } else {
    classes.push('first:rounded-bl', 'last:rounded-br');
  }
  return classes.join(' ');
}

function columnClass(column, row = null) {
  const classes = [''];
  if (column.collapse) {
    classes.push('hidden', `${column.collapse}:table-cell`);
  }
  if (column.class) {
    if (typeof column.class === 'function') {
      classes.push(column.class(row));
    } else {
      classes.push(column.class);
    }
  }
  if (!column.component) {
    classes.push('truncate');
  }
  return classes.join(' ');
}

function collapsedColumnClass(column, row = null) {
  if (typeof column.class === 'function') {
    return column.class(row);
  }
  return column.class;
}

function cellContent(column, row) {
  if (typeof column.value === 'function') {
    return column.value(row);
  }

  if (column.prop) {
    return row[column.prop];
  }
  // FIXME: more possible casses
  return column.value;
}

function sortBy(column) {
  emit('sort', column);
}
</script>

<style scoped lang="scss">
// Data appear animation
td {
  opacity: 1;
  transform: scale(1);
  transition: all 0.2s ease-out;
}
.data-loaded {
  td:not(.no-animation) {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
