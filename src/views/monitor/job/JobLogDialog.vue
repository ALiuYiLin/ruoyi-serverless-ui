<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, Download, Eraser, Loader2, Trash2 } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { cleanJobLog, delJobLog, listJobLog } from '@/api/monitor/jobLog'
import type { JobLogQueryParams, SysJob, SysJobLog } from '@/types'
import JobLogDetailDialog from './JobLogDetailDialog.vue'

const visible = ref(false)
const loading = ref(false)
const logList = ref<SysJobLog[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const MIN_LOADING_MS = 300

const queryParams = reactive<JobLogQueryParams>({
  pageNum: 1,
  pageSize: 10,
})

const detailVisible = ref(false)
const detailLog = ref<SysJobLog>()

async function getList() {
  const startedAt = Date.now()
  loading.value = true
  try {
    const res = await listJobLog(queryParams)
    logList.value = res.rows
    total.value = res.total
  } finally {
    const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining))
    }
    loading.value = false
  }
}

function open(row?: SysJob) {
  visible.value = true
  queryParams.pageNum = 1
  queryParams.jobName = row?.jobName
  queryParams.jobGroup = row?.jobGroup
  queryParams.status = undefined
  queryParams.params = undefined
  selectedIds.value = []
  getList()
}

function handleSearch() {
  queryParams.pageNum = 1
  getList()
}

const currentPage = computed({
  get: () => queryParams.pageNum ?? 1,
  set: (value: number) => {
    queryParams.pageNum = value
    getList()
  },
})

const rowId = (row: SysJobLog) => row.jobLogId ?? 0
const currentPageIds = computed(() => logList.value.map(row => rowId(row)))
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

const deleteVisible = ref(false)
const deleting = ref(false)
function openDeleteConfirm(ids: number[]) {
  if (!ids.length) {
    return
  }
  selectedIds.value = ids
  deleteVisible.value = true
}

async function confirmDelete() {
  deleting.value = true
  try {
    const ids = selectedIds.value.length === 1 ? selectedIds.value[0] : [...selectedIds.value]
    await delJobLog(ids)
    deleteVisible.value = false
    selectedIds.value = []
    ElMessage.success('删除成功')
    await getList()
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    deleting.value = false
  }
}

const cleanVisible = ref(false)
const cleaning = ref(false)
async function confirmClean() {
  cleaning.value = true
  try {
    await cleanJobLog()
    cleanVisible.value = false
    selectedIds.value = []
    ElMessage.success('清空成功')
    await getList()
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    cleaning.value = false
  }
}

function handleExport() {
  download('monitor/jobLog/export', { ...queryParams }, `job_log_${new Date().getTime()}.xlsx`)
}

function openDetail(row: SysJobLog) {
  detailLog.value = row
  detailVisible.value = true
}

defineExpose({ open })
</script>

