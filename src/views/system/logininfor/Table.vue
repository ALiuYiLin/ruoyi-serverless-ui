<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Eraser,
  Loader2,
  LockOpen,
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
import type { SysLogininfor } from '@/types'
import useSystemLogininforStore from '@/store/system/logininfor'

const logininforStore = useSystemLogininforStore()

const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysLogininfor) => row.infoId ?? 0
const currentPageIds = computed(() => logininforStore.logininforList.map(row => rowId(row)))
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

const selectedUser = computed(() => {
  if (selectedIds.value.length !== 1) {
    return undefined
  }
  return logininforStore.logininforList.find(row => rowId(row) === selectedIds.value[0])
})

const currentPage = computed({
  get: () => logininforStore.queryParams.pageNum ?? 1,
  set: (value: number) => logininforStore.setPage(value),
})

/** 解锁 */
const unlockVisible = ref(false)
const unlocking = ref(false)

function openUnlockConfirm() {
  if (!selectedUser.value?.userName) {
    return
  }
  unlockVisible.value = true
}

async function confirmUnlock() {
  const userName = selectedUser.value?.userName
  if (!userName) {
    return
  }
  unlocking.value = true
  try {
    await logininforStore.unlock(userName)
    unlockVisible.value = false
    selectedIds.value = []
    ElMessage.success(`用户 ${userName} 解锁成功`)
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    unlocking.value = false
  }
}

/** 删除 */
const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await logininforStore.confirmDelete()
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

/** 清空 */
const cleaning = ref(false)
async function handleConfirmClean() {
  cleaning.value = true
  try {
    await logininforStore.confirmClean()
    selectedIds.value = []
    ElMessage.success('清空成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    cleaning.value = false
  }
}

function handleExport() {
  download('monitor/logininfor/export', { ...logininforStore.queryParams }, `logininfor_${new Date().getTime()}.xlsx`)
}
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <Flex direction="column" class="min-h-0 flex-1">
        <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button
              variant="ghost"
              size="sm"
              radius="md"
              :disabled="selectedCount !== 1"
              @click="openUnlockConfirm"
            >
              <LockOpen />
              解锁
            </Button>
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" @click="logininforStore.openDeleteConfirm(selectedIds)">
              <Trash2 />
              批量删除
            </Button>
            <Button color="warning" variant="ghost" size="sm" radius="md" @click="logininforStore.openCleanConfirm()">
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
                <TableHead class="w-[8%]">访问编号</TableHead>
                <TableHead class="w-[12%]">用户名称</TableHead>
                <TableHead class="w-[12%]">地址</TableHead>
                <TableHead class="w-[12%]">登录地点</TableHead>
                <TableHead class="w-[10%]">操作系统</TableHead>
                <TableHead class="w-[10%]">浏览器</TableHead>
                <TableHead class="w-[8%]">状态</TableHead>
                <TableHead class="w-[12%]">描述</TableHead>
                <TableHead class="w-[16%]">访问时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="logininforStore.loading">
                <TableRow v-for="index in 8" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell v-for="col in 10" :key="col"><Skeleton class="h-4 w-2/3" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="logininforStore.logininforList.length === 0" class="h-14">
                <TableCell :colspan="11" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in logininforStore.logininforList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox :model-value="selectedIds.includes(rowId(row))" @update:model-value="value => toggleRow(rowId(row), value)" />
                  </TableCell>
                  <TableCell>{{ row.infoId }}</TableCell>
                  <TableCell class="truncate">{{ row.userName }}</TableCell>
                  <TableCell class="truncate">{{ row.ipaddr }}</TableCell>
                  <TableCell class="truncate">{{ row.loginLocation }}</TableCell>
                  <TableCell class="truncate">{{ row.os }}</TableCell>
                  <TableCell class="truncate">{{ row.browser }}</TableCell>
                  <TableCell>
                    <span :class="row.status === '0' ? 'text-green-600' : 'text-destructive'">
                      {{ row.status === '0' ? '成功' : '失败' }}
                    </span>
                  </TableCell>
                  <TableCell class="truncate">{{ row.msg }}</TableCell>
                  <TableCell class="truncate">{{ row.loginTime }}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="logininforStore.openDeleteConfirm([rowId(row)])">
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </Flex>

      <Flex class="shrink-0 border-t-2" align="center" justify="space-between" :gap="8" :padding-x="14" :padding-y="9">
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ logininforStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="logininforStore.queryParams.pageSize ?? 10"
          :total="logininforStore.total"
          :sibling-count="1"
          show-edges
          class="m-0 w-fit"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === (logininforStore.queryParams.pageNum ?? 1)">
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
          </PaginationContent>
        </Pagination>
      </Flex>
    </Flex>

    <AlertDialog v-model:open="unlockVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>解锁用户</AlertDialogTitle>
          <AlertDialogDescription>确定要解锁用户「{{ selectedUser?.userName }}」吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="unlockVisible = false">取消</AlertDialogCancel>
          <Button color="primary" radius="md" :disabled="unlocking" @click="confirmUnlock">
            <Loader2 v-if="unlocking" class="animate-spin" />
            解锁
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog v-model:open="logininforStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除登录日志</AlertDialogTitle>
          <AlertDialogDescription>确定要删除选中的 {{ logininforStore.deleteIds.length }} 条登录日志吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="logininforStore.closeDeleteConfirm()">取消</AlertDialogCancel>
          <Button color="danger" radius="md" :disabled="deleting" @click="handleConfirmDelete">
            <Loader2 v-if="deleting" class="animate-spin" />
            删除
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog v-model:open="logininforStore.cleanVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>清空登录日志</AlertDialogTitle>
          <AlertDialogDescription>确定要清空全部登录日志吗？清空后不可恢复。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="logininforStore.closeCleanConfirm()">取消</AlertDialogCancel>
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
