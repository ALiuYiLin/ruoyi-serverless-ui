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
import useSystemDictTypeStore, { type DictTypeListFilter } from '@/store/system/dict'

const dictStore = useSystemDictTypeStore()

const filters = reactive<DictTypeListFilter>({
  dictName: '',
  dictType: '',
  status: undefined,
  beginTime: '',
  endTime: '',
})

function handleSearch() {
  if (dictStore.loading) {
    return
  }
  dictStore.search({ ...filters })
}

function handleReset() {
  if (dictStore.loading) {
    return
  }
  filters.dictName = ''
  filters.dictType = ''
  filters.status = undefined
  filters.beginTime = ''
  filters.endTime = ''
  dictStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="dictName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">字典名称</Label>
          <Input v-model="filters.dictName" placeholder="请输入字典名称" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="dictType">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">字典类型</Label>
          <Input v-model="filters.dictType" placeholder="请输入字典类型" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="status">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">状态</Label>
          <Select
            :model-value="filters.status"
            @update:model-value="value => (filters.status = value as '0' | '1' | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">正常</SelectItem>
              <SelectItem value="1">停用</SelectItem>
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
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="dictStore.loading">
          <Loader2 v-if="dictStore.loading" class="animate-spin" />
          <Search v-else />
          {{ dictStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="dictStore.loading" @click="handleReset">
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
