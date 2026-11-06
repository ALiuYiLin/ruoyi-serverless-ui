<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useElementSize, useResizeObserver } from '@vueuse/core'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  KeyRound,
  Loader2,
  Pencil,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
} from '@lucide/vue'

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
import { ElMessage } from 'element-plus'
import type { SysUser } from '@/types'
import useSystemUserStore from '@/store/system/user'

const userStore = useSystemUserStore()

/** 可配置显隐的列 */
const columnOptions = [
  { key: 'userId', label: '用户编号', width: 'w-[7%]', skeleton: 'w-1/2' },
  { key: 'userName', label: '用户名称', width: 'w-[12%]', skeleton: 'w-3/4' },
  { key: 'nickName', label: '用户昵称', width: 'w-[10%]', skeleton: 'w-2/3' },
  { key: 'deptName', label: '部门', width: 'w-[12%]', skeleton: 'w-2/3' },
  { key: 'phonenumber', label: '手机号码', width: 'w-[12%]', skeleton: 'w-2/3' },
  { key: 'status', label: '状态', width: 'w-[7%]', skeleton: 'w-1/2' },
  { key: 'createTime', label: '创建时间', width: 'w-[16%]', skeleton: 'w-3/4' },
] as const

type ColumnKey = typeof columnOptions[number]['key']

const columnVisible = reactive<Record<ColumnKey, boolean>>({
  userId: true,
  userName: true,
  nickName: true,
  deptName: true,
  phonenumber: true,
  status: true,
  createTime: true,
})

const visibleDataColumns = computed(() => columnOptions.filter(column => columnVisible[column.key]))
/** 勾选列 + 可见数据列 + 操作列 */
const visibleColumnCount = computed(() => 1 + visibleDataColumns.value.length + 1)

/** 表格可视区域，用于按“剩余高度 / 行高”动态计算每页条数 */
const tableAreaRef = ref<HTMLElement>()
const { height: tableAreaHeight } = useElementSize(tableAreaRef)
/** 表头高度与 TableHead 的 h-12 保持一致，骨架行数据此计算 */
const tableHeaderHeight = ref(48)
/** 行高与模板中的 h-14 保持一致，保证骨架行/数据行等高 */
const tableRowHeight = ref(56)
/** 是否已经量到真实数据行的高度（避免用“加载中/暂无数据”占位行计算） */
const hasMeasuredRow = ref(false)

const fittedPageSize = computed(() => {
  const available = tableAreaHeight.value - tableHeaderHeight.value
  // 首帧、未拿到真实数据行时，沿用 store 中的条数
  if (!hasMeasuredRow.value || available <= 0 || !tableRowHeight.value) {
    return userStore.queryParams.pageSize ?? 10
  }
  return Math.max(1, Math.floor(available / tableRowHeight.value))
})

/** 首屏加载时骨架屏的行数（按可视区域大致填充） */
const skeletonRowCount = computed(() => {
  const available = tableAreaHeight.value - tableHeaderHeight.value
  if (available > 0) {
    return Math.max(3, Math.floor(available / (tableRowHeight.value || 40)))
  }
  return 8
})

function measureTableMetrics() {
  const element = tableAreaRef.value
  if (!element) {
    return
  }
  const thead = element.querySelector('thead')
  if (thead) {
    tableHeaderHeight.value = thead.getBoundingClientRect().height
  }
  const firstRow = element.querySelector('tbody tr[data-row]')
  const rowHeight = firstRow?.getBoundingClientRect().height ?? 0
  if (rowHeight > 0) {
    tableRowHeight.value = rowHeight
    hasMeasuredRow.value = true
  }
}

useResizeObserver(tableAreaRef, measureTableMetrics)

/** 数据变化或加载状态切换后，重新测量行高 */
watch([() => userStore.userList, () => userStore.loading], () => nextTick(measureTableMetrics))

/** 测量出的每页条数变化时，防抖后写入 store（由 store 决定是否重新请求） */
let emitSizeTimer: ReturnType<typeof setTimeout> | undefined
watch(fittedPageSize, size => {
  if (userStore.loading || !hasMeasuredRow.value || size === (userStore.queryParams.pageSize ?? 10)) {
    return
  }
  if (emitSizeTimer) {
    clearTimeout(emitSizeTimer)
  }
  emitSizeTimer = setTimeout(() => {
    if (size !== (userStore.queryParams.pageSize ?? 10)) {
      userStore.setPageSize(size)
    }
  }, 250)
})

