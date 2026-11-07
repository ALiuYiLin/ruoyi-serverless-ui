<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, Loader2, LogOut } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
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
import { parseTime } from '@/utils/ruoyi'
import type { SysUserOnline } from '@/types'
import useSystemOnlineStore from '@/store/system/online'

const onlineStore = useSystemOnlineStore()

const currentPage = computed({
  get: () => onlineStore.queryParams.pageNum ?? 1,
  set: (value: number) => onlineStore.setPage(value),
})

const forceRow = ref<SysUserOnline>()
const forceVisible = ref(false)
const forcing = ref(false)

function openForceLogout(row: SysUserOnline) {
  forceRow.value = row
  forceVisible.value = true
}

async function confirmForceLogout() {
  const tokenId = forceRow.value?.tokenId
  if (!tokenId) {
    return
  }
  forcing.value = true
  try {
    await onlineStore.forceLogout(tokenId)
    forceVisible.value = false
    ElMessage.success('强退成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    forcing.value = false
  }
}
</script>

<template>
  <Card radius="sm" :padding="0">
    <Flex direction="column" class="h-full" justify="space-between">
      <div class="min-h-0 flex-1 overflow-auto">
        <Table class="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">序号</TableHead>
              <TableHead class="w-[18%]">会话编号</TableHead>
              <TableHead class="w-[10%]">登录名称</TableHead>
              <TableHead class="w-[12%]">所属部门</TableHead>
              <TableHead class="w-[10%]">主机</TableHead>
              <TableHead class="w-[10%]">登录地点</TableHead>
              <TableHead class="w-[8%]">操作系统</TableHead>
              <TableHead class="w-[8%]">浏览器</TableHead>
              <TableHead class="w-[14%]">登录时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="onlineStore.loading">
              <TableRow v-for="index in 8" :key="`skeleton-${index}`" class="h-14">
                <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                <TableCell v-for="col in 9" :key="col"><Skeleton class="h-4 w-2/3" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="onlineStore.onlineList.length === 0" class="h-14">
              <TableCell :colspan="10" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
            <template v-else>
              <TableRow v-for="(row, index) in onlineStore.onlineList" :key="row.tokenId" class="h-14">
                <TableCell>{{ (onlineStore.queryParams.pageNum! - 1) * (onlineStore.queryParams.pageSize ?? 10) + index + 1 }}</TableCell>
                <TableCell class="truncate">{{ row.tokenId }}</TableCell>
                <TableCell class="truncate">{{ row.userName }}</TableCell>
                <TableCell class="truncate">{{ row.deptName }}</TableCell>
                <TableCell class="truncate">{{ row.ipaddr }}</TableCell>
                <TableCell class="truncate">{{ row.loginLocation }}</TableCell>
                <TableCell class="truncate">{{ row.os }}</TableCell>
                <TableCell class="truncate">{{ row.browser }}</TableCell>
                <TableCell class="truncate">{{ parseTime(row.loginTime) }}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon-xs" radius="md" title="强退" @click="openForceLogout(row)">
                    <LogOut />
                  </Button>
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <Flex class="shrink-0 border-t-2" align="center" justify="space-between" :gap="8" :padding-x="14" :padding-y="9">
        <span class="text-sm text-muted-foreground whitespace-nowrap">共 {{ onlineStore.total }} 条</span>
        <Pagination
          v-model:page="currentPage"
          :items-per-page="onlineStore.queryParams.pageSize ?? 10"
          :total="onlineStore.total"
          :sibling-count="1"
          show-edges
          class="m-0 w-fit"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationEllipsis v-if="item.type === 'ellipsis'" />
              <PaginationItem v-else :value="item.value" :is-active="item.value === (onlineStore.queryParams.pageNum ?? 1)">
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
          </PaginationContent>
        </Pagination>
      </Flex>
    </Flex>

    <AlertDialog v-model:open="forceVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>强退用户</AlertDialogTitle>
          <AlertDialogDescription>
            确定要强退用户「{{ forceRow?.userName }}」吗？该用户会话将立即失效。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="forceVisible = false">取消</AlertDialogCancel>
          <Button color="danger" radius="md" :disabled="forcing" @click="confirmForceLogout">
            <Loader2 v-if="forcing" class="animate-spin" />
            强退
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
</template>
