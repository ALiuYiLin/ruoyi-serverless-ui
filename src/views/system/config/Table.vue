<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Loader2,
  Pencil,
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
import type { SysConfig } from '@/types'
import useSystemConfigStore from '@/store/system/config'

const configStore = useSystemConfigStore()

const columnOptions = [
  { key: 'configId', label: '参数主键', width: 'w-[8%]', skeleton: 'w-1/2' },
  { key: 'configName', label: '参数名称', width: 'w-[18%]', skeleton: 'w-3/4' },
  { key: 'configKey', label: '参数键名', width: 'w-[18%]', skeleton: 'w-3/4' },
  { key: 'configValue', label: '参数键值', width: 'w-[18%]', skeleton: 'w-3/4' },
  { key: 'configType', label: '系统内置', width: 'w-[8%]', skeleton: 'w-1/2' },
  { key: 'remark', label: '备注', width: 'w-[12%]', skeleton: 'w-2/3' },
  { key: 'createTime', label: '创建时间', width: 'w-[18%]', skeleton: 'w-3/4' },
] as const

type ColumnKey = typeof columnOptions[number]['key']
const columnVisible = reactive<Record<ColumnKey, boolean>>({
  configId: true,
  configName: true,
  configKey: true,
  configValue: true,
  configType: true,
  remark: true,
  createTime: true,
})
const visibleDataColumns = computed(() => columnOptions.filter(item => columnVisible[item.key]))
const visibleColumnCount = computed(() => 1 + visibleDataColumns.value.length + 1)

const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysConfig) => row.configId ?? 0
const currentPageIds = computed(() => configStore.configList.map(row => rowId(row)))
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
  get: () => configStore.queryParams.pageNum ?? 1,
  set: (value: number) => configStore.setPage(value),
})

const deleting = ref(false)
async function handleConfirmDelete() {
  deleting.value = true
  try {
    const ok = await configStore.confirmDelete()
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
  download('system/config/export', { ...configStore.queryParams }, `config_${new Date().getTime()}.xlsx`)
}
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <Flex direction="column" class="min-h-0 flex-1">
        <Flex class="table-toolbar shrink-0" :padding="14" align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" @click="configStore.openDeleteConfirm(selectedIds)">
              批量删除
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
                <TableHead v-for="column in visibleDataColumns" :key="column.key" :class="column.width">{{ column.label }}</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="configStore.loading">
                <TableRow v-for="index in 8" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell v-for="column in visibleDataColumns" :key="column.key">
                    <Skeleton :class="['h-4', column.skeleton]" />
                  </TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="configStore.configList.length === 0" class="h-14">
                <TableCell :colspan="visibleColumnCount" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in configStore.configList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox :model-value="selectedIds.includes(rowId(row))" @update:model-value="value => toggleRow(rowId(row), value)" />
                  </TableCell>
                  <TableCell v-if="columnVisible.configId" class="truncate">{{ row.configId }}</TableCell>
                  <TableCell v-if="columnVisible.configName" class="truncate">
                    <button type="button" class="cursor-pointer text-primary hover:underline" @click="configStore.openViewForm(row)">
                      {{ row.configName }}
                    </button>
                  </TableCell>
                  <TableCell v-if="columnVisible.configKey" class="truncate">{{ row.configKey }}</TableCell>
                  <TableCell v-if="columnVisible.configValue" class="truncate">{{ row.configValue }}</TableCell>
                  <TableCell v-if="columnVisible.configType">{{ row.configType === 'Y' ? '是' : '否' }}</TableCell>
                  <TableCell v-if="columnVisible.remark" class="truncate">{{ row.remark }}</TableCell>
                  <TableCell v-if="columnVisible.createTime" class="truncate">{{ row.createTime }}</TableCell>
                  <TableCell>
                    <Flex :gap="2">
                      <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="configStore.openEditForm(row)">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="configStore.openDeleteConfirm([rowId(row)])">
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
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ configStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="configStore.queryParams.pageSize ?? 10"
          :total="configStore.total"
          :sibling-count="1"
          show-edges
          class="m-0 w-fit"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === (configStore.queryParams.pageNum ?? 1)">
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
          </PaginationContent>
        </Pagination>
      </Flex>
    </Flex>

    <AlertDialog v-model:open="configStore.deleteVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除参数</AlertDialogTitle>
          <AlertDialogDescription>确定要删除选中的 {{ configStore.deleteIds.length }} 个参数吗？</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="configStore.closeDeleteConfirm()">取消</AlertDialogCancel>
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
