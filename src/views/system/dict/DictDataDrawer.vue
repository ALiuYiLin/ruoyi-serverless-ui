<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, Download, Loader2, Pencil, Plus, Trash2 } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { download } from '@/utils/request'
import { addData, delData, getData, listData, updateData } from '@/api/system/dict/data'
import type { DictDataQueryParams, SysDictData } from '@/types'
import useSystemDictTypeStore from '@/store/system/dict'

const dictStore = useSystemDictTypeStore()

const MIN_LOADING_MS = 300
const open = computed({
  get: () => dictStore.dataDrawerVisible,
  set: value => {
    if (!value) {
      dictStore.closeDataDrawer()
    }
  },
})

const queryParams = reactive<DictDataQueryParams>({
  pageNum: 1,
  pageSize: 10,
  dictType: undefined,
  dictLabel: undefined,
  status: undefined,
})
const dataList = ref<SysDictData[]>([])
const total = ref(0)
const loading = ref(false)
const selectedIds = ref<number[]>([])

watch(() => dictStore.dataDrawerVisible, visible => {
  if (visible) {
    queryParams.dictType = dictStore.dataDrawerType?.dictType
    queryParams.pageNum = 1
    queryParams.dictLabel = undefined
    queryParams.status = undefined
    selectedIds.value = []
    getDataList()
  }
})

async function getDataList() {
  const startedAt = Date.now()
  loading.value = true
  try {
    const res = await listData(queryParams)
    dataList.value = res.rows
    total.value = res.total
  } finally {
    const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining))
    }
    loading.value = false
  }
}

const currentPage = computed({
  get: () => queryParams.pageNum ?? 1,
  set: (value: number) => {
    queryParams.pageNum = value
    getDataList()
  },
})

const selectedCount = computed(() => selectedIds.value.length)
const rowId = (row: SysDictData) => row.dictCode ?? 0
const currentPageIds = computed(() => dataList.value.map(row => rowId(row)))
const allPageSelected = computed(
  () => currentPageIds.value.length > 0 && currentPageIds.value.every(id => selectedIds.value.includes(id))
)
const somePageSelected = computed(() => currentPageIds.value.some(id => selectedIds.value.includes(id)))
const selectAllState = computed<boolean | 'indeterminate'>(() =>
  allPageSelected.value ? true : somePageSelected.value ? 'indeterminate' : false
)

function toggleAll(value: boolean | 'indeterminate') {
  if (value === true) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...currentPageIds.value]))
  } else {
    selectedIds.value = selectedIds.value.filter(id => !currentPageIds.value.includes(id))
  }
}

function toggleRow(id: number, value: boolean | 'indeterminate') {
  if (value === true) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter(item => item !== id)
  }
}

function handleSearch() {
  queryParams.pageNum = 1
  getDataList()
}

function handleReset() {
  queryParams.dictLabel = undefined
  queryParams.status = undefined
  queryParams.pageNum = 1
  getDataList()
}

function handleExport() {
  download('system/dict/data/export', { ...queryParams }, `dict_data_${new Date().getTime()}.xlsx`)
}

/** 数据表单 */
const dataFormVisible = ref(false)
const dataFormScene = ref<'add' | 'edit' | 'view'>('add')
const dataFormLoading = ref(false)
const dataForm = reactive<SysDictData>({})
const submitting = ref(false)
const errors = reactive<Record<string, string>>({ dictLabel: '', dictValue: '', dictSort: '' })

function resetDataForm() {
  Object.assign(dataForm, {
    dictCode: undefined,
    dictType: queryParams.dictType,
    dictLabel: undefined,
    dictValue: undefined,
    cssClass: undefined,
    dictSort: 0,
    listClass: 'default',
    isDefault: 'N',
    status: '0',
    remark: undefined,
  })
}

function openAddDataForm() {
  dataFormScene.value = 'add'
  resetDataForm()
  dataFormVisible.value = true
}

async function openEditDataForm(row: SysDictData, scene: 'edit' | 'view' = 'edit') {
  dataFormScene.value = scene
  resetDataForm()
  dataFormVisible.value = true
  dataFormLoading.value = true
  try {
    const res = await getData(row.dictCode!)
    Object.assign(dataForm, res.data ?? {})
    dataForm.dictSort = Number(dataForm.dictSort ?? 0)
  } finally {
    dataFormLoading.value = false
  }
}

