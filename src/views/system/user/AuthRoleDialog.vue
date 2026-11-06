<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useSystemUserStore from '@/store/system/user'

const userStore = useSystemUserStore()
const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    const ok = await userStore.submitAuthRole()
    if (ok) {
      ElMessage.success('授权成功')
    }
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="userStore.authRoleVisible">
    <DialogContent class="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>分配角色</DialogTitle>
        <DialogDescription>
          为「{{ userStore.authRoleUser.nickName || userStore.authRoleUser.userName }}」分配角色
        </DialogDescription>
      </DialogHeader>

      <Flex v-if="userStore.authRoleLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">用户昵称</Label>
            <Input :model-value="userStore.authRoleUser.nickName" disabled radius="md" />
          </Flex>
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">登录账号</Label>
            <Input :model-value="userStore.authRoleUser.userName" disabled radius="md" />
          </Flex>
        </div>

        <Flex direction="column" :gap="4">
          <Label class="whitespace-nowrap">角色</Label>
          <Flex wrap :gap="8">
            <label
              v-for="role in userStore.authRoleRoles"
              :key="role.roleId"
              class="flex items-center gap-2 text-sm"
            >
              <Checkbox
                :model-value="role.roleId != null && userStore.authRoleSelectedIds.includes(role.roleId)"
                :disabled="role.status === '1'"
                @update:model-value="value => userStore.toggleAuthRole(role.roleId!, value)"
              />
              <span>{{ role.roleName }}</span>
            </label>
            <span v-if="!userStore.authRoleRoles.length" class="text-sm text-muted-foreground">暂无角色</span>
          </Flex>
        </Flex>

        <DialogFooter class="gap-2">
          <Button variant="outline" radius="md" type="button" @click="userStore.closeAuthRole()">取消</Button>
          <Button color="primary" radius="md" type="button" :disabled="submitting" @click="handleSubmit">
            <Loader2 v-if="submitting" class="animate-spin" />
            确定
          </Button>
        </DialogFooter>
      </template>
    </DialogContent>
  </Dialog>
</template>
