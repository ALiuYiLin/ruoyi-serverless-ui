<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import useSystemUserStore from '@/store/system/user'
import DeptTreeSelect from '@/business/components/DeptTreeSelect/index.vue'
import MultiSelect from './MultiSelect.vue'

const props = defineProps<{
  /** 表单场景：view 只读详情 / add 新增 / edit 修改 */
  scene: 'view' | 'add' | 'edit'
}>()

const userStore = useSystemUserStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
/** 是否可编辑：view 场景下复用同一套表单字段，但全部只读 */
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '用户详情'
  }
  return isEdit.value ? '修改用户' : '新增用户'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看用户基本信息（只读）'
  }
  return isEdit.value ? '修改用户基本信息' : '填写用户基本信息'
})

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  nickName: '',
  userName: '',
  password: '',
  email: '',
  phonenumber: '',
})

/** 性别/状态选项 */
const sexOptions = [
  { value: '0', label: '男' },
  { value: '1', label: '女' },
  { value: '2', label: '未知' },
]
const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]

/** 岗位/角色下拉选项 */
const postSelectOptions = computed(() =>
  userStore.postOptions
    .filter(item => item.postId != null)
    .map(item => ({
      value: item.postId as number,
      label: item.postName ?? '',
      disabled: item.status === '1',
    }))
)

const roleSelectOptions = computed(() =>
  userStore.roleOptions
    .filter(item => item.roleId != null)
    .map(item => ({
      value: item.roleId as number,
      label: item.roleName ?? '',
      disabled: item.status === '1',
    }))
)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^1[3-9]\d{9}$/

function validateForm(): boolean {
  errors.nickName = ''
  errors.userName = ''
  errors.password = ''
  errors.email = ''
  errors.phonenumber = ''

  const form = userStore.formData
  if (!form.nickName?.trim()) {
    errors.nickName = '用户昵称不能为空'
  }
  if (!isEdit.value) {
    if (!form.userName?.trim()) {
      errors.userName = '用户名称不能为空'
    } else if (form.userName.length < 2 || form.userName.length > 20) {
      errors.userName = '用户名称长度必须介于 2 和 20 之间'
    }
    if (!form.password) {
      errors.password = '用户密码不能为空'
    } else if (form.password.length < 5 || form.password.length > 20) {
      errors.password = '用户密码长度必须介于 5 和 20 之间'
    }
  }
  if (form.email && !emailPattern.test(form.email)) {
    errors.email = '请输入正确的邮箱地址'
  }
  if (form.phonenumber && !phonePattern.test(form.phonenumber)) {
    errors.phonenumber = '请输入正确的手机号码'
  }
  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (!editable.value || !validateForm()) {
    return
  }
  submitting.value = true
  try {
    const scene = props.scene
    await userStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

/** 打开表单时清空校验信息 */
watch(() => userStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="userStore.formVisible">
    <DialogContent class="sm:max-w-[640px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="userStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <!-- 用户昵称 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              用户昵称<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="userStore.formData.nickName"
              placeholder="请输入用户昵称"
              maxlength="30"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.nickName" class="text-xs text-destructive">{{ errors.nickName }}</p>
          </Flex>

          <!-- 归属部门 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">归属部门</Label>
            <DeptTreeSelect
              :model-value="userStore.formData.deptId"
              :options="userStore.deptOptions"
              placeholder="请选择归属部门"
              :disabled="!editable"
              @update:model-value="value => (userStore.formData.deptId = value)"
            />
          </Flex>

          <!-- 用户名称（新增可填，修改/查看只读） -->
          <Flex v-if="!isEdit" direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              用户名称<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="userStore.formData.userName"
              placeholder="请输入用户名称"
              maxlength="30"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.userName" class="text-xs text-destructive">{{ errors.userName }}</p>
          </Flex>

          <!-- 用户密码（仅新增） -->
          <Flex v-if="scene === 'add'" direction="column" :gap="4">
            <Label class="whitespace-nowrap">用户密码<span class="text-destructive">*</span></Label>
            <Input v-model="userStore.formData.password" type="password" placeholder="请输入用户密码" maxlength="20" radius="md" />
            <p v-if="errors.password" class="text-xs text-destructive">{{ errors.password }}</p>
          </Flex>

          <!-- 手机号码 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">手机号码</Label>
            <Input
              v-model="userStore.formData.phonenumber"
              placeholder="请输入手机号码"
              maxlength="11"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.phonenumber" class="text-xs text-destructive">{{ errors.phonenumber }}</p>
          </Flex>

          <!-- 邮箱 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">邮箱</Label>
            <Input
              v-model="userStore.formData.email"
              placeholder="请输入邮箱"
              maxlength="50"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </Flex>

          <!-- 性别 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">用户性别</Label>
            <Select
              :model-value="userStore.formData.sex"
              :disabled="!editable"
              @update:model-value="value => (userStore.formData.sex = typeof value === 'string' ? value as '0' | '1' | '2' : '2')"
            >
              <SelectTrigger class="w-full" radius="md">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in sexOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <!-- 状态 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">状态</Label>
            <Select
              :model-value="userStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (userStore.formData.status = typeof value === 'string' ? value as '0' | '1' : '0')"
            >
              <SelectTrigger class="w-full" radius="md">
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <!-- 岗位 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">岗位</Label>
            <MultiSelect
              :model-value="userStore.formData.postIds ?? []"
              :options="postSelectOptions"
              placeholder="请选择岗位"
              :disabled="!editable"
              @update:model-value="value => (userStore.formData.postIds = value)"
            />
          </Flex>

          <!-- 角色 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">角色</Label>
            <MultiSelect
              :model-value="userStore.formData.roleIds ?? []"
              :options="roleSelectOptions"
              placeholder="请选择角色"
              :disabled="!editable"
              @update:model-value="value => (userStore.formData.roleIds = value)"
            />
          </Flex>

          <!-- 备注 -->
          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">备注</Label>
            <Textarea v-model="userStore.formData.remark" placeholder="请输入内容" :disabled="!editable" />
          </Flex>
        </div>
      </template>

      <DialogFooter class="gap-2">
        <Button
          v-if="isView"
          variant="outline"
          radius="md"
          type="button"
          @click="userStore.closeForm()"
        >
          关闭
        </Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="userStore.closeForm()">取消</Button>
          <Button
            color="primary"
            radius="md"
            type="button"
            :disabled="userStore.formLoading || submitting"
            @click="handleSubmit"
          >
            <Loader2 v-if="submitting" class="animate-spin" />
            确定
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
