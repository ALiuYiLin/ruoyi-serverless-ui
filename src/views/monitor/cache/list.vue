<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Loader2, RefreshCw, Trash2 } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import {
  clearCacheAll,
  clearCacheKey,
  clearCacheName,
  getCacheValue as fetchCacheValue,
  listCacheKey,
  listCacheName,
} from '@/api/monitor/cache'
import type { SysCache } from '@/types'

const cacheNames = ref<SysCache[]>([])
const cacheKeys = ref<string[]>([])
const nowCacheName = ref('')
const loading = ref(false)
const subLoading = ref(false)
const loadingValue = ref(false)

const cacheForm = reactive<Required<Pick<SysCache, 'cacheName' | 'cacheKey' | 'cacheValue'>>>({
  cacheName: '',
  cacheKey: '',
  cacheValue: '',
})

const MIN_LOADING_MS = 300

async function getCacheNames() {
  const startedAt = Date.now()
  loading.value = true
  try {
    const res = await listCacheName()
    cacheNames.value = res.data ?? []
  } finally {
    const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining))
    }
    loading.value = false
  }
}

async function getCacheKeys(row?: SysCache) {
  const cacheName = row?.cacheName ?? nowCacheName.value
  if (!cacheName) {
    return
  }
  subLoading.value = true
  try {
    const res = await listCacheKey(cacheName)
    cacheKeys.value = res.data ?? []
    nowCacheName.value = cacheName
    cacheForm.cacheName = cacheName
    cacheForm.cacheKey = ''
    cacheForm.cacheValue = ''
  } finally {
    subLoading.value = false
  }
}

async function getCacheValue(cacheKey: string) {
  if (!nowCacheName.value) {
    return
  }
  loadingValue.value = true
  try {
    const res = await fetchCacheValue(nowCacheName.value, cacheKey)
    cacheForm.cacheName = res.data?.cacheName ?? nowCacheName.value
    cacheForm.cacheKey = res.data?.cacheKey ?? cacheKey
    cacheForm.cacheValue = res.data?.cacheValue ?? ''
  } finally {
    loadingValue.value = false
  }
}

function refreshCacheNames() {
  getCacheNames()
  ElMessage.success('刷新缓存列表成功')
}

function refreshCacheKeys() {
  getCacheKeys()
  ElMessage.success('刷新键名列表成功')
}

/** 清理确认 */
type ClearType = 'name' | 'key' | 'all'
const clearVisible = ref(false)
const clearType = ref<ClearType>('name')
const clearTarget = ref('')
const clearing = ref(false)

function openClear(type: ClearType, target = '') {
  clearType.value = type
  clearTarget.value = target
  clearVisible.value = true
}

const clearTitle = computed(() => {
  if (clearType.value === 'all') {
    return '清理全部缓存'
  }
  return clearType.value === 'name' ? '清理缓存名称' : '清理缓存键名'
})

const clearDescription = computed(() => {
  if (clearType.value === 'all') {
    return '确定要清理全部缓存吗？清理后不可恢复。'
  }
  return clearType.value === 'name'
    ? `确定要清理缓存名称「${clearTarget.value}」吗？`
    : `确定要清理缓存键名「${clearTarget.value}」吗？`
})

async function confirmClear() {
  clearing.value = true
  try {
    if (clearType.value === 'name') {
      await clearCacheName(clearTarget.value)
      ElMessage.success('清理成功')
      await getCacheKeys({ cacheName: clearTarget.value })
    } else if (clearType.value === 'key') {
      await clearCacheKey(clearTarget.value)
      ElMessage.success('清理成功')
      await getCacheKeys()
      cacheForm.cacheKey = ''
      cacheForm.cacheValue = ''
    } else {
      await clearCacheAll()
      ElMessage.success('清理全部缓存成功')
      cacheNames.value = []
      cacheKeys.value = []
      nowCacheName.value = ''
      cacheForm.cacheName = ''
      cacheForm.cacheKey = ''
      cacheForm.cacheValue = ''
    }
    clearVisible.value = false
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    clearing.value = false
  }
}

function nameFormatter(row: SysCache) {
  return row.cacheName?.replace(/:$/, '') ?? ''
}

function keyFormatter(cacheKey: string) {
  return cacheKey.replace(nowCacheName.value, '')
}

onMounted(() => getCacheNames())
</script>