<template>
  <Dialog v-model:open="visible">
    <DialogContent class="max-h-[88vh] overflow-y-auto sm:max-w-[1000px]">
      <DialogHeader>
        <DialogTitle>调度日志</DialogTitle>
        <DialogDescription>查看定时任务执行记录</DialogDescription>
      </DialogHeader>

      <Flex align="center" :gap="8" class="flex-wrap">
        <Input v-model="queryParams.jobName" placeholder="任务名称" class="w-40" radius="md" />
        <Select
          :model-value="queryParams.jobGroup"
          @update:model-value="value => (queryParams.jobGroup = value as string | undefined)"
        >
          <SelectTrigger class="w-32">
            <SelectValue placeholder="任务组" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DEFAULT">默认</SelectItem>
            <SelectItem value="SYSTEM">系统</SelectItem>
          </SelectContent>
        </Select>
        <Select
          :model-value="queryParams.status"
          @update:model-value="value => (queryParams.status = value as '0' | '1' | undefined)"
        >
          <SelectTrigger class="w-32">
            <SelectValue placeholder="执行状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">正常</SelectItem>
            <SelectItem value="1">失败</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" radius="md" :disabled="loading" @click="handleSearch">
          <Loader2 v-if="loading" class="animate-spin" />
          查询
        </Button>
      </Flex>

      <Flex align="center" justify="space-between">
        <Flex :gap="5">
          <span class="text-sm text-muted-foreground">已选 {{ selectedIds.length }} 项</span>
          <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="!selectedIds.length" @click="openDeleteConfirm(selectedIds)">
            <Trash2 />
            批量删除
          </Button>
          <Button color="warning" variant="ghost" size="sm" radius="md" @click="cleanVisible = true">
            <Eraser />
            清空
          </Button>
        </Flex>
        <Button size="sm" radius="md" @click="handleExport">
          <Download />
          导出
        </Button>
      </Flex>

      <div class="max-h-[50vh] overflow-auto rounded-md border border-border">
        <Table class="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead class="w-10"><Checkbox :model-value="selectAllState" @update:model-value="toggleAll" /></TableHead>
              <TableHead class="w-[8%]">日志编号</TableHead>
              <TableHead class="w-[16%]">任务名称</TableHead>
              <TableHead class="w-[9%]">任务组名</TableHead>
              <TableHead class="w-[20%]">调用目标</TableHead>
              <TableHead class="w-[16%]">日志信息</TableHead>
              <TableHead class="w-[8%]">状态</TableHead>
              <TableHead class="w-[16%]">执行时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow v-for="index in 6" :key="`skeleton-${index}`" class="h-12">
                <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                <TableCell v-for="col in 8" :key="col"><Skeleton class="h-4 w-2/3" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="logList.length === 0" class="h-12">
              <TableCell :colspan="9" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="row in logList" :key="rowId(row)" class="h-12">
                <TableCell>
                  <Checkbox :model-value="selectedIds.includes(rowId(row))" @update:model-value="value => toggleRow(rowId(row), value)" />
                </TableCell>
                <TableCell>{{ row.jobLogId }}</TableCell>
                <TableCell class="truncate">{{ row.jobName }}</TableCell>
                <TableCell class="truncate">{{ row.jobGroup }}</TableCell>
                <TableCell class="truncate">{{ row.invokeTarget }}</TableCell>
                <TableCell class="truncate">{{ row.jobMessage }}</TableCell>
                <TableCell>
                  <span :class="row.status === '0' ? 'text-green-600' : 'text-destructive'">
                    {{ row.status === '0' ? '正常' : '失败' }}
                  </span>
                </TableCell>
                <TableCell class="truncate">{{ row.createTime }}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-xs" radius="md" title="详情" @click="openDetail(row)">
                    详情
                  </Button>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <Pagination
        v-model:page="currentPage"
        :items-per-page="queryParams.pageSize ?? 10"
        :total="total"
        :sibling-count="1"
        show-edges
        class="m-0 w-fit self-end"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
          <template v-for="(item, index) in items" :key="index">
            <PaginationEllipsis v-if="item.type === 'ellipsis'" />
            <PaginationItem v-else :value="item.value" :is-active="item.value === (queryParams.pageNum ?? 1)">
              {{ item.value }}
            </PaginationItem>
          </template>
          <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
        </PaginationContent>
      </Pagination>

      <JobLogDetailDialog v-model:open="detailVisible" :log="detailLog" />

      <AlertDialog v-model:open="deleteVisible">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除调度日志</AlertDialogTitle>
            <AlertDialogDescription>确定要删除选中的 {{ selectedIds.length }} 条日志吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel radius="md" @click="deleteVisible = false">取消</AlertDialogCancel>
            <Button color="danger" radius="md" :disabled="deleting" @click="confirmDelete">
              <Loader2 v-if="deleting" class="animate-spin" />
              删除
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog v-model:open="cleanVisible">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>清空调度日志</AlertDialogTitle>
            <AlertDialogDescription>确定要清空全部调度日志吗？清空后不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel radius="md" @click="cleanVisible = false">取消</AlertDialogCancel>
            <Button color="danger" radius="md" :disabled="cleaning" @click="confirmClean">
              <Loader2 v-if="cleaning" class="animate-spin" />
              清空
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  </Dialog>
</template>
