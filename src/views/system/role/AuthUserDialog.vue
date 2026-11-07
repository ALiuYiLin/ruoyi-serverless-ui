<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Loader2, Plus, Search, X } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authUserSelectAll, unallocatedUserList } from '@/api/system/role'
import type { AuthUserQueryParams, SysUser } from '@/types'
import useSystemRoleStore from '@/store/system/role'

const roleStore = useSystemRoleStore()

const searchField = ref<'userName' | 'phonenumber'>('userName')
const keyword = ref('')
const loading = ref(false)
const submitting = ref(false)
const results = ref<SysUser[]>([])
const selectedUsers = ref<SysUser[]>([])

const roleId = computed(() => roleStore.authUserRole?.roleId)
const searchFieldOptions = [
  { value: 'userName', label: '用户名称' },
  { value: 'phonenumber', label: '手机号码' },
]
const keywordPlaceholder = computed(() =>
  searchField.value === 'userName' ? '请输入用户名称' : '请输入手机号码',
)

watch(() => roleStore.authUserVisible, visible => {
  if (visible) {
    keyword.value = ''
    searchField.value = 'userName'
    results.value = []
    selectedUsers.value = []
  }
})

function isSelected(user: SysUser) {
  return selectedUsers.value.some(item => item.userId === user.userId)
}

async function handleSearch() {
  if (!roleId.value) {
    return
  }
  loading.value = true
  try {
    const query: AuthUserQueryParams = {
      pageNum: 1,
      pageSize: 10,
      roleId: roleId.value,
    }
    if (searchField.value === 'userName') {
      query.userName = keyword.value || undefined
    } else {
      query.phonenumber = keyword.value || undefined
    }
    const res = await unallocatedUserList(query)
    results.value = res.rows
  } finally {
    loading.value = false
  }
}

function addUser(user: SysUser) {
  if (!user.userId || isSelected(user)) {
    return
  }
  selectedUsers.value = [...selectedUsers.value, user]
}

function removeUser(userId?: number) {
  selectedUsers.value = selectedUsers.value.filter(item => item.userId !== userId)
}

async function handleSubmit() {
  if (!roleId.value) {
    return
  }
  if (!selectedUsers.value.length) {
    ElMessage.warning('请选择要分配的用户')
    return
  }
  submitting.value = true
  try {
    await authUserSelectAll({
      roleId: roleId.value,
      userIds: selectedUsers.value.map(user => user.userId).filter(Boolean).join(','),
    })
    ElMessage.success('授权成功')
    roleStore.closeAuthUser()
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="roleStore.authUserVisible">
    <DialogContent class="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>分配用户</DialogTitle>
        <DialogDescription>
          为「{{ roleStore.authUserRole?.roleName }}」添加用户
        </DialogDescription>
      </DialogHeader>

      <Flex direction="column" :gap="12">
        <!-- 搜索 -->
        <Flex align="center" :gap="8">
          <Select
            :model-value="searchField"
            @update:model-value="value => (searchField = value as 'userName' | 'phonenumber')"
          >
            <SelectTrigger class="w-32 rounded-r-none" radius="md">
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
            class="-ml-px flex-1 rounded-l-none"
            radius="md"
            @keyup.enter="handleSearch"
          />
          <Button variant="outline" radius="md" :disabled="loading" @click="handleSearch">
            <Loader2 v-if="loading" class="animate-spin" />
            <Search v-else />
            搜索
          </Button>
        </Flex>

        <!-- 搜索结果 -->
        <div class="max-h-60 overflow-y-auto rounded-md border border-border">
          <div
            v-for="user in results"
            :key="user.userId"
            class="flex items-center justify-between gap-2 border-b border-border px-3 py-2 last:border-b-0"
          >
            <div class="min-w-0 flex flex-col">
              <span class="truncate text-sm font-medium">{{ user.userName }}</span>
              <span class="truncate text-xs text-muted-foreground">
                {{ user.nickName }} · {{ user.phonenumber }}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              radius="md"
              :disabled="isSelected(user)"
              @click="addUser(user)"
            >
              <Plus />
              {{ isSelected(user) ? '已添加' : '添加' }}
            </Button>
          </div>
          <div v-if="!results.length" class="px-3 py-6 text-center text-sm text-muted-foreground">
            {{ loading ? '搜索中...' : '暂无未授权用户' }}
          </div>
        </div>

        <!-- 已选用户 -->
        <div class="min-h-8">
          <div v-if="selectedUsers.length" class="flex flex-wrap gap-2">
            <span
              v-for="user in selectedUsers"
              :key="user.userId"
              class="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {{ user.userName }}
              <button type="button" class="text-muted-foreground hover:text-foreground" @click="removeUser(user.userId)">
                <X class="size-3" />
              </button>
            </span>
          </div>
          <span v-else class="text-xs text-muted-foreground">暂未选择用户</span>
        </div>
      </Flex>

      <DialogFooter class="gap-2">
        <Button variant="outline" radius="md" type="button" @click="roleStore.closeAuthUser()">取消</Button>
        <Button color="primary" radius="md" type="button" :disabled="submitting" @click="handleSubmit">
          <Loader2 v-if="submitting" class="animate-spin" />
          提交
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
