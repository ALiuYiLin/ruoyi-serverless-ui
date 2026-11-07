<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronDown, ChevronRight } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { TreeSelect } from '@/types'

const props = withDefaults(defineProps<{
  modelValue?: number
  options: TreeSelect[]
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: '请选择归属部门',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | undefined): void
}>()

const open = ref(false)
const expandedIds = ref<number[]>([])

interface DeptRow {
  id?: number
  label: string
  level: number
  hasChildren: boolean
  expanded: boolean
}

/** 根据展开状态拍平部门树，渲染成带缩进/展开图标的列表 */
const visibleRows = computed<DeptRow[]>(() => {
  const rows: DeptRow[] = []
  const walk = (nodes: TreeSelect[], level: number) => {
    for (const node of nodes) {
      const hasChildren = !!node.children?.length
      const expanded = node.id != null && expandedIds.value.includes(node.id)
      rows.push({ id: node.id, label: node.label ?? '', level, hasChildren, expanded })
      if (hasChildren && expanded) {
        walk(node.children, level + 1)
      }
    }
  }
  walk(props.options, 0)
  return rows
})

const selectedLabel = computed(() => {
  if (props.modelValue == null) {
    return ''
  }
  const find = (nodes: TreeSelect[]): string | undefined => {
    for (const node of nodes) {
      if (node.id === props.modelValue) {
        return node.label ?? ''
      }
      const child = node.children?.length ? find(node.children) : undefined
      if (child) {
        return child
      }
    }
    return undefined
  }
  return find(props.options) ?? ''
})

/** 打开时自动展开到当前选中节点 */
function expandPathToSelected() {
  if (props.modelValue == null) {
    return
  }
  const path: number[] = []
  const find = (nodes: TreeSelect[]): boolean => {
    for (const node of nodes) {
      if (node.id == null) {
        continue
      }
      if (node.id === props.modelValue) {
        return true
      }
      if (node.children?.length) {
        path.push(node.id)
        if (find(node.children)) {
          return true
        }
        path.pop()
      }
    }
    return false
  }
  find(props.options)
  expandedIds.value = Array.from(new Set([...expandedIds.value, ...path]))
}

watch(open, value => {
  if (value) {
    expandPathToSelected()
  }
})
watch(() => props.modelValue, () => expandPathToSelected())

function toggleExpand(row: DeptRow) {
  if (row.id == null || !row.hasChildren) {
    return
  }
  const expanded = new Set(expandedIds.value)
  if (expanded.has(row.id)) {
    expanded.delete(row.id)
  } else {
    expanded.add(row.id)
  }
  expandedIds.value = [...expanded]
}

function selectRow(row: DeptRow) {
  emit('update:modelValue', row.id)
  open.value = false
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" radius="md" type="button" class="w-full justify-between font-normal" :disabled="disabled">
        <span :class="selectedLabel ? '' : 'text-muted-foreground'">
          {{ selectedLabel || placeholder }}
        </span>
        <ChevronDown class="size-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[280px] p-1" align="start">
      <div class="max-h-64 overflow-y-auto">
        <div
          v-for="(row, index) in visibleRows"
          :key="`${row.id ?? 'node'}-${index}`"
          class="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          :class="{ 'bg-muted': row.id != null && row.id === modelValue }"
          :style="{ paddingLeft: `${row.level * 16 + 8}px` }"
          @click="selectRow(row)"
        >
          <span
            class="flex size-4 shrink-0 items-center justify-center"
            @click.stop="toggleExpand(row)"
          >
            <ChevronDown v-if="row.hasChildren && row.expanded" class="size-4" />
            <ChevronRight v-else-if="row.hasChildren" class="size-4" />
          </span>
          <span class="truncate">{{ row.label }}</span>
        </div>
        <div v-if="visibleRows.length === 0" class="px-2 py-4 text-center text-sm text-muted-foreground">
          暂无部门
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
