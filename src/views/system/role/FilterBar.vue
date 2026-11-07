<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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
import useSystemRoleStore, { type RoleListFilter } from '@/store/system/role'

const roleStore = useSystemRoleStore()

/** 关键字搜索：下拉选择搜索字段 + 关键字输入框 */
const searchField = ref<'roleName' | 'roleKey'>('roleName')
const keyword = ref('')
const keywordPlaceholder = computed(() =>
  searchField.value === 'roleName' ? '请输入角色名称' : '请输入权限字符',
)
const searchFieldOptions = [
  { value: 'roleName', label: '角色名称' },
  { value: 'roleKey', label: '权限字符' },
]

const filters = reactive<RoleListFilter>({
  roleName: '',
  roleKey: '',
  status: undefined,
  beginTime: '',
  endTime: '',
})

function handleSearch() {
  if (roleStore.loading) {
    return
  }
  filters.roleName = searchField.value === 'roleName' ? keyword.value : ''
  filters.roleKey = searchField.value === 'roleKey' ? keyword.value : ''
  roleStore.search({ ...filters })
}

function handleReset() {
  if (roleStore.loading) {
    return
  }
  keyword.value = ''
  searchField.value = 'roleName'
  filters.roleName = ''
  filters.roleKey = ''
  filters.status = undefined
  filters.beginTime = ''
  filters.endTime = ''
  roleStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <!-- 关键字：字段下拉 + 关键字输入组合 -->
      <FormField name="keyword">
        <Flex :gap="8">
          <!-- <Label class="whitespace-nowrap">关键字</Label> -->
          <Flex :gap="0">
            <Select
              :model-value="searchField"
              @update:model-value="value => (searchField = value as 'roleName' | 'roleKey')"
            >
              <SelectTrigger class="w-28 rounded-r-none" radius="md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="option in searchFieldOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-model="keyword"
              :placeholder="keywordPlaceholder"
              class="-ml-px w-56 rounded-l-none"
              radius="md"
            />
          </Flex>
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
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="roleStore.loading">
          <Loader2 v-if="roleStore.loading" class="animate-spin" />
          <Search v-else />
          {{ roleStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="roleStore.loading" @click="handleReset">
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
