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
import useSystemDictTypeStore from '@/store/system/dict'

const props = defineProps<{
  scene: 'view' | 'add' | 'edit'
}>()

const dictStore = useSystemDictTypeStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '字典详情'
  }
  return isEdit.value ? '修改字典' : '添加字典'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看字典信息（只读）'
  }
  return isEdit.value ? '修改字典信息' : '填写字典信息'
})

const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  dictName: '',
  dictType: '',
})

function validateForm(): boolean {
  errors.dictName = ''
  errors.dictType = ''
  if (!dictStore.formData.dictName?.trim()) {
    errors.dictName = '字典名称不能为空'
  }
  if (!dictStore.formData.dictType?.trim()) {
    errors.dictType = '字典类型不能为空'
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
    await dictStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => dictStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="dictStore.formVisible">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="dictStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="flex flex-col gap-4">
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              字典名称<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="dictStore.formData.dictName"
              placeholder="请输入字典名称"
              maxlength="100"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.dictName" class="text-xs text-destructive">{{ errors.dictName }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              字典类型<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="dictStore.formData.dictType"
              placeholder="请输入字典类型"
              maxlength="100"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.dictType" class="text-xs text-destructive">{{ errors.dictType }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">状态</Label>
            <Select
              :model-value="dictStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (dictStore.formData.status = value as '0' | '1')"
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

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">备注</Label>
            <Textarea v-model="dictStore.formData.remark" placeholder="请输入内容" :disabled="!editable" />
          </Flex>
        </div>
      </template>

      <DialogFooter class="gap-2">
        <Button v-if="isView" variant="outline" radius="md" type="button" @click="dictStore.closeForm()">关闭</Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="dictStore.closeForm()">取消</Button>
          <Button color="primary" radius="md" type="button" :disabled="dictStore.formLoading || submitting" @click="handleSubmit">
            <Loader2 v-if="submitting" class="animate-spin" />
            确定
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
