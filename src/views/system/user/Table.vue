<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'

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
import Card from '@/components/ui/card/Card.vue'

interface UserRow {
  id: number
  userName: string
  phonenumber: string
  status: '0' | '1'
  createTime: string
}

/** 本地演示数据，后续替换为接口数据 */
const rows = ref<UserRow[]>(
  Array.from({ length: 23 }, (_, index): UserRow => ({
    id: index + 1,
    userName: `用户${index + 1}`,
    phonenumber: `1380000${String(index + 1).padStart(4, '0')}`,
    status: index % 4 === 0 ? '1' : '0',
    createTime: `2026-11-${String((index % 28) + 1).padStart(2, '0')}`,
  }))
)

const page = ref(1)
const pageSize = 10
const total = computed(() => rows.value.length)
const currentRows = computed(() =>
  rows.value.slice((page.value - 1) * pageSize, page.value * pageSize)
)

/** 已选中的行 id */
const selectedIds = ref<number[]>([])
const selectedCount = computed(() => selectedIds.value.length)
const currentPageIds = computed(() => currentRows.value.map(row => row.id))
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

function statusLabel(status: UserRow['status']): string {
  return status === '0' ? '正常' : '停用'
}
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column">
      <!-- 工具栏 -->
      <Flex class="table-toolbar" align="center" :padding="14" :gap="5">
        <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
        <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" >批量删除</Button>
        <Button variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" >修改</Button>
      </Flex>
  
      <!-- 表格 -->
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              <Checkbox
                :model-value="selectAllState"
                @update:model-value="toggleAll"
              />
            </TableHead>
            <TableHead>用户名称</TableHead>
            <TableHead>手机号码</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in currentRows" :key="row.id">
            <TableCell>
              <Checkbox
                :model-value="selectedIds.includes(row.id)"
                @update:model-value="value => toggleRow(row.id, value)"
              />
            </TableCell>
            <TableCell>{{ row.userName }}</TableCell>
            <TableCell>{{ row.phonenumber }}</TableCell>
            <TableCell>{{ statusLabel(row.status) }}</TableCell>
            <TableCell>{{ row.createTime }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
  
      <!-- 分页 -->
      <Flex align="center" justify="space-between" :gap="8">
        <span class="text-sm text-muted-foreground">共 {{ total }} 条</span>
        <Pagination
          v-model:page="page"
          :items-per-page="pageSize"
          :total="total"
          :sibling-count="1"
          show-edges
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious>
              <ChevronLeftIcon class="size-4" />
              <span>上一页</span>
            </PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === page">
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
  border-bottom: 1px solid #f0f0f0ff;
}
</style>