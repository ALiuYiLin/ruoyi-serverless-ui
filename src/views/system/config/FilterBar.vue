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
import useSystemConfigStore, { type ConfigListFilter } from '@/store/system/config'

const configStore = useSystemConfigStore()

const filters = reactive<ConfigListFilter>({
  configName: '',
  configKey: '',
  configType: undefined,
  beginTime: '',
  endTime: '',
})

function handleSearch() {
  if (configStore.loading) {
    return
  }
  configStore.search({ ...filters })
}

function handleReset() {
  if (configStore.loading) {
    return
  }
  filters.configName = ''
  filters.configKey = ''
  filters.configType = undefined
  filters.beginTime = ''
  filters.endTime = ''
  configStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="configName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">参数名称</Label>
          <Input v-model="filters.configName" placeholder="请输入参数名称" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="configKey">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">参数键名</Label>
          <Input v-model="filters.configKey" placeholder="请输入参数键名" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="configType">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">系统内置</Label>
          <Select
            :model-value="filters.configType"
            @update:model-value="value => (filters.configType = value as 'Y' | 'N' | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Y">是</SelectItem>
              <SelectItem value="N">否</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>

      <FormField name="dateRange">
        <Flex align="center" :gap="8">
          <Label class="whitespace-nowrap">创建时间</Label>
          <Input v-model="filters.beginTime" type="date" radius="md" />
          <span>至</span>
          <Input v-model="filters.endTime" type="date" radius="md" />
        </Flex>
      </FormField>

      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="configStore.loading">
          <Loader2 v-if="configStore.loading" class="animate-spin" />
          <Search v-else />
          {{ configStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="configStore.loading" @click="handleReset">
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
