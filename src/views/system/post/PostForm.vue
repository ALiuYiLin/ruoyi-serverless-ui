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
import useSystemPostStore from '@/store/system/post'

const props = defineProps<{
  /** 表单场景：view 只读详情 / add 新增 / edit 修改 */
  scene: 'view' | 'add' | 'edit'
}>()

const postStore = useSystemPostStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '岗位详情'
  }
  return isEdit.value ? '修改岗位' : '添加岗位'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看岗位信息（只读）'
  }
  return isEdit.value ? '修改岗位信息' : '填写岗位信息'
})

const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  postName: '',
  postCode: '',
  postSort: '',
})

function validateForm(): boolean {
  errors.postName = ''
  errors.postCode = ''
  errors.postSort = ''
  const form = postStore.formData
  if (!form.postName?.trim()) {
    errors.postName = '岗位名称不能为空'
  }
  if (!form.postCode?.trim()) {
    errors.postCode = '岗位编码不能为空'
  }
  if (form.postSort == null) {
    errors.postSort = '岗位顺序不能为空'
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
    await postStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => postStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="postStore.formVisible">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="postStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <Flex direction="column" :gap="12">
          <!-- 岗位名称 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              岗位名称<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="postStore.formData.postName"
              placeholder="请输入岗位名称"
              maxlength="50"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.postName" class="text-xs text-destructive">{{ errors.postName }}</p>
          </Flex>

          <!-- 岗位编码 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              岗位编码<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="postStore.formData.postCode"
              placeholder="请输入岗位编码"
              maxlength="64"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.postCode" class="text-xs text-destructive">{{ errors.postCode }}</p>
          </Flex>

          <!-- 岗位顺序 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              岗位顺序<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              :model-value="postStore.formData.postSort"
              type="number"
              min="0"
              placeholder="请输入岗位顺序"
              radius="md"
              :disabled="!editable"
              @update:model-value="value => (postStore.formData.postSort = Number(value) || 0)"
            />
            <p v-if="errors.postSort" class="text-xs text-destructive">{{ errors.postSort }}</p>
          </Flex>

          <!-- 岗位状态 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">岗位状态</Label>
            <Select
              :model-value="postStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (postStore.formData.status = typeof value === 'string' ? value as '0' | '1' : '0')"
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

          <!-- 备注 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">备注</Label>
            <Textarea v-model="postStore.formData.remark" placeholder="请输入内容" :disabled="!editable" />
          </Flex>
        </Flex>
      </template>

      <DialogFooter class="gap-2">
        <Button
          v-if="isView"
          variant="outline"
          radius="md"
          type="button"
          @click="postStore.closeForm()"
        >
          关闭
        </Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="postStore.closeForm()">取消</Button>
          <Button
            color="primary"
            radius="md"
            type="button"
            :disabled="postStore.formLoading || submitting"
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
