<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Loader2 } from '@lucide/vue'
import * as echarts from 'echarts'

import Flex from '@/components/Flex/Flex.vue'
import Card from '@/components/ui/card/Card.vue'
import { getCache } from '@/api/monitor/cache'
import type { CacheMonitorData } from '@/types'
import PageHead from './PageHead.vue'

const cache = ref<CacheMonitorData>({})
const loading = ref(false)
const commandRef = ref<HTMLDivElement>()
const memoryRef = ref<HTMLDivElement>()
let commandChart: echarts.ECharts | undefined
let memoryChart: echarts.ECharts | undefined

const infoRows = computed(() => {
  const info = cache.value.info ?? {}
  return [
    { label: 'Redis版本', value: info.redis_version },
    { label: '运行模式', value: info.redis_mode === 'standalone' ? '单机' : '集群' },
    { label: '端口', value: info.tcp_port },
    { label: '客户端数', value: info.connected_clients },
    { label: '运行时间(天)', value: info.uptime_in_days },
    { label: '使用内存', value: info.used_memory_human },
    { label: '使用CPU', value: Number.parseFloat(info.used_cpu_user_children ?? '0').toFixed(2) },
    { label: '内存配置', value: info.maxmemory_human },
    { label: 'AOF是否开启', value: info.aof_enabled === '0' ? '否' : '是' },
    { label: 'RDB是否成功', value: info.rdb_last_bgsave_status },
    { label: 'Key数量', value: cache.value.dbSize },
    { label: '网络入口/出口', value: `${info.instantaneous_input_kbps ?? 0}kps / ${info.instantaneous_output_kbps ?? 0}kps` },
  ]
})

function renderCharts() {
  if (commandRef.value) {
    commandChart?.dispose()
    commandChart = echarts.init(commandRef.value)
    commandChart.setOption({
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
      series: [
        {
          name: '命令',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '45%'],
          data: (cache.value.commandStats ?? []).map(item => ({
            name: item.name,
            value: Number(item.value),
          })),
          animationEasing: 'cubicInOut',
          animationDuration: 1000,
        },
      ],
    })
  }

  if (memoryRef.value) {
    memoryChart?.dispose()
    memoryChart = echarts.init(memoryRef.value)
    const usedMemory = Number.parseFloat(cache.value.info?.used_memory_human ?? '0') || 0
    memoryChart.setOption({
      tooltip: {
        formatter: `{b} <br/>{a} : ${cache.value.info?.used_memory_human ?? '0'}`,
      },
      series: [
        {
          name: '峰值',
          type: 'gauge',
          min: 0,
          max: 1000,
          detail: { formatter: cache.value.info?.used_memory_human ?? '0' },
          data: [{ value: usedMemory, name: '内存消耗' }],
        },
      ],
    })
  }
}

function handleResize() {
  commandChart?.resize()
  memoryChart?.resize()
}

async function getList() {
  loading.value = true
  try {
    const res = await getCache()
    cache.value = res.data ?? {}
    await nextTick()
    renderCharts()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  commandChart?.dispose()
  memoryChart?.dispose()
})
</script>

<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead :loading="loading" @refresh="getList" />

    <Flex v-if="loading && !cache.info" align="center" justify="center" class="flex-1" :gap="8">
      <Loader2 class="animate-spin" />
      <span class="text-sm text-muted-foreground">正在加载缓存监控数据...</span>
    </Flex>

    <Flex v-else direction="column" :gap="14" class="min-h-0 flex-1 overflow-auto">
      <!-- 基本信息 -->
      <Card radius="sm" :padding="16">
        <div class="mb-3 text-sm font-medium">基本信息</div>
        <div class="grid grid-cols-4 gap-x-6 gap-y-2">
          <Flex v-for="row in infoRows" :key="row.label" justify="space-between" class="gap-2 border-b border-border py-1 text-sm">
            <span class="text-muted-foreground">{{ row.label }}</span>
            <span class="truncate text-right">{{ row.value ?? '-' }}</span>
          </Flex>
        </div>
      </Card>

      <div class="grid grid-cols-2 gap-4">
        <Card radius="sm" :padding="16">
          <div class="mb-2 text-sm font-medium">命令统计</div>
          <div ref="commandRef" class="h-[380px] w-full" />
        </Card>
        <Card radius="sm" :padding="16">
          <div class="mb-2 text-sm font-medium">内存信息</div>
          <div ref="memoryRef" class="h-[380px] w-full" />
        </Card>
      </div>
    </Flex>
  </Flex>
</template>
