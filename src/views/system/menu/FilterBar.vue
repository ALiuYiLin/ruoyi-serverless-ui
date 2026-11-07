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
import useSystemMenuStore, { type MenuListFilter } from '@/store/system/menu'

const menuStore = useSystemMenuStore()

const filters = reactive<MenuListFilter>({
  menuName: '',
  status: undefined,
})

function handleSearch() {
  if (menuStore.loading) {
    return
  }
  menuStore.search({ ...filters })
}

function handleReset() {
  if (menuStore.loading) {
    return
  }
  filters.menuName = ''
  filters.status = undefined
  menuStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <FormField name="menuName">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">菜单名称</Label>
          <Input v-model="filters.menuName" placeholder="请输入菜单名称" class="w-56" radius="md" />
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

      <Flex :gap="8" class="ml-auto">
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="menuStore.loading">
          <Loader2 v-if="menuStore.loading" class="animate-spin" />
          <Search v-else />
          {{ menuStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="menuStore.loading" @click="handleReset">
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
