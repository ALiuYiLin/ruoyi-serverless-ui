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
import SvgIcon from '@/components/SvgIcon/index.vue'
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
import type { SysMenu } from '@/types'
import useSystemMenuStore from '@/store/system/menu'

const menuStore = useSystemMenuStore()

interface MenuRow {
  menu: SysMenu
  level: number
  hasChildren: boolean
  expanded: boolean
}

const expandedIds = ref<Set<number>>(new Set())

function collectExpandableIds(nodes: SysMenu[], target: Set<number>) {
  for (const node of nodes) {
    if (node.children?.length && node.menuId != null) {
      target.add(node.menuId)
      collectExpandableIds(node.children, target)
    }
  }
  return target
}

watch(() => menuStore.menuTree, tree => {
  expandedIds.value = collectExpandableIds(tree, new Set<number>())
}, { immediate: true })

const visibleRows = computed<MenuRow[]>(() => {
  const rows: MenuRow[] = []
  const walk = (nodes: SysMenu[], level: number) => {
    for (const node of nodes) {
      const hasChildren = !!node.children?.length
      const expanded = node.menuId != null && expandedIds.value.has(node.menuId)
      rows.push({ menu: node, level, hasChildren, expanded })
      if (hasChildren && expanded) {
        walk(node.children!, level + 1)
      }
    }
  }
  walk(menuStore.menuTree, 0)
  return rows
})

const expandableIds = computed(() => [...collectExpandableIds(menuStore.menuTree, new Set<number>())])
const allExpanded = computed(
  () => expandableIds.value.length > 0 && expandableIds.value.every(id => expandedIds.value.has(id))
)

function toggleExpand(menuId?: number) {
  if (menuId == null) {
    return
  }
  const next = new Set(expandedIds.value)
  if (next.has(menuId)) {
    next.delete(menuId)
  } else {
    next.add(menuId)
  }
  expandedIds.value = next
}

function toggleExpandAll() {
  expandedIds.value = allExpanded.value ? new Set<number>() : new Set(expandableIds.value)
}

function menuTypeLabel(menu: SysMenu) {
  if (menu.menuType === 'M') {
    return menu.isFrame === '0' ? '外链' : '目录'
  }
  if (menu.menuType === 'C') {
    return menu.isFrame === '0' ? '外链' : '菜单'
  }
  return '按钮'
}

function menuTypeClass(menu: SysMenu) {
  if (menu.menuType === 'M') {
    return 'text-blue-600'
  }
  if (menu.menuType === 'C') {
    return 'text-green-600'
  }
  return 'text-orange-600'
}

const savingSort = ref(false)
async function handleSaveSort() {
  if (savingSort.value) {
    return
  }
  savingSort.value = true
  try {
    const count = await menuStore.saveSort()
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

const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await menuStore.confirmDelete()
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
      <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
        <Flex align="center" :gap="5">
          <Button variant="ghost" size="sm" radius="md" :disabled="savingSort || menuStore.loading" @click="handleSaveSort">
            <Loader2 v-if="savingSort" class="animate-spin" />
            <Check v-else />
            保存排序
          </Button>
          <Button variant="ghost" size="sm" radius="md" :disabled="menuStore.loading" @click="toggleExpandAll">
            <ChevronsUpDown />
            {{ allExpanded ? '折叠' : '展开' }}
          </Button>
        </Flex>
      </Flex>

      <div class="min-h-0 flex-1 overflow-auto">
        <Table class="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead class="w-[24%]">菜单名称</TableHead>
              <TableHead class="w-[8%]">类型</TableHead>
              <TableHead class="w-[10%]">排序</TableHead>
              <TableHead class="w-[16%]">权限标识</TableHead>
              <TableHead class="w-[18%]">组件路径</TableHead>
              <TableHead class="w-[7%]">状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="menuStore.loading">
              <TableRow v-for="index in 6" :key="`skeleton-${index}`" class="h-14">
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="visibleRows.length === 0" class="h-14">
              <TableCell :colspan="7" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="row in visibleRows" :key="row.menu.menuId" class="h-14">
                <TableCell class="truncate">
                  <span class="inline-flex items-center gap-1" :style="{ paddingLeft: `${row.level * 16}px` }">
                    <button
                      v-if="row.hasChildren"
                      type="button"
                      class="flex size-4 shrink-0 items-center justify-center"
                      @click="toggleExpand(row.menu.menuId)"
                    >
                      <ChevronDown v-if="row.expanded" class="size-4" />
                      <ChevronRight v-else class="size-4" />
                    </button>
                    <span v-else class="size-4 shrink-0" />
                    <SvgIcon v-if="row.menu.icon" :icon-class="row.menu.icon" class="size-4 shrink-0" />
                    <button
                      type="button"
                      class="cursor-pointer text-left hover:text-primary hover:underline"
                      @click="menuStore.openViewForm(row.menu)"
                    >
                      {{ row.menu.menuName }}
                    </button>
                  </span>
                </TableCell>
                <TableCell>
                  <span :class="menuTypeClass(row.menu)" class="text-xs">{{ menuTypeLabel(row.menu) }}</span>
                </TableCell>
                <TableCell>
                  <Input
                    :model-value="row.menu.orderNum"
                    type="number"
                    min="0"
                    class="h-8 w-[88px]"
                    radius="md"
                    @update:model-value="value => (row.menu.orderNum = Number(value) || 0)"
                  />
                </TableCell>
                <TableCell class="truncate">{{ row.menu.perms }}</TableCell>
                <TableCell class="truncate">{{ row.menu.component }}</TableCell>
                <TableCell>
                  <span :class="row.menu.status === '0' ? 'text-green-600' : 'text-muted-foreground'">
                    {{ row.menu.status === '0' ? '正常' : '停用' }}
                  </span>
                </TableCell>
                <TableCell>
                  <Flex :gap="2">
                    <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="menuStore.openEditForm(row.menu)">
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-xs" radius="md" title="新增子菜单" @click="menuStore.openAddForm(row.menu)">
                      <Plus />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      radius="md"
                      title="删除"
                      @click="menuStore.openDeleteConfirm(row.menu.menuId!)"
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

    <AlertDialog v-model:open="menuStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除菜单</AlertDialogTitle>
          <AlertDialogDescription>确定要删除选中的菜单吗？删除后不可恢复。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="menuStore.closeDeleteConfirm()">取消</AlertDialogCancel>
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