const currentPage = computed({
  get: () => userStore.queryParams.pageNum ?? 1,
  set: (value: number) => userStore.setPage(value),
})

/** 已选中的行 userId */
const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysUser) => row.userId ?? 0
const currentPageIds = computed(() => userStore.userList.map(row => rowId(row)))
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

/** 状态切换（失败回滚） */
async function handleStatusChange(row: SysUser, value: boolean | 'indeterminate') {
  const next: '0' | '1' = value === true ? '0' : '1'
  const previous = row.status
  row.status = next
  try {
    await userStore.changeStatus(rowId(row), next)
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
    const ok = await userStore.confirmDelete()
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
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <!-- 工具栏 -->
      <Flex direction="column" class="min-h-0 flex-1">
        <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" @click="userStore.openDeleteConfirm(selectedIds)">批量删除</Button>
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
            <Button size="sm" radius="md" :disabled="selectedCount === 0" >
              <Upload />
              导入
            </Button>
            <Button size="sm" radius="md" :disabled="selectedCount === 0" >
              <Download />
              导出
            </Button>
          </Flex>
        </Flex>
        <!-- 表格 -->
        <div ref="tableAreaRef" class="min-h-0 flex-1 overflow-auto">
          <Table class="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead class="w-10">
                <Checkbox
                  :model-value="selectAllState"
                  @update:model-value="toggleAll"
                />
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
            <!-- 加载中：始终用 Skeleton 构建列表骨架（翻页/筛选/查询同样展示） -->
            <template v-if="userStore.loading">
              <TableRow v-for="index in skeletonRowCount" :key="`skeleton-${index}`" class="h-14">
                <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                <TableCell v-for="column in visibleDataColumns" :key="column.key">
                  <Skeleton :class="['h-4', column.skeleton]" />
                </TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="userStore.userList.length === 0" class="h-14">
              <TableCell :colspan="visibleColumnCount" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="row in userStore.userList" :key="rowId(row)" data-row class="h-14">
                <TableCell>
                  <Checkbox
                    :model-value="selectedIds.includes(rowId(row))"
                    @update:model-value="value => toggleRow(rowId(row), value)"
                  />
                </TableCell>
                <TableCell v-if="columnVisible.userId" class="truncate">{{ row.userId }}</TableCell>
                <TableCell v-if="columnVisible.userName" class="truncate">
                  <button
                    type="button"
                    class="cursor-pointer text-primary hover:underline"
                    @click="userStore.openDetail(row)"
                  >
                    {{ row.userName }}
                  </button>
                </TableCell>
                <TableCell v-if="columnVisible.nickName" class="truncate">{{ row.nickName }}</TableCell>
                <TableCell v-if="columnVisible.deptName" class="truncate">{{ row.dept?.deptName }}</TableCell>
                <TableCell v-if="columnVisible.phonenumber" class="truncate">{{ row.phonenumber }}</TableCell>
                <TableCell v-if="columnVisible.status">
                  <Switch
                    size="sm"
                    :model-value="row.status === '0'"
                    :disabled="row.userId === 1"
                    @update:model-value="value => handleStatusChange(row, value)"
                  />
                </TableCell>
                <TableCell v-if="columnVisible.createTime" class="truncate">{{ row.createTime }}</TableCell>
                <TableCell>
                  <Flex v-if="row.userId !== 1" :gap="2">
                    <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="userStore.openEditForm(row)">
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="userStore.openDeleteConfirm([rowId(row)])">
                      <Trash2 />
                    </Button>
                    <Button variant="ghost" size="icon-xs" radius="md" title="重置密码" @click="userStore.openResetPwd(row)">
                      <KeyRound />
                    </Button>
                    <Button variant="ghost" size="icon-xs" radius="md" title="分配角色" @click="userStore.openAuthRole(row)">
                      <ShieldCheck />
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
      <Flex class="shrink-0 border-t-2" align="center" justify="space-between" :gap="8" :padding-x="14" :padding-y="9" >
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ userStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="userStore.queryParams.pageSize ?? 10"
          :total="userStore.total"
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
              <PaginationItem v-else :value="item.value" :is-active="item.value === (userStore.queryParams.pageNum ?? 1)">
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
    <AlertDialog v-model:open="userStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除用户</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除选中的 {{ userStore.deleteIds.length }} 个用户吗？删除后不可恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="userStore.closeDeleteConfirm()">取消</AlertDialogCancel>
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