function validateDataForm() {
  errors.dictLabel = ''
  errors.dictValue = ''
  errors.dictSort = ''
  if (!dataForm.dictLabel?.trim()) {
    errors.dictLabel = '数据标签不能为空'
  }
  if (!dataForm.dictValue?.trim()) {
    errors.dictValue = '数据键值不能为空'
  }
  if (dataForm.dictSort == null) {
    errors.dictSort = '显示排序不能为空'
  }
  return !Object.values(errors).some(Boolean)
}

async function submitDataForm() {
  if (!validateDataForm()) {
    return
  }
  submitting.value = true
  try {
    if (dataForm.dictCode != null) {
      await updateData({ ...dataForm })
    } else {
      await addData({ ...dataForm })
    }
    dataFormVisible.value = false
    ElMessage.success(dataForm.dictCode != null ? '修改成功' : '新增成功')
    await getDataList()
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    submitting.value = false
  }
}

/** 删除 */
const deleteVisible = ref(false)
const deleteLoading = ref(false)
const deleteIds = ref<number[]>([])

function openDeleteConfirm(ids: number[]) {
  if (!ids.length) {
    return
  }
  deleteIds.value = [...ids]
  deleteVisible.value = true
}

async function confirmDelete() {
  deleteLoading.value = true
  try {
    const ids = deleteIds.value.length === 1 ? deleteIds.value[0] : [...deleteIds.value]
    await delData(ids)
    deleteVisible.value = false
    deleteIds.value = []
    selectedIds.value = []
    ElMessage.success('删除成功')
    await getDataList()
  } catch {
    // 请求拦截器已统一提示错误
  } finally {
    deleteLoading.value = false
  }
}

const listClassMap: Record<string, string> = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-green-600',
  info: 'text-muted-foreground',
  warning: 'text-orange-600',
  danger: 'text-destructive',
}

