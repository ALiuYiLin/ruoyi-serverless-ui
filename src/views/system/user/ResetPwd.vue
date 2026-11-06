<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2 } from '@lucide/vue'
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
import { Label } from '@/components/ui/label'
import useSystemUserStore from '@/store/system/user'

const userStore = useSystemUserStore()

const password = ref('')
const error = ref('')
const submitting = ref(false)

watch(() => userStore.resetPwdVisible, visible => {
  if (visible) {
    password.value = ''
    error.value = ''
  }
})

async function handleSubmit() {
  error.value = ''
  if (!password.value) {
    error.value = '新密码不能为空'
    return
  }
  if (password.value.length < 5 || password.value.length > 20) {
    error.value = '密码长度必须介于 5 和 20 之间'
    return
  }
  submitting.value = true
  try {
    const ok = await userStore.submitResetPwd(password.value)
    if (ok) {
      ElMessage.success('修改成功')
    }
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="userStore.resetPwdVisible">
    <DialogContent class="sm:max-w-[420px]">
      <DialogHeader>
        <DialogTitle>重置密码</DialogTitle>
        <DialogDescription>
          为用户「{{ userStore.resetPwdUser?.nickName || userStore.resetPwdUser?.userName }}」设置新密码
        </DialogDescription>
      </DialogHeader>

      <Flex direction="column" :gap="4">
        <Label class="whitespace-nowrap">新密码</Label>
        <Input
          v-model="password"
          type="password"
          placeholder="请输入新密码，长度 5-20 位"
          maxlength="20"
          radius="md"
        />
        <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
      </Flex>

      <DialogFooter class="gap-2">
        <Button variant="outline" radius="md" type="button" @click="userStore.closeResetPwd()">取消</Button>
        <Button color="primary" radius="md" type="button" :disabled="submitting" @click="handleSubmit">
          <Loader2 v-if="submitting" class="animate-spin" />
          确定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