<template>
  <Flex direction="column" :gap="14" class="h-full">
    <div class="flex items-center justify-between">
      <h1 class="text-[21px] leading-normal font-semibold tracking-[-0.2px] whitespace-nowrap text-foreground">
        缓存列表
      </h1>
      <Button variant="outline" radius="md" size="lg" :disabled="loading" @click="refreshCacheNames">
        <Loader2 v-if="loading" class="animate-spin" />
        <RefreshCw v-else />
        刷新缓存列表
      </Button>
    </div>

    <div class="grid min-h-0 flex-1 grid-cols-3 gap-4">
      <!-- 缓存名称 -->
      <Card radius="sm" :padding="0" class="flex min-h-0 flex-col">
        <Flex align="center" justify="space-between" class="shrink-0 border-b border-border px-4 py-3">
          <span class="text-sm font-medium">缓存列表</span>
          <Button variant="ghost" size="icon-xs" radius="md" title="刷新" @click="refreshCacheNames">
            <RefreshCw />
          </Button>
        </Flex>
        <div class="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">序号</TableHead>
                <TableHead>缓存名称</TableHead>
                <TableHead>备注</TableHead>
                <TableHead class="w-10">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="loading">
                <TableRow v-for="index in 6" :key="`skeleton-${index}`" class="h-12">
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="cacheNames.length === 0">
                <TableCell :colspan="4" class="text-center text-muted-foreground">暂无缓存</TableCell>
              </TableRow>
              <template v-else>
                <TableRow
                  v-for="(row, index) in cacheNames"
                  :key="row.cacheName"
                  class="h-12 cursor-pointer hover:bg-muted"
                  :class="{ 'bg-muted': row.cacheName === nowCacheName }"
                  @click="getCacheKeys(row)"
                >
                  <TableCell>{{ index + 1 }}</TableCell>
                  <TableCell class="truncate">{{ nameFormatter(row) }}</TableCell>
                  <TableCell class="truncate">{{ row.remark }}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      radius="md"
                      title="清理"
                      @click.stop="openClear('name', row.cacheName ?? '')"
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </Card>

      <!-- 键名 -->
      <Card radius="sm" :padding="0" class="flex min-h-0 flex-col">
        <Flex align="center" justify="space-between" class="shrink-0 border-b border-border px-4 py-3">
          <span class="text-sm font-medium">键名列表</span>
          <Button variant="ghost" size="icon-xs" radius="md" title="刷新" @click="refreshCacheKeys">
            <RefreshCw />
          </Button>
        </Flex>
        <div class="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">序号</TableHead>
                <TableHead>缓存键名</TableHead>
                <TableHead class="w-10">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="subLoading">
                <TableRow v-for="index in 6" :key="`skeleton-${index}`" class="h-12">
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="cacheKeys.length === 0">
                <TableCell :colspan="3" class="text-center text-muted-foreground">请选择缓存名称</TableCell>
              </TableRow>
              <template v-else>
                <TableRow
                  v-for="(key, index) in cacheKeys"
                  :key="key"
                  class="h-12 cursor-pointer hover:bg-muted"
                  :class="{ 'bg-muted': key === cacheForm.cacheKey }"
                  @click="getCacheValue(key)"
                >
                  <TableCell>{{ index + 1 }}</TableCell>
                  <TableCell class="truncate">{{ keyFormatter(key) }}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      radius="md"
                      title="清理"
                      @click.stop="openClear('key', key)"
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>
      </Card>

      <!-- 缓存内容 -->
      <Card radius="sm" :padding="0" class="flex min-h-0 flex-col">
        <Flex align="center" justify="space-between" class="shrink-0 border-b border-border px-4 py-3">
          <span class="text-sm font-medium">缓存内容</span>
          <Button color="danger" variant="ghost" size="sm" radius="md" @click="openClear('all')">
            <Trash2 />
            清理全部
          </Button>
        </Flex>
        <Flex direction="column" :gap="8" class="min-h-0 flex-1 overflow-auto p-4">
          <Flex direction="column" :gap="2">
            <span class="text-xs text-muted-foreground">缓存名称</span>
            <Input :model-value="cacheForm.cacheName" disabled radius="md" />
          </Flex>
          <Flex direction="column" :gap="2">
            <span class="text-xs text-muted-foreground">缓存键名</span>
            <Input :model-value="cacheForm.cacheKey" disabled radius="md" />
          </Flex>
          <Flex direction="column" :gap="2" class="min-h-0 flex-1">
            <span class="text-xs text-muted-foreground">缓存内容</span>
            <Loader2 v-if="loadingValue" class="animate-spin" />
            <Textarea
              v-else
              :model-value="cacheForm.cacheValue"
              disabled
              class="min-h-[320px] flex-1 resize-none font-mono text-xs"
            />
          </Flex>
        </Flex>
      </Card>
    </div>

    <AlertDialog v-model:open="clearVisible">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ clearTitle }}</AlertDialogTitle>
          <AlertDialogDescription>{{ clearDescription }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel radius="md" @click="clearVisible = false">取消</AlertDialogCancel>
          <Button color="danger" radius="md" :disabled="clearing" @click="confirmClear">
            <Loader2 v-if="clearing" class="animate-spin" />
            确定
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Flex>
</template>
