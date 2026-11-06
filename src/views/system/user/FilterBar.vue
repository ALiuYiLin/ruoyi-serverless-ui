<script setup lang="ts">
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
</script>

<template>
  <Form class="form-filter__bar">
    <!-- 用户名称 -->
    <FormField name="userName">
      <Flex :gap="8">
        <Label class="whitespace-nowrap">用户名称</Label>
        <Input placeholder="请输入用户名称" radius="md" />
      </Flex>
    </FormField>

    <!-- 手机号码 -->
    <FormField name="phonenumber">
      <Flex :gap="8">
        <Label class="whitespace-nowrap">手机号码</Label>
        <Input placeholder="请输入手机号码" radius="md" />
      </Flex>
    </FormField>

    <!-- 状态 -->
    <FormField name="status">
      <Flex :gap="8">
        <Label class="whitespace-nowrap">状态</Label>
        <Select>
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
        <Input type="date" radius="md" />
        <span>至</span>
        <Input type="date" radius="md" />
      </Flex>
    </FormField>

    <!-- 操作按钮 -->
    <Flex :gap="8" class="ml-auto">
      <Button size="lg" type="button" radius="md">
        <Search />
        查询
      </Button>
      <Button size="lg" type="button" variant="outline" radius="md">
        <RotateCcw />
        重置
      </Button>
    </Flex>
  </Form>
</template>
<style scoped>
.form-filter__bar{
  @apply flex flex-row items-center flex-wrap;
  gap: 24px;
}
</style>
