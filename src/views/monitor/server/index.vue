<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Coffee, Cpu, HardDrive, Loader2, MemoryStick, Monitor } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Card from '@/components/ui/card/Card.vue'
import { getServer } from '@/api/monitor/server'
import type { ServerInfo } from '@/types'
import PageHead from './PageHead.vue'

const server = ref<ServerInfo>({})
const loading = ref(false)

const cpuRows = computed(() => [
  { label: '核心数', value: server.value.cpu?.cpuNum },
  { label: '用户使用率', value: `${server.value.cpu?.used ?? 0}%` },
  { label: '系统使用率', value: `${server.value.cpu?.sys ?? 0}%` },
  { label: '当前空闲率', value: `${server.value.cpu?.free ?? 0}%` },
])

const sysRows = computed(() => [
  { label: '服务器名称', value: server.value.sys?.computerName },
  { label: '服务器IP', value: server.value.sys?.computerIp },
  { label: '操作系统', value: server.value.sys?.osName },
  { label: '系统架构', value: server.value.sys?.osArch },
  { label: '项目路径', value: server.value.sys?.userDir },
])

const jvmRows = computed(() => [
  { label: 'Java名称', value: server.value.jvm?.name },
  { label: 'Java版本', value: server.value.jvm?.version },
  { label: '启动时间', value: server.value.jvm?.startTime },
  { label: '运行时长', value: server.value.jvm?.runTime },
  { label: '安装路径', value: server.value.jvm?.home },
  { label: '运行参数', value: server.value.jvm?.inputArgs },
])

const memRows = computed(() => [
  { label: '总内存', mem: `${server.value.mem?.total ?? 0}G`, jvm: `${server.value.jvm?.total ?? 0}M` },
  { label: '已用内存', mem: `${server.value.mem?.used ?? 0}G`, jvm: `${server.value.jvm?.used ?? 0}M` },
  { label: '剩余内存', mem: `${server.value.mem?.free ?? 0}G`, jvm: `${server.value.jvm?.free ?? 0}M` },
  { label: '使用率', mem: `${server.value.mem?.usage ?? 0}%`, jvm: `${server.value.jvm?.usage ?? 0}%` },
])

const memUsage = computed(() => Number(server.value.mem?.usage ?? 0))
const jvmUsage = computed(() => Number(server.value.jvm?.usage ?? 0))

async function getList() {
  loading.value = true
  try {
    const res = await getServer()
    server.value = res.data ?? {}
  } finally {
    loading.value = false
  }
}

onMounted(() => getList())
</script>

<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead :loading="loading" @refresh="getList" />

    <Flex v-if="loading && !server.cpu" align="center" justify="center" class="flex-1" :gap="8">
      <Loader2 class="animate-spin" />
      <span class="text-sm text-muted-foreground">正在加载服务监控数据...</span>
    </Flex>

    <div v-else class="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-auto">
      <!-- CPU -->
      <Card radius="sm" :padding="16">
        <Flex align="center" :gap="2" class="mb-3">
          <Cpu class="size-4" />
          <span class="text-sm font-medium">CPU</span>
        </Flex>
        <div class="flex flex-col divide-y divide-border">
          <Flex v-for="row in cpuRows" :key="row.label" justify="space-between" class="py-2 text-sm">
            <span class="text-muted-foreground">{{ row.label }}</span>
            <span>{{ row.value }}</span>
          </Flex>
        </div>
      </Card>

      <!-- 内存 -->
      <Card radius="sm" :padding="16">
        <Flex align="center" :gap="2" class="mb-3">
          <MemoryStick class="size-4" />
          <span class="text-sm font-medium">内存</span>
        </Flex>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>属性</TableHead>
              <TableHead>内存</TableHead>
              <TableHead>JVM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in memRows" :key="row.label">
              <TableCell class="text-muted-foreground">{{ row.label }}</TableCell>
              <TableCell :class="row.label === '使用率' && memUsage > 80 ? 'text-destructive' : ''">{{ row.mem }}</TableCell>
              <TableCell :class="row.label === '使用率' && jvmUsage > 80 ? 'text-destructive' : ''">{{ row.jvm }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <!-- 服务器信息 -->
      <Card radius="sm" :padding="16">
        <Flex align="center" :gap="2" class="mb-3">
          <Monitor class="size-4" />
          <span class="text-sm font-medium">服务器信息</span>
        </Flex>
        <div class="flex flex-col divide-y divide-border">
          <Flex v-for="row in sysRows" :key="row.label" justify="space-between" class="gap-4 py-2 text-sm">
            <span class="shrink-0 text-muted-foreground">{{ row.label }}</span>
            <span class="truncate text-right">{{ row.value ?? '-' }}</span>
          </Flex>
        </div>
      </Card>

      <!-- JVM -->
      <Card radius="sm" :padding="16">
        <Flex align="center" :gap="2" class="mb-3">
          <Coffee class="size-4" />
          <span class="text-sm font-medium">Java虚拟机信息</span>
        </Flex>
        <div class="flex flex-col divide-y divide-border">
          <Flex v-for="row in jvmRows" :key="row.label" justify="space-between" class="gap-4 py-2 text-sm">
            <span class="shrink-0 text-muted-foreground">{{ row.label }}</span>
            <span class="truncate text-right">{{ row.value ?? '-' }}</span>
          </Flex>
        </div>
      </Card>

      <!-- 磁盘 -->
      <Card radius="sm" :padding="16" class="col-span-2">
        <Flex align="center" :gap="2" class="mb-3">
          <HardDrive class="size-4" />
          <span class="text-sm font-medium">磁盘状态</span>
        </Flex>
        <Table class="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead>盘符路径</TableHead>
              <TableHead>文件系统</TableHead>
              <TableHead>盘符类型</TableHead>
              <TableHead>总大小</TableHead>
              <TableHead>可用大小</TableHead>
              <TableHead>已用大小</TableHead>
              <TableHead>已用百分比</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="(file, index) in server.sysFiles ?? []" :key="index">
              <TableCell>{{ file.dirName }}</TableCell>
              <TableCell>{{ file.sysTypeName }}</TableCell>
              <TableCell>{{ file.typeName }}</TableCell>
              <TableCell>{{ file.total }}</TableCell>
              <TableCell>{{ file.free }}</TableCell>
              <TableCell>{{ file.used }}</TableCell>
              <TableCell :class="Number(file.usage ?? 0) > 80 ? 'text-destructive' : ''">{{ file.usage }}%</TableCell>
            </TableRow>
            <TableRow v-if="!server.sysFiles?.length">
              <TableCell :colspan="7" class="text-center text-muted-foreground">暂无数据</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  </Flex>
</template>
