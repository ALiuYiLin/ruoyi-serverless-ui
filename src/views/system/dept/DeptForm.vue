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
import DeptTreeSelect from '@/business/components/DeptTreeSelect/index.vue'
import useSystemDeptStore from '@/store/system/dept'

const props = defineProps<{
  /** 表单场景：view 只读详情 / add 新增 / edit 修改 */
  scene: 'view' | 'add' | 'edit'
}>()

const deptStore = useSystemDeptStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '部门详情'
  }
  return isEdit.value ? '修改部门' : '添加部门'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看部门信息（只读）'
  }
  return isEdit.value ? '修改部门信息' : '填写部门信息'
})

const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  parentId: '',
  deptName: '',
  orderNum: '',
  phone: '',
  email: '',
})

const phonePattern = /^1[3-9]\d{9}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateForm(): boolean {
  errors.parentId = ''
  errors.deptName = ''
  errors.orderNum = ''
  errors.phone = ''
  errors.email = ''
  const form = deptStore.formData
  if (form.parentId !== 0 && form.parentId == null) {
    errors.parentId = '上级部门不能为空'
  }
  if (!form.deptName?.trim()) {
    errors.deptName = '部门名称不能为空'
  }
  if (form.orderNum == null) {
    errors.orderNum = '显示排序不能为空'
  }
  if (form.phone && !phonePattern.test(form.phone)) {
    errors.phone = '请输入正确的手机号码'
  }
  if (form.email && !emailPattern.test(form.email)) {
    errors.email = '请输入正确的邮箱地址'
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
    await deptStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => deptStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="deptStore.formVisible">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="deptStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <!-- 上级部门（根部门不显示） -->
          <Flex v-if="deptStore.formData.parentId !== 0" direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">
              上级部门<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <DeptTreeSelect
              :model-value="deptStore.formData.parentId"
              :options="deptStore.deptOptions"
              placeholder="选择上级部门"
              :disabled="!editable"
              @update:model-value="value => (deptStore.formData.parentId = value)"
            />
            <p v-if="errors.parentId" class="text-xs text-destructive">{{ errors.parentId }}</p>
          </Flex>

          <!-- 部门名称 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              部门名称<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="deptStore.formData.deptName"
              placeholder="请输入部门名称"
              maxlength="30"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.deptName" class="text-xs text-destructive">{{ errors.deptName }}</p>
          </Flex>

          <!-- 显示排序 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              显示排序<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              :model-value="deptStore.formData.orderNum"
              type="number"
              min="0"
              placeholder="请输入显示排序"
              radius="md"
              :disabled="!editable"
              @update:model-value="value => (deptStore.formData.orderNum = Number(value) || 0)"
            />
            <p v-if="errors.orderNum" class="text-xs text-destructive">{{ errors.orderNum }}</p>
          </Flex>

          <!-- 负责人 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">负责人</Label>
            <Input
              v-model="deptStore.formData.leader"
              placeholder="请输入负责人"
              maxlength="20"
              radius="md"
              :disabled="!editable"
            />
          </Flex>

          <!-- 联系电话 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">联系电话</Label>
            <Input
              v-model="deptStore.formData.phone"
              placeholder="请输入联系电话"
              maxlength="11"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.phone" class="text-xs text-destructive">{{ errors.phone }}</p>
          </Flex>

          <!-- 邮箱 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">邮箱</Label>
            <Input
              v-model="deptStore.formData.email"
              placeholder="请输入邮箱"
              maxlength="50"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
          </Flex>

          <!-- 状态 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">部门状态</Label>
            <Select
              :model-value="deptStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (deptStore.formData.status = typeof value === 'string' ? value as '0' | '1' : '0')"
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
        </div>
      </template>

      <DialogFooter class="gap-2">
        <Button
          v-if="isView"
          variant="outline"
          radius="md"
          type="button"
          @click="deptStore.closeForm()"
        >
          关闭
        </Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="deptStore.closeForm()">取消</Button>
          <Button
            color="primary"
            radius="md"
            type="button"
            :disabled="deptStore.formLoading || submitting"
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
