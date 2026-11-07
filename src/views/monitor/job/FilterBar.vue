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
import useSystemJobStore, { type JobListFilter } from '@/store/system/job'

const jobStore = useSystemJobStore()

const filters = reactive<JobListFilter>({
  jobName: '',
  jobGroup: undefined,
  status: undefined,
})

function handleSearch() {
  if (jobStore.loading) {
    return
  }
  jobStore.search({ ...filters })
}

function handleReset() {
  if (jobStore.loading) {
    return
  }
  filters.jobName = ''
  filters.jobGroup = undefined
  filters.status = undefined
  jobStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="jobName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">任务名称</Label>
          <Input v-model="filters.jobName" placeholder="请输入任务名称" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="jobGroup">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">任务组名</Label>
          <Select
            :model-value="filters.jobGroup"
            @update:model-value="value => (filters.jobGroup = value as string | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DEFAULT">默认</SelectItem>
              <SelectItem value="SYSTEM">系统</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>

      <FormField name="status">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">任务状态</Label>
          <Select
            :model-value="filters.status"
            @update:model-value="value => (filters.status = value as '0' | '1' | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">正常</SelectItem>
              <SelectItem value="1">暂停</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>

      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="jobStore.loading">
          <Loader2 v-if="jobStore.loading" class="animate-spin" />
          <Search v-else />
          {{ jobStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="jobStore.loading" @click="handleReset">
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
