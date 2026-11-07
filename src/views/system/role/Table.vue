<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Loader2,
  Pencil,
  Settings2,
  ShieldCheck,
  Trash2,
  UserPlus,
} from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
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
import { download } from '@/utils/request'
import type { SysRole } from '@/types'
import useSystemRoleStore from '@/store/system/role'

const roleStore = useSystemRoleStore()

/** 可配置显隐的列 */
const columnOptions = [
  { key: 'roleId', label: '角色编号', width: 'w-[8%]', skeleton: 'w-1/2' },
  { key: 'roleName', label: '角色名称', width: 'w-[18%]', skeleton: 'w-3/4' },
  { key: 'roleKey', label: '权限字符', width: 'w-[18%]', skeleton: 'w-2/3' },
  { key: 'roleSort', label: '显示顺序', width: 'w-[10%]', skeleton: 'w-1/2' },
  { key: 'status', label: '状态', width: 'w-[8%]', skeleton: 'w-1/2' },
  { key: 'createTime', label: '创建时间', width: 'w-[18%]', skeleton: 'w-3/4' },
] as const

type ColumnKey = typeof columnOptions[number]['key']

const columnVisible = reactive<Record<ColumnKey, boolean>>({
  roleId: true,
  roleName: true,
  roleKey: true,
  roleSort: true,
  status: true,
  createTime: true,
})

const visibleDataColumns = computed(() => columnOptions.filter(column => columnVisible[column.key]))
const visibleColumnCount = computed(() => 1 + visibleDataColumns.value.length + 1)

const skeletonRowCount = 8

/** 已选中的行 roleId */
const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysRole) => row.roleId ?? 0
const currentPageIds = computed(() => roleStore.roleList.map(row => rowId(row)))
const allPageSelected = computed(
  () => currentPageIds.value.length > 0 && currentPageIds.value.every(id => selectedIds.value.includes(id))
)
const somePageSelected = computed(() =>
  currentPageIds.value.some(id => selectedIds.value.includes(id))
)
const selectAllState = computed<boolean | 'indeterminate'>(() =>
  allPageSelected.value ? true : somePageSelected.value ? 'indeterminate' : false
)

function toggleAll(value: boolean | 'indeterminate') {
  if (value === true) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...currentPageIds.value]))
  } else {
    selectedIds.value = selectedIds.value.filter(id => !currentPageIds.value.includes(id))
  }
}

function toggleRow(id: number, value: boolean | 'indeterminate') {
  if (value === true) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter(item => item !== id)
  }
}

const currentPage = computed({
  get: () => roleStore.queryParams.pageNum ?? 1,
  set: (value: number) => roleStore.setPage(value),
})

/** 状态切换（失败回滚） */
async function handleStatusChange(row: SysRole, value: boolean | 'indeterminate') {
  const next: '0' | '1' = value === true ? '0' : '1'
  const previous = row.status
  row.status = next
  try {
    await roleStore.changeStatus(rowId(row), next)
    ElMessage.success('状态修改成功')
  } catch {
    row.status = previous
  }
}

/** 删除确认提交 */
const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await roleStore.confirmDelete()
    if (ok) {
      selectedIds.value = []
      ElMessage.success('删除成功')
    }
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    deleting.value = false
  }
}

/** 导出 */
function handleExport() {
  download('system/role/export', { ...roleStore.queryParams }, `role_${new Date().getTime()}.xlsx`)
}
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <!-- 工具栏 -->
      <Flex direction="column" class="min-h-0 flex-1">
        <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button
              color="danger"
              variant="ghost"
              size="sm"
              radius="md"
              :disabled="selectedCount === 0"
              @click="roleStore.openDeleteConfirm(selectedIds)"
            >
              批量删除
            </Button>
          </Flex>
          <Flex align="center" :gap="5">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="sm" radius="md">
                  <Settings2 />
                  列设置
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  v-for="column in columnOptions"
                  :key="column.key"
                  :model-value="columnVisible[column.key]"
                  @select.prevent
                  @update:model-value="value => (columnVisible[column.key] = value === true)"
                >
                  {{ column.label }}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" radius="md" @click="handleExport">
              <Download />
              导出
            </Button>
          </Flex>
        </Flex>
        <!-- 表格 -->
        <div class="min-h-0 flex-1 overflow-auto">
          <Table class="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead class="w-10">
                  <Checkbox :model-value="selectAllState" @update:model-value="toggleAll" />
                </TableHead>
                <TableHead
                  v-for="column in visibleDataColumns"
                  :key="column.key"
                  :class="column.width"
                >
                  {{ column.label }}
                </TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <!-- 加载中骨架 -->
              <template v-if="roleStore.loading">
                <TableRow v-for="index in skeletonRowCount" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell v-for="column in visibleDataColumns" :key="column.key">
                    <Skeleton :class="['h-4', column.skeleton]" />
                  </TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="roleStore.roleList.length === 0" class="h-14">
                <TableCell :colspan="visibleColumnCount" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in roleStore.roleList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox
                      :model-value="selectedIds.includes(rowId(row))"
                      @update:model-value="value => toggleRow(rowId(row), value)"
                    />
                  </TableCell>
                  <TableCell v-if="columnVisible.roleId" class="truncate">{{ row.roleId }}</TableCell>
                  <TableCell v-if="columnVisible.roleName" class="truncate">
                    <button
                      type="button"
                      class="cursor-pointer text-primary hover:underline"
                      @click="roleStore.openViewForm(row)"
                    >
                      {{ row.roleName }}
                    </button>
                  </TableCell>
                  <TableCell v-if="columnVisible.roleKey" class="truncate">{{ row.roleKey }}</TableCell>
                  <TableCell v-if="columnVisible.roleSort" class="truncate">{{ row.roleSort }}</TableCell>
                  <TableCell v-if="columnVisible.status">
                    <Switch
                      size="sm"
                      :model-value="row.status === '0'"
                      :disabled="row.roleId === 1"
                      @update:model-value="value => handleStatusChange(row, value)"
                    />
                  </TableCell>
                  <TableCell v-if="columnVisible.createTime" class="truncate">{{ row.createTime }}</TableCell>
                  <TableCell>
                    <Flex v-if="row.roleId !== 1" :gap="2">
                      <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="roleStore.openEditForm(row)">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="roleStore.openDeleteConfirm([rowId(row)])">
                        <Trash2 />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="数据权限" @click="roleStore.openDataScope(row)">
                        <ShieldCheck />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="分配用户" @click="roleStore.openAuthUser(row)">
                        <UserPlus />
                      </Button>
                    </Flex>
                    <span v-else class="text-xs text-muted-foreground">-</span>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </Flex>

      <!-- 分页 -->
      <Flex class="shrink-0 border-t-2" align="center" justify="space-between" :gap="8" :padding-x="14" :padding-y="9">
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ roleStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="roleStore.queryParams.pageSize ?? 10"
          :total="roleStore.total"
          :sibling-count="1"
          show-edges
          class="m-0 w-fit"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious>
              <ChevronLeftIcon class="size-4" />
              <span>上一页</span>
            </PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === (roleStore.queryParams.pageNum ?? 1)">
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationNext>
              <span>下一页</span>
              <ChevronRightIcon class="size-4" />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </Flex>
    </Flex>

    <!-- 删除确认 -->
    <AlertDialog v-model:open="roleStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除角色</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除选中的 {{ roleStore.deleteIds.length }} 个角色吗？删除后不可恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="roleStore.closeDeleteConfirm()">取消</AlertDialogCancel>
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
