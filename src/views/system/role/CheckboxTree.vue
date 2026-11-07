<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronDown, ChevronRight } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import { Checkbox } from '@/components/ui/checkbox'
import type { TreeSelect } from '@/types'

const props = withDefaults(defineProps<{
  data: TreeSelect[]
  modelValue?: number[]
  /** 父子联动：true 表示选中父节点会带动子节点 */
  parentChildLinked?: boolean
  defaultExpandAll?: boolean
  disabled?: boolean
}>(), {
  modelValue: () => [],
  parentChildLinked: true,
  defaultExpandAll: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
  (e: 'update:parentChildLinked', value: boolean): void
}>()

interface TreeNodeInfo {
  id: number
  label: string
  parentId?: number
  childrenIds: number[]
  level: number
}

const nodeMap = computed(() => {
  const map = new Map<number, TreeNodeInfo>()
  const walk = (nodes: TreeSelect[], parentId: number | undefined, level: number) => {
    for (const node of nodes) {
      if (node.id == null) {
        continue
      }
      const childrenIds = (node.children ?? [])
        .filter(child => child.id != null)
        .map(child => child.id as number)
      map.set(node.id, { id: node.id, label: node.label ?? '', parentId, childrenIds, level })
      if (node.children?.length) {
        walk(node.children, node.id, level + 1)
      }
    }
  }
  walk(props.data, undefined, 0)
  return map
})

const checkedIds = ref<Set<number>>(new Set())
const expandedIds = ref<Set<number>>(new Set())

/** 数据或外部值变化时重置选中状态 */
watch([() => props.data, () => props.modelValue], ([, ids]) => {
  checkedIds.value = new Set((ids ?? []).filter(id => nodeMap.value.has(id)))
}, { immediate: true, deep: true })

watch([() => props.data, () => props.defaultExpandAll], () => {
  if (props.defaultExpandAll) {
    expandedIds.value = new Set(nodeMap.value.keys())
  }
}, { immediate: true, deep: true })

/** 选中节点时需要写入的叶子节点 */
function getLeafIds(id: number): number[] {
  const info = nodeMap.value.get(id)
  if (!info) {
    return []
  }
  if (!info.childrenIds.length) {
    return [id]
  }
  return info.childrenIds.flatMap(childId => getLeafIds(childId))
}

function isChecked(id: number): boolean {
  const info = nodeMap.value.get(id)
  if (!info) {
    return false
  }
  if (!props.parentChildLinked || !info.childrenIds.length) {
    return checkedIds.value.has(id)
  }
  return info.childrenIds.every(childId => isChecked(childId))
}

function hasCheckedDescendant(id: number): boolean {
  const info = nodeMap.value.get(id)
  if (!info) {
    return false
  }
  return info.childrenIds.some(childId => isChecked(childId) || hasCheckedDescendant(childId))
}

function isIndeterminate(id: number): boolean {
  const info = nodeMap.value.get(id)
  if (!info || !props.parentChildLinked || !info.childrenIds.length || isChecked(id)) {
    return false
  }
  return info.childrenIds.some(childId => isChecked(childId) || hasCheckedDescendant(childId))
}

function collectCheckedIds(): number[] {
  const result: number[] = []
  for (const id of nodeMap.value.keys()) {
    if (isChecked(id)) {
      result.push(id)
    }
  }
  return result
}

function toggleNode(id: number, value: boolean | 'indeterminate') {
  if (props.disabled) {
    return
  }
  const info = nodeMap.value.get(id)
  if (!info) {
    return
  }
  const next = new Set(checkedIds.value)
  const target = value === true
  if (props.parentChildLinked && info.childrenIds.length) {
    for (const leafId of getLeafIds(id)) {
      if (target) {
        next.add(leafId)
      } else {
        next.delete(leafId)
      }
    }
  } else {
    if (target) {
      next.add(id)
    } else {
      next.delete(id)
    }
  }
  checkedIds.value = next
  emit('update:modelValue', collectCheckedIds())
}

function toggleExpand(id: number) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedIds.value = next
}

const expandableIds = computed(() =>
  [...nodeMap.value.values()].filter(info => info.childrenIds.length > 0).map(info => info.id)
)
const allExpanded = computed(
  () => expandableIds.value.length > 0 && expandableIds.value.every(id => expandedIds.value.has(id))
)

