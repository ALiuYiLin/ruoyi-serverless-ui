<script setup lang="ts">
import { reactive } from 'vue'
import { Loader2, RotateCcw, Search } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Card from '@/components/ui/card/Card.vue'
import useSystemOnlineStore, { type OnlineListFilter } from '@/store/system/online'

const onlineStore = useSystemOnlineStore()

const filters = reactive<OnlineListFilter>({
  ipaddr: '',
  userName: '',
})

function handleSearch() {
  if (onlineStore.loading) {
    return
  }
  onlineStore.search({ ...filters })
}

function handleReset() {
  if (onlineStore.loading) {
    return
  }
  filters.ipaddr = ''
  filters.userName = ''
  onlineStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="ipaddr">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">登录地址</Label>
          <Input v-model="filters.ipaddr" placeholder="请输入登录地址" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <FormField name="userName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">用户名称</Label>
          <Input v-model="filters.userName" placeholder="请输入用户名称" class="w-56" radius="md" />
        </Flex>
      </FormField>

      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="onlineStore.loading">
          <Loader2 v-if="onlineStore.loading" class="animate-spin" />
          <Search v-else />
          {{ onlineStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="onlineStore.loading" @click="handleReset">
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
