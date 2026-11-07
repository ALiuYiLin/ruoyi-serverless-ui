<script setup lang="ts">
import { computed } from 'vue'
import { Copy } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useSystemOperlogStore from '@/store/system/operlog'

const operlogStore = useSystemOperlogStore()

const log = computed(() => operlogStore.detailLog)

function formatJson(value?: string) {
  if (!value) {
    return ''
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const infoItems = computed(() => [
  { label: '操作模块', value: log.value?.title },
  { label: '登录信息', value: `${log.value?.operName ?? ''} / ${log.value?.operIp ?? ''} / ${log.value?.operLocation ?? ''}` },
  { label: '请求地址', value: log.value?.operUrl },
  { label: '请求方式', value: log.value?.requestMethod },
  { label: '操作方法', value: log.value?.method },
  { label: '操作时间', value: log.value?.operTime },
  { label: '消耗时间', value: log.value?.costTime != null ? `${log.value.costTime} ms` : undefined },
])

async function copyText(text?: string) {
  if (!text) {
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<template>
  <Dialog v-model:open="operlogStore.detailVisible">
    <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-[760px]">
      <DialogHeader>
        <DialogTitle>操作日志详情</DialogTitle>
        <DialogDescription>查看本次操作的请求与响应信息</DialogDescription>
      </DialogHeader>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <Flex v-for="item in infoItems" :key="item.label" direction="column" :gap="2">
          <span class="text-xs text-muted-foreground">{{ item.label }}</span>
          <span class="break-all text-sm">{{ item.value ?? '-' }}</span>
        </Flex>
      </div>

      <Flex direction="column" :gap="4">
        <Flex align="center" justify="space-between">
          <span class="text-xs text-muted-foreground">请求参数</span>
          <Button variant="ghost" size="sm" radius="md" @click="copyText(log?.operParam)">
            <Copy />
            复制
          </Button>
        </Flex>
        <pre class="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">{{ formatJson(log?.operParam) }}</pre>
      </Flex>

      <Flex direction="column" :gap="4">
        <Flex align="center" justify="space-between">
          <span class="text-xs text-muted-foreground">返回参数</span>
          <Button variant="ghost" size="sm" radius="md" @click="copyText(log?.jsonResult)">
            <Copy />
            复制
          </Button>
        </Flex>
        <pre class="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">{{ formatJson(log?.jsonResult) }}</pre>
      </Flex>

      <Flex v-if="log?.errorMsg" direction="column" :gap="4">
        <span class="text-xs text-muted-foreground">异常信息</span>
        <pre class="max-h-32 overflow-auto rounded-md bg-destructive/10 p-3 text-xs text-destructive whitespace-pre-wrap">{{ log.errorMsg }}</pre>
      </Flex>

      <DialogFooter>
        <Button variant="outline" radius="md" @click="operlogStore.closeDetail()">关闭</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
