<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  FileText,
  Loader2,
  Pencil,
  Play,
  Trash2,
} from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
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
import type { SysJob } from '@/types'
import useSystemJobStore from '@/store/system/job'
import JobLogDialog from './JobLogDialog.vue'

const jobStore = useSystemJobStore()
const jobLogRef = ref<{ open: (row?: SysJob) => void }>()

const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysJob) => row.jobId ?? 0
const currentPageIds = computed(() => jobStore.jobList.map(row => rowId(row)))
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
  get: () => jobStore.queryParams.pageNum ?? 1,
  set: (value: number) => jobStore.setPage(value),
})

/** 状态切换 */
async function handleStatusChange(row: SysJob, value: boolean | 'indeterminate') {
  const next: '0' | '1' = value === true ? '0' : '1'
  const previous = row.status
  row.status = next
  try {
    await jobStore.changeStatus(rowId(row), next)
    ElMessage.success('状态修改成功')
  } catch {
    row.status = previous
  }
}

/** 执行一次 */
const runRow = ref<SysJob>()
const runVisible = ref(false)
const running = ref(false)
function openRunConfirm(row: SysJob) {
  runRow.value = row
  runVisible.value = true
}
async function confirmRun() {
  if (!runRow.value) {
    return
  }
  running.value = true
  try {
    await jobStore.runOnce(runRow.value)
    runVisible.value = false
    ElMessage.success('执行成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    running.value = false
  }
}

/** 删除 */
const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await jobStore.confirmDelete()
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

function handleExport() {
  download('monitor/job/export', { ...jobStore.queryParams }, `job_${new Date().getTime()}.xlsx`)
}

const jobGroupLabel = (group?: string) => (group === 'SYSTEM' ? '系统' : '默认')
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <Flex direction="column" class="min-h-0 flex-1">
        <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" @click="jobStore.openDeleteConfirm(selectedIds)">
              <Trash2 />
              批量删除
            </Button>
          </Flex>
          <Flex align="center" :gap="5">
            <Button variant="ghost" size="sm" radius="md" @click="jobLogRef?.open()">
              <FileText />
              日志
            </Button>
            <Button size="sm" radius="md" @click="handleExport">
              <Download />
              导出
            </Button>
          </Flex>
        </Flex>

        <div class="min-h-0 flex-1 overflow-auto">
          <Table class="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead class="w-10"><Checkbox :model-value="selectAllState" @update:model-value="toggleAll" /></TableHead>
                <TableHead class="w-[8%]">任务编号</TableHead>
                <TableHead class="w-[16%]">任务名称</TableHead>
                <TableHead class="w-[9%]">任务组名</TableHead>
                <TableHead class="w-[20%]">调用目标字符串</TableHead>
                <TableHead class="w-[16%]">cron 执行表达式</TableHead>
                <TableHead class="w-[8%]">状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="jobStore.loading">
                <TableRow v-for="index in 8" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell v-for="col in 7" :key="col"><Skeleton class="h-4 w-2/3" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="jobStore.jobList.length === 0" class="h-14">
                <TableCell :colspan="8" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in jobStore.jobList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox :model-value="selectedIds.includes(rowId(row))" @update:model-value="value => toggleRow(rowId(row), value)" />
                  </TableCell>
                  <TableCell>{{ row.jobId }}</TableCell>
                  <TableCell class="truncate">
                    <button type="button" class="cursor-pointer text-primary hover:underline" @click="jobStore.openViewForm(row)">
                      {{ row.jobName }}
                    </button>
                  </TableCell>
                  <TableCell>{{ jobGroupLabel(row.jobGroup) }}</TableCell>
                  <TableCell class="truncate">{{ row.invokeTarget }}</TableCell>
                  <TableCell class="truncate">{{ row.cronExpression }}</TableCell>
                  <TableCell>
                    <Switch
                      size="sm"
                      :model-value="row.status === '0'"
                      @update:model-value="value => handleStatusChange(row, value)"
                    />
                  </TableCell>
                  <TableCell>
                    <Flex :gap="2">
                      <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="jobStore.openEditForm(row)">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="jobStore.openDeleteConfirm([rowId(row)])">
                        <Trash2 />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="执行一次" @click="openRunConfirm(row)">
                        <Play />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="日志" @click="jobLogRef?.open(row)">
                        <FileText />
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
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ jobStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="jobStore.queryParams.pageSize ?? 10"
          :total="jobStore.total"
          :sibling-count="1"
          show-edges
          class="m-0 w-fit"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === (jobStore.queryParams.pageNum ?? 1)">
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
          </PaginationContent>
        </Pagination>
      </Flex>
    </Flex>

    <JobLogDialog ref="jobLogRef" />

    <AlertDialog v-model:open="jobStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除任务</AlertDialogTitle>
          <AlertDialogDescription>确定要删除选中的 {{ jobStore.deleteIds.length }} 个任务吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="jobStore.closeDeleteConfirm()">取消</AlertDialogCancel>
          <Button color="danger" radius="md" :disabled="deleting" @click="handleConfirmDelete">
            <Loader2 v-if="deleting" class="animate-spin" />
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog v-model:open="runVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>执行任务</AlertDialogTitle>
          <AlertDialogDescription>确定要立即执行任务「{{ runRow?.jobName }}」一次吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="runVisible = false">取消</AlertDialogCancel>
          <Button color="primary" radius="md" :disabled="running" @click="confirmRun">
            <Loader2 v-if="running" class="animate-spin" />
            执行
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
