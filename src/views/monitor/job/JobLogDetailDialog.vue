<script setup lang="ts">
import { computed } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SysJobLog } from '@/types'

const props = defineProps<{
  open: boolean
  log?: SysJobLog
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const visible = computed({
  get: () => props.open,
  set: value => emit('update:open', value),
})

const costTime = computed(() => {
  const start = props.log?.startTime
  const end = props.log?.endTime
  if (!start || !end) {
    return '-'
  }
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Number.isNaN(diff) ? '-' : `${diff} ms`
})

const infoItems = computed(() => [
  { label: '日志编号', value: props.log?.jobLogId },
  { label: '执行状态', value: props.log?.status === '0' ? '正常' : '失败' },
  { label: '开始时间', value: props.log?.startTime },
  { label: '结束时间', value: props.log?.endTime },
  { label: '记录时间', value: props.log?.createTime },
  { label: '执行耗时', value: costTime.value },
])
</script>

<template>
  <Dialog v-model:open="visible">
    <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-[720px]">
      <DialogHeader>
        <DialogTitle>调度日志详细</DialogTitle>
      </DialogHeader>

      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <Flex v-for="item in infoItems" :key="item.label" direction="column" :gap="2">
          <span class="text-xs text-muted-foreground">{{ item.label }}</span>
          <span class="text-sm">{{ item.value ?? '-' }}</span>
        </Flex>
      </div>

      <Flex direction="column" :gap="2">
        <span class="text-xs text-muted-foreground">任务名称 / 分组</span>
        <span class="text-sm">{{ log?.jobName ?? '-' }} / {{ log?.jobGroup ?? '-' }}</span>
      </Flex>

      <Flex direction="column" :gap="2">
        <span class="text-xs text-muted-foreground">日志信息</span>
        <span class="text-sm">{{ log?.jobMessage ?? '-' }}</span>
      </Flex>

      <Flex direction="column" :gap="2">
        <span class="text-xs text-muted-foreground">调用目标</span>
        <pre class="max-h-32 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">{{ log?.invokeTarget || '（无）' }}</pre>
      </Flex>

      <Flex v-if="log?.exceptionInfo" direction="column" :gap="2">
        <span class="text-xs text-muted-foreground">异常信息</span>
        <pre class="max-h-40 overflow-auto rounded-md bg-destructive/10 p-3 text-xs text-destructive whitespace-pre-wrap">{{ log.exceptionInfo }}</pre>
      </Flex>

      <DialogFooter>
        <Button variant="outline" radius="md" @click="visible = false">关闭</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
