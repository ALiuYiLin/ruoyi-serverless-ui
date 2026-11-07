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
import useSystemJobStore from '@/store/system/job'

const props = defineProps<{
  scene: 'view' | 'add' | 'edit'
}>()

const jobStore = useSystemJobStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '任务详情'
  }
  return isEdit.value ? '修改任务' : '添加任务'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看任务信息（只读）'
  }
  return isEdit.value ? '修改任务信息' : '填写任务信息'
})

const jobGroupOptions = [
  { value: 'DEFAULT', label: '默认' },
  { value: 'SYSTEM', label: '系统' },
]
const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '暂停' },
]
const misfireOptions = [
  { value: '1', label: '立即执行' },
  { value: '2', label: '执行一次' },
  { value: '3', label: '放弃执行' },
]
const concurrentOptions = [
  { value: '0', label: '允许' },
  { value: '1', label: '禁止' },
]

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  jobName: '',
  invokeTarget: '',
  cronExpression: '',
})

function validateForm(): boolean {
  errors.jobName = ''
  errors.invokeTarget = ''
  errors.cronExpression = ''
  const form = jobStore.formData
  if (!form.jobName?.trim()) {
    errors.jobName = '任务名称不能为空'
  }
  if (!form.invokeTarget?.trim()) {
    errors.invokeTarget = '调用目标字符串不能为空'
  }
  if (!form.cronExpression?.trim()) {
    errors.cronExpression = 'cron 执行表达式不能为空'
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
    await jobStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => jobStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="jobStore.formVisible">
    <DialogContent class="sm:max-w-[640px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="jobStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">任务名称<span v-if="editable" class="text-destructive">*</span></Label>
            <Input v-model="jobStore.formData.jobName" placeholder="请输入任务名称" maxlength="64" radius="md" :disabled="!editable" />
            <p v-if="errors.jobName" class="text-xs text-destructive">{{ errors.jobName }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">任务分组</Label>
            <Select
              :model-value="jobStore.formData.jobGroup"
              :disabled="!editable"
              @update:model-value="value => (jobStore.formData.jobGroup = value as string)"
            >
              <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in jobGroupOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">调用目标字符串<span v-if="editable" class="text-destructive">*</span></Label>
            <Input v-model="jobStore.formData.invokeTarget" placeholder="例如：ryTask.ryParams('ry')" maxlength="500" radius="md" :disabled="!editable" />
            <p class="text-xs text-muted-foreground">bean 调用示例：ryTask.ryNoParams、ryTask.ryParams('ry')</p>
            <p v-if="errors.invokeTarget" class="text-xs text-destructive">{{ errors.invokeTarget }}</p>
          </Flex>

          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">cron 执行表达式<span v-if="editable" class="text-destructive">*</span></Label>
            <Input v-model="jobStore.formData.cronExpression" placeholder="例如：0/10 * * * * ?" maxlength="255" radius="md" :disabled="!editable" />
            <p v-if="errors.cronExpression" class="text-xs text-destructive">{{ errors.cronExpression }}</p>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">执行策略</Label>
            <Select
              :model-value="jobStore.formData.misfirePolicy"
              :disabled="!editable"
              @update:model-value="value => (jobStore.formData.misfirePolicy = value as '1' | '2' | '3')"
            >
              <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in misfireOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">是否并发</Label>
            <Select
              :model-value="jobStore.formData.concurrent"
              :disabled="!editable"
              @update:model-value="value => (jobStore.formData.concurrent = value as '0' | '1')"
            >
              <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in concurrentOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">状态</Label>
            <Select
              :model-value="jobStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (jobStore.formData.status = value as '0' | '1')"
            >
              <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">备注</Label>
            <Textarea v-model="jobStore.formData.remark" placeholder="请输入内容" :disabled="!editable" />
          </Flex>
        </div>
      </template>

      <DialogFooter class="gap-2">
        <Button v-if="isView" variant="outline" radius="md" type="button" @click="jobStore.closeForm()">关闭</Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="jobStore.closeForm()">取消</Button>
          <Button color="primary" radius="md" type="button" :disabled="jobStore.formLoading || submitting" @click="handleSubmit">
            <Loader2 v-if="submitting" class="animate-spin" />
            确定
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
