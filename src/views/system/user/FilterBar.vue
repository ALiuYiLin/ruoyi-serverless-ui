<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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
import DeptTreeSelect from '@/business/components/DeptTreeSelect/index.vue'

import useSystemUserStore, { type UserListFilter } from '@/store/system/user'

const userStore = useSystemUserStore()

onMounted(() => userStore.loadDeptTree())

/** 关键字搜索：下拉选择搜索字段 + 关键字输入框 */
const searchField = ref<'userName' | 'phonenumber'>('userName')
const keyword = ref('')
const keywordPlaceholder = computed(() =>
  searchField.value === 'userName' ? '请输入用户名称' : '请输入手机号码',
)
const searchFieldOptions = [
  { value: 'userName', label: '用户名称' },
  { value: 'phonenumber', label: '手机号码' },
]

const filters = reactive<UserListFilter>({
  userName: '',
  phonenumber: '',
  status: undefined,
  deptId: undefined,
  beginTime: '',
  endTime: '',
})

function handleSearch() {
  // loading 期间不重复触发，防止连续点击 / 回车重复请求
  if (userStore.loading) {
    return
  }
  filters.userName = searchField.value === 'userName' ? keyword.value : ''
  filters.phonenumber = searchField.value === 'phonenumber' ? keyword.value : ''
  userStore.search({ ...filters })
}

function handleReset() {
  if (userStore.loading) {
    return
  }
  keyword.value = ''
  searchField.value = 'userName'
  filters.userName = ''
  filters.phonenumber = ''
  filters.status = undefined
  filters.deptId = undefined
  filters.beginTime = ''
  filters.endTime = ''
  userStore.resetQuery()
}
</script>

<template>
  <Card radius="sm" :padding="16">
    <Form class="form-filter__bar" @submit="handleSearch">
      <!-- 关键字：搜索字段下拉 + 关键字输入组合 -->
      <FormField name="keyword">
        <Flex :gap="8">
          <!-- <Label class="whitespace-nowrap">关键字</Label> -->
          <Flex :gap="0">
            <Select
              :model-value="searchField"
              @update:model-value="value => (searchField = value as 'userName' | 'phonenumber')"
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


            <!-- 部门 -->
      <FormField name="deptId">
        <Flex :gap="8">
          <Label class="whitespace-nowrap">部门</Label>
          <div class="w-56">
            <DeptTreeSelect
              :model-value="filters.deptId"
              :options="userStore.deptOptions"
              placeholder="请选择部门"
              @update:model-value="value => (filters.deptId = value)"
            />
          </div>
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
        <Button size="lg" type="submit" color="primary" radius="md" :disabled="userStore.loading">
          <Loader2 v-if="userStore.loading" class="animate-spin" />
          <Search v-else />
          {{ userStore.loading ? '查询中...' : '查询' }}
        </Button>
        <Button size="lg" type="button" variant="outline" radius="md" :disabled="userStore.loading" @click="handleReset">
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
