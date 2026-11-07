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
import useSystemRoleStore from '@/store/system/role'
import CheckboxTree from './CheckboxTree.vue'

const props = defineProps<{
  /** 表单场景：view 只读详情 / add 新增 / edit 修改 */
  scene: 'view' | 'add' | 'edit'
}>()

const roleStore = useSystemRoleStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '角色详情'
  }
  return isEdit.value ? '修改角色' : '添加角色'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看角色信息（只读）'
  }
  return isEdit.value ? '修改角色信息' : '填写角色信息'
})

const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  roleName: '',
  roleKey: '',
  roleSort: '',
})

const menuTreeRef = ref<{ getCheckedKeys: () => { checked: number[]; halfChecked: number[] } }>()

function validateForm(): boolean {
  errors.roleName = ''
  errors.roleKey = ''
  errors.roleSort = ''
  const form = roleStore.formData
  if (!form.roleName?.trim()) {
    errors.roleName = '角色名称不能为空'
  }
  if (!form.roleKey?.trim()) {
    errors.roleKey = '权限字符不能为空'
  }
  if (form.roleSort == null) {
    errors.roleSort = '角色顺序不能为空'
  }
  return !Object.values(errors).some(Boolean)
}

async function handleSubmit() {
  if (!editable.value || !validateForm()) {
    return
  }
  submitting.value = true
  try {
    const { checked, halfChecked } = menuTreeRef.value?.getCheckedKeys() ?? { checked: [], halfChecked: [] }
    const scene = props.scene
    await roleStore.submitForm([...checked, ...halfChecked])
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => roleStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="roleStore.formVisible">
    <DialogContent class="sm:max-w-[720px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="roleStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <!-- 角色名称 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              角色名称<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="roleStore.formData.roleName"
              placeholder="请输入角色名称"
              maxlength="30"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.roleName" class="text-xs text-destructive">{{ errors.roleName }}</p>
          </Flex>

          <!-- 权限字符 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              权限字符<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="roleStore.formData.roleKey"
              placeholder="请输入权限字符"
              maxlength="100"
              radius="md"
              :disabled="!editable"
            />
            <p class="text-xs text-muted-foreground">控制器中定义的权限字符，如 @PreAuthorize(@ss.hasRole('admin'))</p>
            <p v-if="errors.roleKey" class="text-xs text-destructive">{{ errors.roleKey }}</p>
          </Flex>

          <!-- 角色顺序 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              角色顺序<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              :model-value="roleStore.formData.roleSort"
              type="number"
              min="0"
              placeholder="请输入角色顺序"
              radius="md"
              :disabled="!editable"
              @update:model-value="value => (roleStore.formData.roleSort = Number(value) || 0)"
            />
            <p v-if="errors.roleSort" class="text-xs text-destructive">{{ errors.roleSort }}</p>
          </Flex>

          <!-- 状态 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">状态</Label>
            <Select
              :model-value="roleStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (roleStore.formData.status = typeof value === 'string' ? value as '0' | '1' : '0')"
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

          <!-- 菜单权限 -->
          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">菜单权限</Label>
            <CheckboxTree
              ref="menuTreeRef"
              :data="roleStore.menuOptions"
              :model-value="roleStore.formData.menuIds ?? []"
              :parent-child-linked="roleStore.formData.menuCheckStrictly ?? true"
              :disabled="!editable"
              @update:model-value="value => (roleStore.formData.menuIds = value)"
              @update:parentChildLinked="value => (roleStore.formData.menuCheckStrictly = value)"
            />
          </Flex>

          <!-- 备注 -->
          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">备注</Label>
            <Textarea v-model="roleStore.formData.remark" placeholder="请输入内容" :disabled="!editable" />
          </Flex>
        </div>
      </template>

      <DialogFooter class="gap-2">
        <Button
          v-if="isView"
          variant="outline"
          radius="md"
          type="button"
          @click="roleStore.closeForm()"
        >
          关闭
        </Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="roleStore.closeForm()">取消</Button>
          <Button
            color="primary"
            radius="md"
            type="button"
            :disabled="roleStore.formLoading || submitting"
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
