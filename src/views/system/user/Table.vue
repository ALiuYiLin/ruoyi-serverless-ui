<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useElementSize, useResizeObserver } from '@vueuse/core'
import { ChevronLeftIcon, ChevronRightIcon, Download, Upload } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { SysUser } from '@/types'
import useSystemUserStore from '@/store/system/user'

const userStore = useSystemUserStore()

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

function userLabel(row: SysUser): string {
  return row.nickName || row.userName || ''
}

function statusLabel(status?: '0' | '1'): string {
  if (status === '0') {
    return '正常'
  }
  if (status === '1') {
    return '停用'
  }
  return ''
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
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" >批量删除</Button>
            <Button variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" >修改</Button>
          </Flex>
          <Flex align="center" :gap="5">
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
              <TableHead class="w-[18%]">用户名称</TableHead>
              <TableHead class="w-[16%]">手机号码</TableHead>
              <TableHead class="w-[10%]">状态</TableHead>
              <TableHead class="w-[22%]">创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <!-- 加载中：始终用 Skeleton 构建列表骨架（翻页/筛选/查询同样展示） -->
            <template v-if="userStore.loading">
              <TableRow v-for="index in skeletonRowCount" :key="`skeleton-${index}`" class="h-14">
                <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                <TableCell><Skeleton class="h-4 w-3/4" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                <TableCell><Skeleton class="h-4 w-3/4" /></TableCell>
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="userStore.userList.length === 0" class="h-14">
              <TableCell colspan="6" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="row in userStore.userList" :key="rowId(row)" data-row class="h-14">
                <TableCell>
                  <Checkbox
                    :model-value="selectedIds.includes(rowId(row))"
                    @update:model-value="value => toggleRow(rowId(row), value)"
                  />
                </TableCell>
                <TableCell class="truncate">{{ userLabel(row) }}</TableCell>
                <TableCell class="truncate">{{ row.phonenumber }}</TableCell>
                <TableCell>{{ statusLabel(row.status) }}</TableCell>
                <TableCell class="truncate">{{ row.createTime }}</TableCell>
                <TableCell>
                  <Flex :gap="4">
                    <Button variant="ghost" size="sm" radius="md" @click="userStore.openEditForm(row)">修改</Button>
                    <Button color="danger" variant="ghost" size="sm" radius="md">删除</Button>
                  </Flex>
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
  </Card>
</template>


<style scoped>
.table-toolbar{
  border-bottom: 2px solid #f0f0f0ff;
}
</style>
