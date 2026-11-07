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
import IconPicker from '@/business/components/IconPicker/index.vue'
import useSystemMenuStore from '@/store/system/menu'

const props = defineProps<{
  scene: 'view' | 'add' | 'edit'
}>()

const menuStore = useSystemMenuStore()

const isView = computed(() => props.scene === 'view')
const isEdit = computed(() => props.scene === 'edit')
const editable = computed(() => props.scene !== 'view')

const formTitle = computed(() => {
  if (isView.value) {
    return '菜单详情'
  }
  return isEdit.value ? '修改菜单' : '添加菜单'
})
const formDescription = computed(() => {
  if (isView.value) {
    return '查看菜单信息（只读）'
  }
  return isEdit.value ? '修改菜单信息' : '填写菜单信息'
})

const menuTypeOptions = [
  { value: 'M', label: '目录' },
  { value: 'C', label: '菜单' },
  { value: 'F', label: '按钮' },
]
const yesNoOptions = [
  { value: '0', label: '是' },
  { value: '1', label: '否' },
]
const cacheOptions = [
  { value: '0', label: '缓存' },
  { value: '1', label: '不缓存' },
]
const showHideOptions = [
  { value: '0', label: '显示' },
  { value: '1', label: '隐藏' },
]
const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]

const isButton = computed(() => menuStore.formData.menuType === 'F')
const isDirectoryOrMenu = computed(() => menuStore.formData.menuType !== 'F')
const isMenu = computed(() => menuStore.formData.menuType === 'C')

const submitting = ref(false)
const errors = reactive<Record<string, string>>({
  menuName: '',
  orderNum: '',
  path: '',
})

