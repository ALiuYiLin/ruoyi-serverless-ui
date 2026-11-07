<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Eraser,
  Eye,
  Loader2,
  Trash2,
} from '@lucide/vue'
import { ElMessage } from 'element-plus'

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
import type { SysOperLog } from '@/types'
import useSystemOperlogStore from '@/store/system/operlog'
import OperlogDetailDialog from './OperlogDetailDialog.vue'

const operlogStore = useSystemOperlogStore()

const businessTypeMap: Record<number, string> = {
  0: '其他',
  1: '新增',
  2: '修改',
  3: '删除',
  4: '授权',
  5: '导出',
  6: '导入',
  7: '强退',
  8: '生成代码',
  9: '清空数据',
}

const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysOperLog) => row.operId ?? 0
const currentPageIds = computed(() => operlogStore.operlogList.map(row => rowId(row)))
const allPageSelected = computed(
  () => currentPageIds.value.length > 0 && currentPageIds.value.every(id => selectedIds.value.includes(id))
)
const somePageSelected = computed(() => currentPageIds.value.some(id => selectedIds.value.includes(id)))
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
  get: () => operlogStore.queryParams.pageNum ?? 1,
  set: (value: number) => operlogStore.setPage(value),
})

const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await operlogStore.confirmDelete()
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

const cleaning = ref(false)
async function handleConfirmClean() {
  cleaning.value = true
  try {
    await operlogStore.confirmClean()
    selectedIds.value = []
    ElMessage.success('清空成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    cleaning.value = false
  }
}

function handleExport() {
  download('monitor/operlog/export', { ...operlogStore.queryParams }, `operlog_${new Date().getTime()}.xlsx`)
}
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <Flex direction="column" class="min-h-0 flex-1">
        <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" @click="operlogStore.openDeleteConfirm(selectedIds)">
              <Trash2 />
              批量删除
            </Button>
            <Button color="warning" variant="ghost" size="sm" radius="md" @click="operlogStore.openCleanConfirm()">
              <Eraser />
              清空
            </Button>
          </Flex>
          <Button size="sm" radius="md" @click="handleExport">
            <Download />
            导出
          </Button>
        </Flex>

        <div class="min-h-0 flex-1 overflow-auto">
          <Table class="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead class="w-10"><Checkbox :model-value="selectAllState" @update:model-value="toggleAll" /></TableHead>
                <TableHead class="w-[8%]">日志编号</TableHead>
                <TableHead class="w-[18%]">系统模块</TableHead>
                <TableHead class="w-[10%]">操作类型</TableHead>
                <TableHead class="w-[12%]">操作人员</TableHead>
                <TableHead class="w-[12%]">操作地址</TableHead>
                <TableHead class="w-[8%]">状态</TableHead>
                <TableHead class="w-[16%]">操作日期</TableHead>
                <TableHead class="w-[9%]">消耗时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="operlogStore.loading">
                <TableRow v-for="index in 8" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell v-for="col in 9" :key="col"><Skeleton class="h-4 w-2/3" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="operlogStore.operlogList.length === 0" class="h-14">
                <TableCell :colspan="10" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in operlogStore.operlogList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox :model-value="selectedIds.includes(rowId(row))" @update:model-value="value => toggleRow(rowId(row), value)" />
                  </TableCell>
                  <TableCell>{{ row.operId }}</TableCell>
                  <TableCell class="truncate">{{ row.title }}</TableCell>
                  <TableCell>{{ businessTypeMap[row.businessType ?? 0] ?? '-' }}</TableCell>
                  <TableCell class="truncate">{{ row.operName }}</TableCell>
                  <TableCell class="truncate">{{ row.operIp }}</TableCell>
                  <TableCell>
                    <span :class="row.status === 0 ? 'text-green-600' : 'text-destructive'">
                      {{ row.status === 0 ? '成功' : '失败' }}
                    </span>
                  </TableCell>
                  <TableCell class="truncate">{{ row.operTime }}</TableCell>
                  <TableCell>{{ row.costTime != null ? `${row.costTime} ms` : '-' }}</TableCell>
                  <TableCell>
                    <Flex :gap="2">
                      <Button variant="ghost" size="icon-xs" radius="md" title="详情" @click="operlogStore.openDetail(row)">
                        <Eye />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="operlogStore.openDeleteConfirm([rowId(row)])">
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

      <Flex class="shrink-0 border-t-2" align="center" justify="space-between" :gap="8" :padding-x="14" :padding-y="9">
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ operlogStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="operlogStore.queryParams.pageSize ?? 10"
          :total="operlogStore.total"
          :sibling-count="1"
          show-edges
          class="m-0 w-fit"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === (operlogStore.queryParams.pageNum ?? 1)">
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
          </PaginationContent>
        </Pagination>
      </Flex>
    </Flex>

    <OperlogDetailDialog />

    <AlertDialog v-model:open="operlogStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除日志</AlertDialogTitle>
          <AlertDialogDescription>确定要删除选中的 {{ operlogStore.deleteIds.length }} 条操作日志吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="operlogStore.closeDeleteConfirm()">取消</AlertDialogCancel>
          <Button color="danger" radius="md" :disabled="deleting" @click="handleConfirmDelete">
            <Loader2 v-if="deleting" class="animate-spin" />
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog v-model:open="operlogStore.cleanVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>清空日志</AlertDialogTitle>
          <AlertDialogDescription>确定要清空全部操作日志吗？清空后不可恢复。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="operlogStore.closeCleanConfirm()">取消</AlertDialogCancel>
          <Button color="danger" radius="md" :disabled="cleaning" @click="handleConfirmClean">
            <Loader2 v-if="cleaning" class="animate-spin" />
            清空
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
