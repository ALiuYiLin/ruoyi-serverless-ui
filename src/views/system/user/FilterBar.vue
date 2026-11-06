<script setup lang="ts">
import { reactive } from 'vue'
import { RotateCcw, Search } from '@lucide/vue'

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

import type { UserFilter } from './types'

const emit = defineEmits<{
  (e: 'search', filter: UserFilter): void
  (e: 'reset'): void
}>()

const filters = reactive<UserFilter>({
  userName: '',
  phonenumber: '',
  status: undefined,
  beginTime: '',
  endTime: '',
})

function handleSearch() {
  emit('search', { ...filters })
}

function handleReset() {
  filters.userName = ''
  filters.phonenumber = ''
  filters.status = undefined
  filters.beginTime = ''
  filters.endTime = ''
  emit('reset')
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <!-- 用户名称 -->
      <FormField name="userName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">用户名称</Label>
          <Input v-model="filters.userName" placeholder="请输入用户名称" radius="md" />
        </Flex>
      </FormField>

      <!-- 手机号码 -->
      <FormField name="phonenumber">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">手机号码</Label>
          <Input v-model="filters.phonenumber" placeholder="请输入手机号码" radius="md" />
        </Flex>
      </FormField>

      <!-- 状态 -->
      <FormField name="status">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">状态</Label>
          <Select
            :model-value="filters.status"
            @update:model-value="value => (filters.status = value as '0' | '1' | undefined)"
          >
            <SelectTrigger class="w-45" radius="md">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent radius="md">
              <SelectItem value="0" radius="md">正常</SelectItem>
              <SelectItem value="1" radius="md">停用</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>

      <!-- 创建时间 -->
      <FormField name="dateRange">
        <Flex align="center" :gap="8">
          <Label class="whitespace-nowrap">创建时间</Label>
          <Input v-model="filters.beginTime" type="date" radius="md" />
          <span>至</span>
          <Input v-model="filters.endTime" type="date" radius="md" />
        </Flex>
      </FormField>

      <!-- 操作按钮 -->
      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md">
          <Search />
          查询
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" @click="handleReset">
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
