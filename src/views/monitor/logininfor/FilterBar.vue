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
import useSystemLogininforStore, { type LogininforListFilter } from '@/store/system/logininfor'

const logininforStore = useSystemLogininforStore()

const filters = reactive<LogininforListFilter>({
  ipaddr: '',
  userName: '',
  status: undefined,
  beginTime: '',
  endTime: '',
})

function handleSearch() {
  if (logininforStore.loading) {
    return
  }
  logininforStore.search({ ...filters })
}

function handleReset() {
  if (logininforStore.loading) {
    return
  }
  filters.ipaddr = ''
  filters.userName = ''
  filters.status = undefined
  filters.beginTime = ''
  filters.endTime = ''
  logininforStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="ipaddr">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">登录地址</Label>
          <Input v-model="filters.ipaddr" placeholder="请输入登录地址" class="w-44" radius="md" />
        </Flex>
      </FormField>

      <FormField name="userName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">用户名称</Label>
          <Input v-model="filters.userName" placeholder="请输入用户名称" class="w-44" radius="md" />
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
          <Label class="whitespace-nowrap">登录时间</Label>
          <Input v-model="filters.beginTime" type="date" radius="md" />
          <span>至</span>
          <Input v-model="filters.endTime" type="date" radius="md" />
        </Flex>
      </FormField>

      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="logininforStore.loading">
          <Loader2 v-if="logininforStore.loading" class="animate-spin" />
          <Search v-else />
          {{ logininforStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="logininforStore.loading" @click="handleReset">
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
