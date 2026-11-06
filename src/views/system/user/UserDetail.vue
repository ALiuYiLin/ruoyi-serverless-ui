<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useSystemUserStore from '@/store/system/user'

const userStore = useSystemUserStore()

interface InfoItem {
  label: string
  value?: string | number
}

const sexLabel = computed(() => {
  switch (userStore.detailUser.sex) {
    case '0':
      return '男'
    case '1':
      return '女'
    case '2':
      return '未知'
    default:
      return '-'
  }
})

const statusLabel = computed(() => {
  if (userStore.detailUser.status === '0') {
    return '正常'
  }
  if (userStore.detailUser.status === '1') {
    return '停用'
  }
  return '-'
})

const detailItems = computed<InfoItem[]>(() => [
  { label: '用户名称', value: userStore.detailUser.nickName },
  { label: '登录账号', value: userStore.detailUser.userName },
  { label: '归属部门', value: userStore.detailUser.dept?.deptName },
  { label: '手机号码', value: userStore.detailUser.phonenumber },
  { label: '邮箱', value: userStore.detailUser.email },
  { label: '用户性别', value: sexLabel.value },
  { label: '用户状态', value: statusLabel.value },
  { label: '岗位', value: userStore.detailPostNames.join('、') || '无岗位' },
  { label: '角色', value: userStore.detailRoleNames.join('、') || '无角色' },
  { label: '创建者', value: userStore.detailUser.createBy },
  { label: '创建时间', value: userStore.detailUser.createTime },
  { label: '更新者', value: userStore.detailUser.updateBy },
  { label: '更新时间', value: userStore.detailUser.updateTime },
  { label: '最后登录IP', value: userStore.detailUser.loginIp },
  { label: '最后登录时间', value: userStore.detailUser.loginDate },
  { label: '备注', value: userStore.detailUser.remark },
])
</script>

<template>
  <Dialog v-model:open="userStore.detailVisible">
    <DialogContent class="sm:max-w-[640px]">
      <DialogHeader>
        <DialogTitle>用户信息详情</DialogTitle>
        <DialogDescription>只读查看用户基本信息与账号信息</DialogDescription>
      </DialogHeader>

      <Flex v-if="userStore.detailLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <div v-else class="grid grid-cols-2 gap-x-6 gap-y-4">
        <Flex
          v-for="item in detailItems"
          :key="item.label"
          direction="column"
          :gap="2"
          :class="{ 'col-span-2': item.label === '备注' }"
        >
          <span class="text-xs text-muted-foreground">{{ item.label }}</span>
          <span class="text-sm break-all">{{ item.value ?? '-' }}</span>
        </Flex>
      </div>
    </DialogContent>
  </Dialog>
</template>