const listClassOptions = [
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' },
]
const yesNoOptions = [
  { value: 'Y', label: '是' },
  { value: 'N', label: '否' },
]
const statusOptions = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
]
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="w-[720px] sm:max-w-[720px]">
      <SheetHeader>
        <SheetTitle>字典数据</SheetTitle>
        <SheetDescription>{{ dictStore.dataDrawerType?.dictName }}（{{ dictStore.dataDrawerType?.dictType }}）</SheetDescription>
      </SheetHeader>

      <Flex direction="column" class="min-h-0 flex-1" :gap="12">
        <!-- 查询 -->
        <Flex align="center" :gap="8">
          <Input v-model="queryParams.dictLabel" placeholder="请输入字典标签" class="w-48" radius="md" />
          <Select
            :model-value="queryParams.status"
            @update:model-value="value => (queryParams.status = value as string | undefined)"
          >
            <SelectTrigger>
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">正常</SelectItem>
              <SelectItem value="1">停用</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" radius="md" :disabled="loading" @click="handleSearch">
            <Loader2 v-if="loading" class="animate-spin" />
            查询
          </Button>
          <Button variant="ghost" radius="md" :disabled="loading" @click="handleReset">重置</Button>
        </Flex>

        <!-- 工具栏 -->
        <Flex align="center" justify="space-between">
          <Flex align="center" :gap="5">
            <span class="text-sm text-muted-foreground">已选 {{ selectedCount }} 项</span>
            <Button color="danger" variant="ghost" size="sm" radius="md" :disabled="selectedCount === 0" @click="openDeleteConfirm(selectedIds)">
              批量删除
            </Button>
            <Button size="sm" radius="md" @click="openAddDataForm">
              <Plus />
              新增
            </Button>
            <Button size="sm" radius="md" @click="handleExport">
              <Download />
              导出
            </Button>
          </Flex>
        </Flex>

        <!-- 表格 -->
        <div class="min-h-0 flex-1 overflow-auto rounded-md border border-border">
          <Table class="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead class="w-10"><Checkbox :model-value="selectAllState" @update:model-value="toggleAll" /></TableHead>
                <TableHead class="w-16">编号</TableHead>
                <TableHead class="w-[22%]">字典标签</TableHead>
                <TableHead class="w-[18%]">字典键值</TableHead>
                <TableHead class="w-16">排序</TableHead>
                <TableHead class="w-16">状态</TableHead>
                <TableHead>备注</TableHead>
                <TableHead class="w-[25%]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="loading">
                <TableRow v-for="index in 6" :key="`skeleton-${index}`" class="h-14">
                  <TableCell><Skeleton class="size-4 rounded-sm" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-2/3" /></TableCell>
                  <TableCell><Skeleton class="h-4 w-1/2" /></TableCell>
                </TableRow>
              </template>
              <TableRow v-else-if="dataList.length === 0" class="h-14">
                <TableCell :colspan="8" class="text-center text-muted-foreground">暂无数据</TableCell>
              </TableRow>
              <template v-else>
                <TableRow v-for="row in dataList" :key="rowId(row)" class="h-14">
                  <TableCell>
                    <Checkbox :model-value="selectedIds.includes(rowId(row))" @update:model-value="value => toggleRow(rowId(row), value)" />
                  </TableCell>
                  <TableCell class="truncate">{{ row.dictCode }}</TableCell>
                  <TableCell class="truncate">
                    <span :class="listClassMap[row.listClass ?? 'default']" class="cursor-pointer hover:underline" @click="openEditDataForm(row, 'view')">
                      {{ row.dictLabel }}
                    </span>
                  </TableCell>
                  <TableCell class="truncate">{{ row.dictValue }}</TableCell>
                  <TableCell>{{ row.dictSort }}</TableCell>
                  <TableCell>
                    <span :class="row.status === '0' ? 'text-green-600' : 'text-muted-foreground'">
                      {{ row.status === '0' ? '正常' : '停用' }}
                    </span>
                  </TableCell>
                  <TableCell class="truncate">{{ row.remark }}</TableCell>
                  <TableCell>
                    <Flex :gap="2">
                      <Button variant="ghost" size="icon-xs" radius="md" title="修改" @click="openEditDataForm(row, 'edit')">
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon-xs" radius="md" title="删除" @click="openDeleteConfirm([rowId(row)])">
                        <Trash2 />
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </div>

        <!-- 分页 -->
        <Flex class="shrink-0" align="center" justify="space-between" :gap="8" :padding-y="4">
          <span class="text-sm text-muted-foreground">共 {{ total }} 条</span>
          <Pagination
            v-model:page="currentPage"
            :items-per-page="queryParams.pageSize ?? 10"
            :total="total"
            :sibling-count="1"
            show-edges
            class="m-0 w-fit"
          >
            <PaginationContent v-slot="{ items }">
              <PaginationPrevious><ChevronLeftIcon class="size-4" /><span>上一页</span></PaginationPrevious>
              <template v-for="(item, index) in items" :key="index">
                <PaginationEllipsis v-if="item.type === 'ellipsis'" />
                <PaginationItem v-else :value="item.value" :is-active="item.value === (queryParams.pageNum ?? 1)">
                  {{ item.value }}
                </PaginationItem>
              </template>
              <PaginationNext><span>下一页</span><ChevronRightIcon class="size-4" /></PaginationNext>
            </PaginationContent>
          </Pagination>
        </Flex>
      </Flex>

      <!-- 数据表单 -->
      <Dialog v-model:open="dataFormVisible">
        <DialogContent class="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{{ dataFormScene === 'view' ? '字典数据详情' : dataForm.dictCode ? '修改字典数据' : '添加字典数据' }}</DialogTitle>
            <DialogDescription>{{ dataFormScene === 'view' ? '查看字典数据（只读）' : '填写字典数据信息' }}</DialogDescription>
          </DialogHeader>

          <Flex v-if="dataFormLoading" align="center" justify="center" :gap="8" :padding-y="24">
            <Loader2 class="animate-spin" />
            <span class="text-sm text-muted-foreground">加载中...</span>
          </Flex>

          <template v-else>
            <div class="grid grid-cols-2 gap-4">
              <Flex direction="column" :gap="4" class="col-span-2">
                <Label>字典类型</Label>
                <Input :model-value="dataForm.dictType" disabled radius="md" />
              </Flex>
              <Flex direction="column" :gap="4">
                <Label>数据标签<span v-if="dataFormScene !== 'view'" class="text-destructive">*</span></Label>
                <Input v-model="dataForm.dictLabel" placeholder="请输入数据标签" radius="md" :disabled="dataFormScene === 'view'" />
                <p v-if="errors.dictLabel" class="text-xs text-destructive">{{ errors.dictLabel }}</p>
              </Flex>
              <Flex direction="column" :gap="4">
                <Label>数据键值<span v-if="dataFormScene !== 'view'" class="text-destructive">*</span></Label>
                <Input v-model="dataForm.dictValue" placeholder="请输入数据键值" radius="md" :disabled="dataFormScene === 'view'" />
                <p v-if="errors.dictValue" class="text-xs text-destructive">{{ errors.dictValue }}</p>
              </Flex>
              <Flex direction="column" :gap="4">
                <Label>样式属性</Label>
                <Input v-model="dataForm.cssClass" placeholder="请输入样式属性" radius="md" :disabled="dataFormScene === 'view'" />
              </Flex>
              <Flex direction="column" :gap="4">
                <Label>显示排序<span v-if="dataFormScene !== 'view'" class="text-destructive">*</span></Label>
                <Input
                  :model-value="dataForm.dictSort"
                  type="number"
                  min="0"
                  radius="md"
                  :disabled="dataFormScene === 'view'"
                  @update:model-value="value => (dataForm.dictSort = Number(value) || 0)"
                />
                <p v-if="errors.dictSort" class="text-xs text-destructive">{{ errors.dictSort }}</p>
              </Flex>
              <Flex direction="column" :gap="4">
                <Label>回显样式</Label>
                <Select :model-value="dataForm.listClass" :disabled="dataFormScene === 'view'" @update:model-value="value => (dataForm.listClass = String(value))">
                  <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
                  <SelectContent radius="md">
                    <SelectItem v-for="item in listClassOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
                  </SelectContent>
                </Select>
              </Flex>
              <Flex direction="column" :gap="4">
                <Label>是否默认</Label>
                <Select :model-value="dataForm.isDefault" :disabled="dataFormScene === 'view'" @update:model-value="value => (dataForm.isDefault = value as 'Y' | 'N')">
                  <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
                  <SelectContent radius="md">
                    <SelectItem v-for="item in yesNoOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
                  </SelectContent>
                </Select>
              </Flex>
              <Flex direction="column" :gap="4">
                <Label>状态</Label>
                <Select :model-value="dataForm.status" :disabled="dataFormScene === 'view'" @update:model-value="value => (dataForm.status = value as '0' | '1')">
                  <SelectTrigger class="w-full" radius="md"><SelectValue /></SelectTrigger>
                  <SelectContent radius="md">
                    <SelectItem v-for="item in statusOptions" :key="item.value" :value="item.value">{{ item.label }}</SelectItem>
                  </SelectContent>
                </Select>
              </Flex>
              <Flex direction="column" :gap="4" class="col-span-2">
                <Label>备注</Label>
                <Textarea v-model="dataForm.remark" placeholder="请输入内容" :disabled="dataFormScene === 'view'" />
              </Flex>
            </div>
          </template>

          <DialogFooter class="gap-2">
            <Button v-if="dataFormScene === 'view'" variant="outline" radius="md" @click="dataFormVisible = false">关闭</Button>
            <template v-else>
              <Button variant="outline" radius="md" @click="dataFormVisible = false">取消</Button>
              <Button color="primary" radius="md" :disabled="submitting" @click="submitDataForm">
                <Loader2 v-if="submitting" class="animate-spin" />
                确定
              </Button>
            </template>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog v-model:open="deleteVisible">
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除字典数据</AlertDialogTitle>
            <AlertDialogDescription>确定要删除选中的 {{ deleteIds.length }} 条字典数据吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel radius="md" @click="deleteVisible = false">取消</AlertDialogCancel>
            <Button color="danger" radius="md" :disabled="deleteLoading" @click="confirmDelete">
              <Loader2 v-if="deleteLoading" class="animate-spin" />
              删除
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SheetContent>
  </Sheet>
</template>
