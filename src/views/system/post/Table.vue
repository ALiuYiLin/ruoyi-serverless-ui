<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Loader2,
  Pencil,
  Settings2,
  Trash2,
} from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { SysPost } from '@/types'
import useSystemPostStore from '@/store/system/post'

const postStore = useSystemPostStore()

const columnOptions = [
  { key: 'postId', label: '岗位编号', width: 'w-[8%]', skeleton: 'w-1/2' },
  { key: 'postCode', label: '岗位编码', width: 'w-[18%]', skeleton: 'w-2/3' },
  { key: 'postName', label: '岗位名称', width: 'w-[18%]', skeleton: 'w-3/4' },
  { key: 'postSort', label: '岗位排序', width: 'w-[10%]', skeleton: 'w-1/2' },
  { key: 'status', label: '状态', width: 'w-[8%]', skeleton: 'w-1/2' },
  { key: 'createTime', label: '创建时间', width: 'w-[18%]', skeleton: 'w-3/4' },
] as const

type ColumnKey = typeof columnOptions[number]['key']

const columnVisible = reactive<Record<ColumnKey, boolean>>({
  postId: true,
  postCode: true,
  postName: true,
  postSort: true,
  status: true,
  createTime: true,
})

const visibleDataColumns = computed(() => columnOptions.filter(column => columnVisible[column.key]))
const visibleColumnCount = computed(() => 1 + visibleDataColumns.value.length + 1)

const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysPost) => row.postId ?? 0
const currentPageIds = computed(() => postStore.postList.map(row => rowId(row)))
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
  get: () => postStore.queryParams.pageNum ?? 1,
  set: (value: number) => postStore.setPage(value),
})

/** 删除确认提交 */
const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await postStore.confirmDelete()
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
  download('system/post/export', { ...postStore.queryParams }, `post_${new Date().getTime()}.xlsx`)
}

const skeletonRowCount = 8
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
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
              @click="postStore.openDeleteConfirm(selectedIds)"
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

        <div class="min-h-0 flex-1 overflow-auto">
          <Table class="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead class="w-10">
                  <Checkbox :model-value="selectAllState" @update:model-value="toggleAll" />
                </TableHead>
                <TableHead v-for="column in visibleDataColumns" :key="column.key" :class="column.width">
                  {{ column.label }}
                </TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="postStore.loading">
                <TableRow v-for="index in skeletonRowCount" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell v-for="column in visibleDataColumns" :key="column.key">
                    <Skeleton :class="['h-4', column.skeleton]" />
                  </TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="postStore.postList.length === 0" class="h-14">
                <TableCell :colspan="visibleColumnCount" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in postStore.postList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox
                      :model-value="selectedIds.includes(rowId(row))"
                      @update:model-value="value => toggleRow(rowId(row), value)"
                    />
                  </TableCell>
                  <TableCell v-if="columnVisible.postId" class="truncate">{{ row.postId }}</TableCell>
                  <TableCell v-if="columnVisible.postCode" class="truncate">{{ row.postCode }}</TableCell>
                  <TableCell v-if="columnVisible.postName" class="truncate">
                    <button
                      type="button"
                      class="cursor-pointer text-primary hover:underline"
                      @click="postStore.openViewForm(row)"
                    >
                      {{ row.postName }}
                    </button>
                  </TableCell>
                  <TableCell v-if="columnVisible.postSort" class="truncate">{{ row.postSort }}</TableCell>
                  <TableCell v-if="columnVisible.status">
                    <span :class="row.status === '0' ? 'text-green-600' : 'text-muted-foreground'">
                      {{ row.status === '0' ? '正常' : '停用' }}
                    </span>
                  </TableCell>
                  <TableCell v-if="columnVisible.createTime" class="truncate">{{ row.createTime }}</TableCell>
                  <TableCell>
                    <Flex :gap="2">
                      <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="postStore.openEditForm(row)">
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        radius="md"
                        title="删除"
                        @click="postStore.openDeleteConfirm([rowId(row)])"
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

      <Flex class="shrink-0 border-t-2" align="center" justify="space-between" :gap="8" :padding-x="14" :padding-y="9">
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ postStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="postStore.queryParams.pageSize ?? 10"
          :total="postStore.total"
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
              <PaginationItem v-else :value="item.value" :is-active="item.value === (postStore.queryParams.pageNum ?? 1)">
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

    <AlertDialog v-model:open="postStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除岗位</AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除选中的 {{ postStore.deleteIds.length }} 个岗位吗？删除后不可恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="postStore.closeDeleteConfirm()">取消</AlertDialogCancel>
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
