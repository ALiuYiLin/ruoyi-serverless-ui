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
import RichTextEditor from '@/business/components/RichTextEditor/index.vue'
import useSystemNoticeStore from '@/store/system/notice'

const props = defineProps<{
  scene: 'view' | 'add' | 'edit'
}>()

const noticeStore = useSystemNoticeStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '公告详情'
  }
  return isEdit.value ? '修改公告' : '添加公告'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看公告内容（只读）'
  }
  return isEdit.value ? '修改公告内容' : '填写公告内容'
})

const noticeTypeOptions = [
  { value: '1', label: '通知' },
  { value: '2', label: '公告' },
]
const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  noticeTitle: '',
  noticeType: '',
})

function validateForm(): boolean {
  errors.noticeTitle = ''
  errors.noticeType = ''
  if (!noticeStore.formData.noticeTitle?.trim()) {
    errors.noticeTitle = '公告标题不能为空'
  }
  if (!noticeStore.formData.noticeType) {
    errors.noticeType = '公告类型不能为空'
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
    await noticeStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => noticeStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="noticeStore.formVisible">
    <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-[800px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="noticeStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">公告标题<span v-if="editable" class="text-destructive">*</span></Label>
            <Input
              v-model="noticeStore.formData.noticeTitle"
              placeholder="请输入公告标题"
              maxlength="50"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.noticeTitle" class="text-xs text-destructive">{{ errors.noticeTitle }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">公告类型<span v-if="editable" class="text-destructive">*</span></Label>
            <Select
              :model-value="noticeStore.formData.noticeType"
              :disabled="!editable"
              @update:model-value="value => (noticeStore.formData.noticeType = value as '1' | '2')"
            >
              <SelectTrigger class="w-full" radius="md"><SelectValue placeholder="请选择" /></SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in noticeTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.noticeType" class="text-xs text-destructive">{{ errors.noticeType }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">状态</Label>
            <Select
              :model-value="noticeStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (noticeStore.formData.status = value as '0' | '1')"
            >
              <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">公告内容</Label>
            <RichTextEditor
              v-model="noticeStore.formData.noticeContent"
              :read-only="!editable"
              placeholder="请输入公告内容"
              :min-height="240"
            />
          </Flex>
        </div>
      </template>

      <DialogFooter class="gap-2">
        <Button v-if="isView" variant="outline" radius="md" type="button" @click="noticeStore.closeForm()">关闭</Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="noticeStore.closeForm()">取消</Button>
          <Button color="primary" radius="md" type="button" :disabled="noticeStore.formLoading || submitting" @click="handleSubmit">
            <Loader2 v-if="submitting" class="animate-spin" />
            确定
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
