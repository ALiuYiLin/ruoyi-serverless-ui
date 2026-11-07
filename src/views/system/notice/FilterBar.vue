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
import useSystemNoticeStore, { type NoticeListFilter } from '@/store/system/notice'

const noticeStore = useSystemNoticeStore()

const filters = reactive<NoticeListFilter>({
  noticeTitle: '',
  createBy: '',
  noticeType: undefined,
})

function handleSearch() {
  if (noticeStore.loading) {
    return
  }
  noticeStore.search({ ...filters })
}

function handleReset() {
  if (noticeStore.loading) {
    return
  }
  filters.noticeTitle = ''
  filters.createBy = ''
  filters.noticeType = undefined
  noticeStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="noticeTitle">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">公告标题</Label>
          <Input v-model="filters.noticeTitle" placeholder="请输入公告标题" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="createBy">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">操作人员</Label>
          <Input v-model="filters.createBy" placeholder="请输入操作人员" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="noticeType">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">类型</Label>
          <Select
            :model-value="filters.noticeType"
            @update:model-value="value => (filters.noticeType = value as '1' | '2' | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">通知</SelectItem>
              <SelectItem value="2">公告</SelectItem>
            </SelectContent>
          </Select>
        </Flex>
      </FormField>

      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="noticeStore.loading">
          <Loader2 v-if="noticeStore.loading" class="animate-spin" />
          <Search v-else />
          {{ noticeStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="noticeStore.loading" @click="handleReset">
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
