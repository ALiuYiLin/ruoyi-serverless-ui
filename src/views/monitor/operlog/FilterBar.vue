<script setup lang="ts">
import { reactive } from 'vue'
import { Loader2, RotateCcw, Search } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Card from '@/components/ui/card/Card.vue'
import useSystemOperlogStore, { type OperlogListFilter } from '@/store/system/operlog'

const operlogStore = useSystemOperlogStore()

const filters = reactive<OperlogListFilter>({
  operIp: '',
  title: '',
  operName: '',
  businessType: undefined,
  status: undefined,
  beginTime: '',
  endTime: '',
})

const businessTypeOptions = [
  { value: '0', label: '其他' },
  { value: '1', label: '新增' },
  { value: '2', label: '修改' },
  { value: '3', label: '删除' },
  { value: '4', label: '授权' },
  { value: '5', label: '导出' },
  { value: '6', label: '导入' },
  { value: '7', label: '强退' },
  { value: '8', label: '生成代码' },
  { value: '9', label: '清空数据' },
]

function handleSearch() {
  if (operlogStore.loading) {
    return
  }
  operlogStore.search({ ...filters })
}

function handleReset() {
  if (operlogStore.loading) {
    return
  }
  filters.operIp = ''
  filters.title = ''
  filters.operName = ''
  filters.businessType = undefined
  filters.status = undefined
  filters.beginTime = ''
  filters.endTime = ''
  operlogStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="operIp">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">操作地址</Label>
          <Input v-model="filters.operIp" placeholder="请输入操作地址" class="w-44" radius="md" />
        </Flex>
      </FormField>

      <FormField name="title">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">系统模块</Label>
          <Input v-model="filters.title" placeholder="请输入系统模块" class="w-44" radius="md" />
        </Flex>
      </FormField>

      <FormField name="operName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">操作人员</Label>
          <Input v-model="filters.operName" placeholder="请输入操作人员" class="w-44" radius="md" />
        </Flex>
      </FormField>

      <FormField name="businessType">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">类型</Label>
          <Select
            :model-value="filters.businessType"
            @update:model-value="value => (filters.businessType = value as string | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="item in businessTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>

      <FormField name="status">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">状态</Label>
          <Select
            :model-value="filters.status"
            @update:model-value="value => (filters.status = value as string | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">成功</SelectItem>
              <SelectItem value="1">失败</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>

      <FormField name="dateRange">
        <Flex align="center" :gap="8">
          <Label class="whitespace-nowrap">操作时间</Label>
          <Input v-model="filters.beginTime" type="date" radius="md" />
          <span>至</span>
          <Input v-model="filters.endTime" type="date" radius="md" />
        </Flex>
      </FormField>

      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="operlogStore.loading">
          <Loader2 v-if="operlogStore.loading" class="animate-spin" />
          <Search v-else />
          {{ operlogStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="operlogStore.loading" @click="handleReset">
          <RotateCcw />
          重置
        </Button>
      </Flex>
    </Form>
  </Card>
</template>
<style scoped>
.form-filter__bar{
  @apply flex flex-row items-center flex-wrap;
  gap: 20px;
}
</style>