function validateForm(): boolean {
  errors.menuName = ''
  errors.orderNum = ''
  errors.path = ''
  const form = menuStore.formData
  if (!form.menuName?.trim()) {
    errors.menuName = '菜单名称不能为空'
  }
  if (form.orderNum == null) {
    errors.orderNum = '菜单顺序不能为空'
  }
  if (!isButton.value && !form.path?.trim()) {
    errors.path = '路由地址不能为空'
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
    await menuStore.submitForm()
    ElMessage.success(scene === 'edit' ? '修改成功' : '新增成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

watch(() => menuStore.formVisible, visible => {
  if (visible) {
    Object.keys(errors).forEach(key => (errors[key] = ''))
  }
})
</script>

<template>
  <Dialog v-model:open="menuStore.formVisible">
    <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-[720px]">
      <DialogHeader>
        <DialogTitle>{{ formTitle }}</DialogTitle>
        <DialogDescription>{{ formDescription }}</DialogDescription>
      </DialogHeader>

      <Flex v-if="menuStore.formLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <!-- 上级菜单 -->
          <Flex direction="column" :gap="4" class="col-span-2">
            <Label class="whitespace-nowrap">上级菜单</Label>
            <DeptTreeSelect
              :model-value="menuStore.formData.parentId"
              :options="menuStore.menuOptions"
              placeholder="选择上级菜单"
              :disabled="!editable"
              @update:model-value="value => (menuStore.formData.parentId = value)"
            />
          </Flex>

          <!-- 菜单类型 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">菜单类型</Label>
            <Select
              :model-value="menuStore.formData.menuType"
              :disabled="!editable"
              @update:model-value="value => (menuStore.formData.menuType = value as 'M' | 'C' | 'F')"
            >
              <SelectTrigger class="w-full" radius="md">
                <SelectValue placeholder="请选择类型" />
              </SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in menuTypeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Flex>

          <!-- 菜单图标 -->
          <Flex v-if="!isButton" direction="column" :gap="4">
            <Label class="whitespace-nowrap">菜单图标</Label>
            <IconPicker
              :model-value="menuStore.formData.icon"
              :disabled="!editable"
              @update:model-value="value => (menuStore.formData.icon = value)"
            />
          </Flex>

          <!-- 菜单名称 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              菜单名称<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              v-model="menuStore.formData.menuName"
              placeholder="请输入菜单名称"
              maxlength="50"
              radius="md"
              :disabled="!editable"
            />
            <p v-if="errors.menuName" class="text-xs text-destructive">{{ errors.menuName }}</p>
          </Flex>

          <!-- 显示排序 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">
              显示排序<span v-if="editable" class="text-destructive">*</span>
            </Label>
            <Input
              :model-value="menuStore.formData.orderNum"
              type="number"
              min="0"
              placeholder="请输入显示排序"
              radius="md"
              :disabled="!editable"
              @update:model-value="value => (menuStore.formData.orderNum = Number(value) || 0)"
            />
            <p v-if="errors.orderNum" class="text-xs text-destructive">{{ errors.orderNum }}</p>
          </Flex>

          <template v-if="isDirectoryOrMenu">
            <!-- 路由名称 -->
            <Flex direction="column" :gap="4">
              <Label class="whitespace-nowrap">路由名称</Label>
              <Input v-model="menuStore.formData.routeName" placeholder="请输入路由名称" radius="md" :disabled="!editable" />
            </Flex>

            <!-- 是否外链 -->
            <Flex direction="column" :gap="4">
              <Label class="whitespace-nowrap">是否外链</Label>
              <Select
                :model-value="menuStore.formData.isFrame"
                :disabled="!editable"
                @update:model-value="value => (menuStore.formData.isFrame = value as '0' | '1')"
              >
                <SelectTrigger class="w-full" radius="md">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent radius="md">
                  <SelectItem v-for="item in yesNoOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Flex>

            <!-- 路由地址 -->
            <Flex direction="column" :gap="4">
              <Label class="whitespace-nowrap">
                路由地址<span v-if="editable" class="text-destructive">*</span>
              </Label>
              <Input v-model="menuStore.formData.path" placeholder="请输入路由地址" radius="md" :disabled="!editable" />
              <p v-if="errors.path" class="text-xs text-destructive">{{ errors.path }}</p>
            </Flex>

            <!-- 组件路径 -->
            <Flex v-if="isMenu" direction="column" :gap="4">
              <Label class="whitespace-nowrap">组件路径</Label>
              <Input v-model="menuStore.formData.component" placeholder="请输入组件路径" radius="md" :disabled="!editable" />
            </Flex>

            <!-- 路由参数 -->
            <Flex v-if="isMenu" direction="column" :gap="4">
              <Label class="whitespace-nowrap">路由参数</Label>
              <Input v-model="menuStore.formData.query" placeholder="请输入路由参数" radius="md" :disabled="!editable" />
            </Flex>

            <!-- 是否缓存 -->
            <Flex v-if="isMenu" direction="column" :gap="4">
              <Label class="whitespace-nowrap">是否缓存</Label>
              <Select
                :model-value="menuStore.formData.isCache"
                :disabled="!editable"
                @update:model-value="value => (menuStore.formData.isCache = value as '0' | '1')"
              >
                <SelectTrigger class="w-full" radius="md">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent radius="md">
                  <SelectItem v-for="item in cacheOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Flex>

            <!-- 显示状态 -->
            <Flex direction="column" :gap="4">
              <Label class="whitespace-nowrap">显示状态</Label>
              <Select
                :model-value="menuStore.formData.visible"
                :disabled="!editable"
                @update:model-value="value => (menuStore.formData.visible = value as '0' | '1')"
              >
                <SelectTrigger class="w-full" radius="md">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent radius="md">
                  <SelectItem v-for="item in showHideOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Flex>
          </template>

          <!-- 权限字符 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">权限字符</Label>
            <Input v-model="menuStore.formData.perms" placeholder="请输入权限字符" radius="md" :disabled="!editable" />
          </Flex>

          <!-- 菜单状态 -->
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">菜单状态</Label>
            <Select
              :model-value="menuStore.formData.status"
              :disabled="!editable"
              @update:model-value="value => (menuStore.formData.status = value as '0' | '1')"
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
        <Button v-if="isView" variant="outline" radius="md" type="button" @click="menuStore.closeForm()">关闭</Button>
        <template v-else>
          <Button variant="outline" radius="md" type="button" @click="menuStore.closeForm()">取消</Button>
          <Button color="primary" radius="md" type="button" :disabled="menuStore.formLoading || submitting" @click="handleSubmit">
            <Loader2 v-if="submitting" class="animate-spin" />
            确定
          </Button>
        </template>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
