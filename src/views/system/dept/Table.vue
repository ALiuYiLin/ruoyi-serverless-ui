<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import Card from '@/components/ui/card/Card.vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { SysDept } from '@/types'
import useSystemDeptStore from '@/store/system/dept'

const deptStore = useSystemDeptStore()

interface DeptRow {
  dept: SysDept
  level: number
  hasChildren: boolean
  expanded: boolean
}

const expandedIds = ref<Set<number>>(new Set())

function collectExpandableIds(nodes: SysDept[], target: Set<number>) {
  for (const node of nodes) {
    if (node.children?.length && node.deptId != null) {
      target.add(node.deptId)
      collectExpandableIds(node.children, target)
    }
  }
  return target
}

/** 列表刷新后默认全部展开 */
watch(() => deptStore.deptTree, tree => {
  expandedIds.value = collectExpandableIds(tree, new Set<number>())
}, { immediate: true })

const visibleRows = computed<DeptRow[]>(() => {
  const rows: DeptRow[] = []
  const walk = (nodes: SysDept[], level: number) => {
    for (const node of nodes) {
      const hasChildren = !!node.children?.length
      const expanded = node.deptId != null && expandedIds.value.has(node.deptId)
      rows.push({ dept: node, level, hasChildren, expanded })
      if (hasChildren && expanded) {
        walk(node.children!, level + 1)
      }
    }
  }
  walk(deptStore.deptTree, 0)
  return rows
})

const expandableIds = computed(() => [...collectExpandableIds(deptStore.deptTree, new Set<number>())])
const allExpanded = computed(
  () => expandableIds.value.length > 0 && expandableIds.value.every(id => expandedIds.value.has(id))
)

function toggleExpand(deptId?: number) {
  if (deptId == null) {
    return
  }
  const next = new Set(expandedIds.value)
  if (next.has(deptId)) {
    next.delete(deptId)
  } else {
    next.add(deptId)
  }
  expandedIds.value = next
}

function toggleExpandAll() {
  expandedIds.value = allExpanded.value ? new Set<number>() : new Set(expandableIds.value)
}

/** 保存排序 */
const savingSort = ref(false)
async function handleSaveSort() {
  if (savingSort.value) {
    return
  }
  savingSort.value = true
  try {
    const count = await deptStore.saveSort()
    if (count === 0) {
      ElMessage.warning('未检测到排序修改')
    } else {
      ElMessage.success('排序保存成功')
    }
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    savingSort.value = false
  }
}

/** 删除 */
const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await deptStore.confirmDelete()
    if (ok) {
      ElMessage.success('删除成功')
    }
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full">
      <!-- 工具栏 -->
      <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
        <Flex align="center" :gap="5">
          <Button variant="ghost" size="sm" radius="md" :disabled="savingSort || deptStore.loading" @click="handleSaveSort">
            <Loader2 v-if="savingSort" class="animate-spin" />
            <Check v-else />
            保存排序
          </Button>
          <Button variant="ghost" size="sm" radius="md" :disabled="deptStore.loading" @click="toggleExpandAll">
            <ChevronsUpDown />
            {{ allExpanded ? '折叠' : '展开' }}
          </Button>
        </Flex>
      </Flex>

      <!-- 表格 -->
      <div class="min-h-0 flex-1 overflow-auto">
        <Table class="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead class="w-[30%]">部门名称</TableHead>
              <TableHead class="w-[16%]">排序</TableHead>
              <TableHead class="w-[10%]">状态</TableHead>
              <TableHead class="w-[20%]">创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <!-- 加载中骨架 -->
            <template v-if="deptStore.loading">
              <TableRow v-for="index in 6" :key="`skeleton-${index}`" class="h-14">
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="visibleRows.length === 0" class="h-14">
              <TableCell :colspan="5" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="row in visibleRows" :key="row.dept.deptId" class="h-14">
                <TableCell class="truncate">
                  <span class="inline-flex items-center gap-1" :style="{ paddingLeft: `${row.level * 16}px` }">
                    <button
                      v-if="row.hasChildren"
                      type="button"
                      class="flex size-4 shrink-0 items-center justify-center"
                      @click="toggleExpand(row.dept.deptId)"
                    >
                      <ChevronDown v-if="row.expanded" class="size-4" />
                      <ChevronRight v-else class="size-4" />
                    </button>
                    <span v-else class="size-4 shrink-0" />
                    <button
                      type="button"
                      class="cursor-pointer text-left hover:text-primary hover:underline"
                      @click="deptStore.openViewForm(row.dept)"
                    >
                      {{ row.dept.deptName }}
                    </button>
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    :model-value="row.dept.orderNum"
                    type="number"
                    min="0"
                    class="h-8 w-[88px]"
                    radius="md"
                    @update:model-value="value => (row.dept.orderNum = Number(value) || 0)"
                  />
                </TableCell>
                <TableCell>
                  <span :class="row.dept.status === '0' ? 'text-green-600' : 'text-muted-foreground'">
                    {{ row.dept.status === '0' ? '正常' : '停用' }}
                  </span>
                </TableCell>
                <TableCell class="truncate">{{ row.dept.createTime }}</TableCell>
                <TableCell>
                  <Flex :gap="2">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      radius="md"
                      title="修改"
                      @click="deptStore.openEditForm(row.dept)"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      radius="md"
                      title="新增子部门"
                      @click="deptStore.openAddForm(row.dept)"
                    >
                      <Plus />
                    </Button>
                    <Button
                      v-if="row.dept.parentId !== 0"
                      variant="ghost"
                      size="icon-xs"
                      radius="md"
                      title="删除"
                      @click="deptStore.openDeleteConfirm(row.dept.deptId!)"
                    >
                      <Trash2 />
                    </Button>
                  </Flex>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </Flex>

    <!-- 删除确认 -->
    <AlertDialog v-model:open="deptStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除部门</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除选中的部门吗？删除后不可恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="deptStore.closeDeleteConfirm()">取消</AlertDialogCancel>
          <Button color="danger" radius="md" :disabled="deleting" @click="handleConfirmDelete">
            <Loader2 v-if="deleting" class="animate-spin" />
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>

<style scoped>
.table-toolbar{
  border-bottom: 2px solid #f0f0f0ff;
}
</style>
