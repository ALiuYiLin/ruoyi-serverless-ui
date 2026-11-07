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
import useSystemConfigStore from '@/store/system/config'

const props = defineProps<{
  scene: 'view' | 'add' | 'edit'
}>()

const configStore = useSystemConfigStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '参数详情'
  }
  return isEdit.value ? '修改参数' : '添加参数'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看参数信息（只读）'
  }
  return isEdit.value ? '修改参数信息' : '填写参数信息'
})

const configTypeOptions = [
  { value: 'Y', label: '是' },
  { value: 'N', label: '否' },
]

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  configName: '',
  configKey: '',
  configValue: '',
})

function validateForm(): boolean {
  errors.configName = ''
  errors.configKey = ''
  errors.configValue = ''
  const form = configStore.formData
  if (!form.configName?.trim()) {
    errors.configName = '参数名称不能为空'
  }
  if (!form.configKey?.trim()) {
    errors.configKey = '参数键名不能为空'
  }
  if (!form.configValue?.trim()) {
    errors.configValue = '参数键值不能为空'
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
    await configStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => configStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="configStore.formVisible">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="configStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="flex flex-col gap-4">
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">参数名称<span v-if="editable" class="text-destructive">*</span></Label>
            <Input v-model="configStore.formData.configName" placeholder="请输入参数名称" radius="md" :disabled="!editable" />
            <p v-if="errors.configName" class="text-xs text-destructive">{{ errors.configName }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">参数键名<span v-if="editable" class="text-destructive">*</span></Label>
            <Input v-model="configStore.formData.configKey" placeholder="请输入参数键名" radius="md" :disabled="!editable" />
            <p v-if="errors.configKey" class="text-xs text-destructive">{{ errors.configKey }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">参数键值<span v-if="editable" class="text-destructive">*</span></Label>
            <Input v-model="configStore.formData.configValue" placeholder="请输入参数键值" radius="md" :disabled="!editable" />
            <p v-if="errors.configValue" class="text-xs text-destructive">{{ errors.configValue }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">系统内置</Label>
            <Select
              :model-value="configStore.formData.configType"
              :disabled="!editable"
              @update:model-value="value => (configStore.formData.configType = value as 'Y' | 'N')"
            >
              <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in configTypeOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">备注</Label>
            <Input v-model="configStore.formData.remark" placeholder="请输入备注" radius="md" :disabled="!editable" />
          </Flex>
        </div>
      </template>

      <DialogFooter class="gap-2">
        <Button v-if="isView" variant="outline" radius="md" type="button" @click="configStore.closeForm()">关闭</Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="configStore.closeForm()">取消</Button>
          <Button color="primary" radius="md" type="button" :disabled="configStore.formLoading || submitting" @click="handleSubmit">
            <Loader2 v-if="submitting" class="animate-spin" />
            确定
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
