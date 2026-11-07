<script setup lang="ts">
import { computed, ref } from 'vue'
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
import useSystemRoleStore from '@/store/system/role'
import CheckboxTree from './CheckboxTree.vue'

const roleStore = useSystemRoleStore()

const submitting = ref(false)
const deptTreeRef = ref<{ getCheckedKeys: () => { checked: number[]; halfChecked: number[] } }>()

/** 数据范围选项 */
const dataScopeOptions = [
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' },
]

const showDeptTree = computed(() => roleStore.dataScopeForm.dataScope === '2')

function handleDataScopeChange(value: unknown) {
  roleStore.dataScopeForm.dataScope = String(value) as '1' | '2' | '3' | '4' | '5'
  if (roleStore.dataScopeForm.dataScope !== '2') {
    roleStore.dataScopeForm.deptIds = []
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    const { checked, halfChecked } = deptTreeRef.value?.getCheckedKeys() ?? { checked: [], halfChecked: [] }
    await roleStore.submitDataScope(showDeptTree.value ? [...checked, ...halfChecked] : [])
    ElMessage.success('修改成功')
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="roleStore.dataScopeVisible">
    <DialogContent class="sm:max-w-[720px]">
      <DialogHeader>
        <DialogTitle>分配数据权限</DialogTitle>
        <DialogDescription>设置角色可以访问的数据范围</DialogDescription>
      </DialogHeader>

      <Flex v-if="roleStore.dataScopeLoading" align="center" justify="center" :gap="8" :padding-y="24">
        <Loader2 class="animate-spin" />
        <span class="text-sm text-muted-foreground">加载中...</span>
      </Flex>

      <template v-else>
        <div class="grid grid-cols-2 gap-4">
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">角色名称</Label>
            <Input :model-value="roleStore.dataScopeForm.roleName" disabled radius="md" />
          </Flex>
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">权限字符</Label>
            <Input :model-value="roleStore.dataScopeForm.roleKey" disabled radius="md" />
          </Flex>
          <Flex direction="column" :gap="4">
            <Label class="whitespace-nowrap">权限范围</Label>
            <Select
              :model-value="roleStore.dataScopeForm.dataScope"
              @update:model-value="handleDataScopeChange"
            >
              <SelectTrigger class="w-full" radius="md">
                <SelectValue placeholder="请选择权限范围" />
              </SelectTrigger>
              <SelectContent radius="md">
                <SelectItem v-for="item in dataScopeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </Flex>
        </div>

        <Flex v-if="showDeptTree" direction="column" :gap="4">
          <Label class="whitespace-nowrap">数据权限</Label>
          <CheckboxTree
            ref="deptTreeRef"
            :data="roleStore.dataScopeDeptOptions"
            :model-value="roleStore.dataScopeForm.deptIds ?? []"
            :parent-child-linked="roleStore.dataScopeForm.deptCheckStrictly ?? true"
            default-expand-all
            @update:model-value="value => (roleStore.dataScopeForm.deptIds = value)"
            @update:parentChildLinked="value => (roleStore.dataScopeForm.deptCheckStrictly = value)"
          />
        </Flex>
      </template>

      <DialogFooter class="gap-2">
        <Button variant="outline" radius="md" type="button" @click="roleStore.closeDataScope()">取消</Button>
        <Button
          color="primary"
          radius="md"
          type="button"
          :disabled="roleStore.dataScopeLoading || submitting"
          @click="handleSubmit"
        >
          <Loader2 v-if="submitting" class="animate-spin" />
          确定
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