const leafIds = computed(() =>
  [...nodeMap.value.values()].filter(info => !info.childrenIds.length).map(info => info.id)
)
const allChecked = computed(() => leafIds.value.length > 0 && leafIds.value.every(id => checkedIds.value.has(id)))
const someChecked = computed(() => [...checkedIds.value].some(id => nodeMap.value.has(id)))

function toggleExpandAll(value: boolean | 'indeterminate') {
  expandedIds.value = value === true ? new Set(expandableIds.value) : new Set()
}

function toggleCheckAll(value: boolean | 'indeterminate') {
  if (props.disabled) {
    return
  }
  const next = new Set<number>()
  if (value === true) {
    if (props.parentChildLinked) {
      leafIds.value.forEach(id => next.add(id))
    } else {
      nodeMap.value.forEach((_info, id) => next.add(id))
    }
  }
  checkedIds.value = next
  emit('update:modelValue', collectCheckedIds())
}

function toggleLinked(value: boolean | 'indeterminate') {
  if (props.disabled) {
    return
  }
  emit('update:parentChildLinked', value === true)
}

interface TreeRow {
  id: number
  label: string
  level: number
  hasChildren: boolean
  expanded: boolean
  checked: boolean
  indeterminate: boolean
}

const visibleRows = computed<TreeRow[]>(() => {
  const rows: TreeRow[] = []
  const walk = (nodes: TreeSelect[]) => {
    for (const node of nodes) {
      if (node.id == null) {
        continue
      }
      const info = nodeMap.value.get(node.id)
      if (!info) {
        continue
      }
      const hasChildren = info.childrenIds.length > 0
      const expanded = expandedIds.value.has(node.id)
      rows.push({
        id: node.id,
        label: info.label,
        level: info.level,
        hasChildren,
        expanded,
        checked: isChecked(node.id),
        indeterminate: isIndeterminate(node.id),
      })
      if (hasChildren && expanded) {
        walk(node.children ?? [])
      }
    }
  }
  walk(props.data)
  return rows
})

/** 提交时使用：选中节点 + 半选节点 */
function getCheckedKeys(): { checked: number[]; halfChecked: number[] } {
  const checked: number[] = []
  const halfChecked: number[] = []
  for (const id of nodeMap.value.keys()) {
    if (isChecked(id)) {
      checked.push(id)
    } else if (props.parentChildLinked && isIndeterminate(id)) {
      halfChecked.push(id)
    }
  }
  return { checked, halfChecked }
}

defineExpose({ getCheckedKeys })
</script>

<template>
  <Flex direction="column" :gap="8">
    <!-- 工具行 -->
    <Flex align="center" wrap :gap="12">
      <label class="flex items-center gap-2 text-sm">
        <Checkbox
          :model-value="allExpanded"
          :disabled="disabled || !expandableIds.length"
          @update:model-value="toggleExpandAll"
        />
        展开/折叠
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Checkbox
          :model-value="allChecked ? true : someChecked ? 'indeterminate' : false"
          :disabled="disabled || !nodeMap.size"
          @update:model-value="toggleCheckAll"
        />
        全选/全不选
      </label>
      <label class="flex items-center gap-2 text-sm">
        <Checkbox
          :model-value="parentChildLinked"
          :disabled="disabled"
          @update:model-value="toggleLinked"
        />
        父子联动
      </label>
    </Flex>

    <!-- 树 -->
    <div class="max-h-72 overflow-y-auto rounded-md border border-border p-1">
      <div
        v-for="row in visibleRows"
        :key="row.id"
        class="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
      >
        <button
          type="button"
          class="flex size-4 shrink-0 items-center justify-center"
          :disabled="!row.hasChildren"
          @click="toggleExpand(row.id)"
        >
          <ChevronDown v-if="row.hasChildren && row.expanded" class="size-4" />
          <ChevronRight v-else-if="row.hasChildren" class="size-4" />
        </button>
        <Checkbox
          :model-value="row.indeterminate ? 'indeterminate' : row.checked"
          :disabled="disabled"
          @update:model-value="value => toggleNode(row.id, value)"
        />
        <span class="truncate">{{ row.label }}</span>
      </div>
      <div v-if="!visibleRows.length" class="px-2 py-4 text-center text-sm text-muted-foreground">
        暂无数据
      </div>
    </div>
  </Flex>
</template>
