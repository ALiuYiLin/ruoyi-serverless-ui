<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, Loader2, Search } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import { listNoticeReadUsers } from '@/api/system/notice'
import type { NoticeReadUser, NoticeReadUserQueryParams, SysNotice } from '@/types'

const visible = ref(false)
const loading = ref(false)
const users = ref<NoticeReadUser[]>([])
const total = ref(0)
const queryParams = reactive<NoticeReadUserQueryParams>({
  pageNum: 1,
  pageSize: 10,
  noticeId: undefined,
  searchValue: undefined,
})

const MIN_LOADING_MS = 300

async function getList() {
  const startedAt = Date.now()
  loading.value = true
  try {
    const res = await listNoticeReadUsers(queryParams)
    users.value = res.rows
    total.value = res.total
  } finally {
    const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining))
    }
    loading.value = false
  }
}

function open(row: SysNotice) {
  visible.value = true
  queryParams.noticeId = row.noticeId
  queryParams.pageNum = 1
  queryParams.searchValue = undefined
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

defineExpose({ open })
</script>

<template>
  <Dialog v-model:open="visible">
    <DialogContent class="sm:max-w-[760px]">
      <DialogHeader>
        <DialogTitle>阅读用户</DialogTitle>
        <DialogDescription>查看公告已读用户列表</DialogDescription>
      </DialogHeader>

      <Flex align="center" :gap="8">
        <Input v-model="queryParams.searchValue" placeholder="请输入登录名/用户名" class="w-56" radius="md" @keyup.enter="handleSearch" />
        <Button variant="outline" radius="md" :disabled="loading" @click="handleSearch">
          <Loader2 v-if="loading" class="animate-spin" />
          <Search v-else />
          查询
        </Button>
      </Flex>

      <div class="max-h-[420px] overflow-auto rounded-md border border-border">
        <Table class="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead class="w-[18%]">用户名称</TableHead>
              <TableHead class="w-[18%]">用户昵称</TableHead>
              <TableHead class="w-[18%]">部门</TableHead>
              <TableHead class="w-[18%]">手机号码</TableHead>
              <TableHead>阅读时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow v-for="index in 5" :key="`skeleton-${index}`" class="h-12">
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="users.length === 0" class="h-12">
              <TableCell :colspan="5" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="user in users" :key="user.userId" class="h-12">
                <TableCell class="truncate">{{ user.userName }}</TableCell>
                <TableCell class="truncate">{{ user.nickName }}</TableCell>
                <TableCell class="truncate">{{ user.deptName }}</TableCell>
                <TableCell class="truncate">{{ user.phonenumber }}</TableCell>
                <TableCell class="truncate">{{ user.readTime }}</TableCell>
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
    </DialogContent>
  </Dialog>
</template>
