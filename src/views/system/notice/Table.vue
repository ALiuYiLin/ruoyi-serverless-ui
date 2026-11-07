<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, Loader2, Pencil, Trash2, Users } from '@lucide/vue'
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
import type { SysNotice } from '@/types'
import useSystemNoticeStore from '@/store/system/notice'
import ReadUsersDialog from './ReadUsersDialog.vue'

const noticeStore = useSystemNoticeStore()

const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysNotice) => row.noticeId ?? 0
const currentPageIds = computed(() => noticeStore.noticeList.map(row => rowId(row)))
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
  get: () => noticeStore.queryParams.pageNum ?? 1,
  set: (value: number) => noticeStore.setPage(value),
})

const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await noticeStore.confirmDelete()
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

const readUsersRef = ref<{ open: (row: SysNotice) => void }>()
function openReadUsers(row: SysNotice) {
  readUsersRef.value?.open(row)
}

const noticeTypeLabel = (type?: string) => (type === '1' ? '通知' : '公告')
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <Flex direction="column" class="min-h-0 flex-1">
        <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" @click="noticeStore.openDeleteConfirm(selectedIds)">
              批量删除
            </Button>
          </Flex>
        </Flex>

        <div class="min-h-0 flex-1 overflow-auto">
          <Table class="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead class="w-10"><Checkbox :model-value="selectAllState" @update:model-value="toggleAll" /></TableHead>
                <TableHead class="w-[8%]">序号</TableHead>
                <TableHead class="w-[26%]">公告标题</TableHead>
                <TableHead class="w-[10%]">公告类型</TableHead>
                <TableHead class="w-[10%]">状态</TableHead>
                <TableHead class="w-[12%]">创建者</TableHead>
                <TableHead class="w-[16%]">创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="noticeStore.loading">
                <TableRow v-for="index in 8" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-3/4" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="noticeStore.noticeList.length === 0" class="h-14">
                <TableCell :colspan="8" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in noticeStore.noticeList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox :model-value="selectedIds.includes(rowId(row))" @update:model-value="value => toggleRow(rowId(row), value)" />
                  </TableCell>
                  <TableCell>{{ row.noticeId }}</TableCell>
                  <TableCell class="truncate">
                    <button type="button" class="cursor-pointer text-primary hover:underline" @click="noticeStore.openViewForm(row)">
                      {{ row.noticeTitle }}
                    </button>
                  </TableCell>
                  <TableCell>{{ noticeTypeLabel(row.noticeType) }}</TableCell>
                  <TableCell>
                    <span :class="row.status === '0' ? 'text-green-600' : 'text-muted-foreground'">
                      {{ row.status === '0' ? '正常' : '停用' }}
                    </span>
                  </TableCell>
                  <TableCell class="truncate">{{ row.createBy }}</TableCell>
                  <TableCell class="truncate">{{ row.createTime }}</TableCell>
                  <TableCell>
                    <Flex :gap="2">
                      <Button variant="ghost" size="icon-xs" radius="md" title="阅读用户" @click="openReadUsers(row)">
                        <Users />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="noticeStore.openEditForm(row)">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="noticeStore.openDeleteConfirm([rowId(row)])">
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
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ noticeStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="noticeStore.queryParams.pageSize ?? 10"
          :total="noticeStore.total"
          :sibling-count="1"
          show-edges
          class="m-0 w-fit"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === (noticeStore.queryParams.pageNum ?? 1)">
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
          </PaginationContent>
        </Pagination>
      </Flex>
    </Flex>

    <ReadUsersDialog ref="readUsersRef" />

    <AlertDialog v-model:open="noticeStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除公告</AlertDialogTitle>
          <AlertDialogDescription>确定要删除选中的 {{ noticeStore.deleteIds.length }} 条公告吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="noticeStore.closeDeleteConfirm()">取消</AlertDialogCancel>
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
