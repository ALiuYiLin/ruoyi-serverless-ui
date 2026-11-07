import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addDept,
  delDept,
  getDept,
  listDept,
  listDeptExcludeChild,
  updateDept,
  updateDeptSort,
} from '@/api/system/dept'
import { handleTree } from '@/utils/ruoyi'
import type { DeptQueryParams, SysDept, TreeSelect } from '@/types'

/** 部门列表筛选条件 */
export interface DeptListFilter {
  deptName?: string
  status?: '0' | '1'
}

/** 最小 loading 时长，避免骨架屏一闪而过 */
const MIN_LOADING_MS = 300

function createDefaultForm(): SysDept {
  return {
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0',
  }
}

/** 扁平部门数据 -> 上级部门下拉树 */
function toTreeSelect(nodes: SysDept[]): TreeSelect[] {
  return nodes.map(node => ({
    id: node.deptId,
    label: node.deptName ?? '',
    disabled: false,
    children: toTreeSelect(node.children ?? []),
  }))
}

export const useSystemDeptStore = defineStore('system-dept', () => {
  const queryParams = reactive<DeptQueryParams>({
    deptName: undefined,
    status: undefined,
  })
  const deptTree = ref<SysDept[]>([])
  const loading = ref(false)
  const originalOrders = reactive<Record<number, number>>({})
  let requestSeq = 0

  function recordOriginalOrders(nodes: SysDept[]) {
    for (const node of nodes) {
      if (node.deptId != null) {
        originalOrders[node.deptId] = node.orderNum ?? 0
      }
      if (node.children?.length) {
        recordOriginalOrders(node.children)
      }
    }
  }

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listDept(queryParams)
      if (seq !== requestSeq) {
        return
      }
      deptTree.value = handleTree(res.data ?? [], 'deptId') as SysDept[]
      recordOriginalOrders(deptTree.value)
    } finally {
      // 即使数据很快返回，也让 loading 至少持续 MIN_LOADING_MS，骨架屏过渡更平缓
      const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  function search(filter: DeptListFilter) {
    queryParams.deptName = filter.deptName || undefined
    queryParams.status = filter.status || undefined
    return getList()
  }

  function resetQuery() {
    queryParams.deptName = undefined
    queryParams.status = undefined
    return getList()
  }

  /** 保存排序：只提交有变化的行，返回变更数量 */
  async function saveSort() {
    const deptIds: number[] = []
    const orderNums: number[] = []
    const walk = (nodes: SysDept[]) => {
      for (const node of nodes) {
        if (node.deptId != null && String(originalOrders[node.deptId]) !== String(node.orderNum)) {
          deptIds.push(node.deptId)
          orderNums.push(node.orderNum ?? 0)
        }
        if (node.children?.length) {
          walk(node.children)
        }
      }
    }
    walk(deptTree.value)
    if (!deptIds.length) {
      return 0
    }
    await updateDeptSort({
      deptIds: deptIds.join(','),
      orderNums: orderNums.join(','),
    })
    recordOriginalOrders(deptTree.value)
    return deptIds.length
  }

  /** 表单 */
  const formVisible = ref(false)
  const formScene = ref<'add' | 'edit' | 'view'>('add')
  const formLoading = ref(false)
  const formData = reactive<SysDept>(createDefaultForm())
  const deptOptions = ref<TreeSelect[]>([])

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  async function loadDeptOptions(excludeId?: number) {
    const res = excludeId != null ? await listDeptExcludeChild(excludeId) : await listDept()
    const tree = handleTree(res.data ?? [], 'deptId') as SysDept[]
    deptOptions.value = toTreeSelect(tree)
  }

  async function openAddForm(parentRow?: SysDept) {
    formScene.value = 'add'
    resetForm()
    if (parentRow?.deptId != null) {
      formData.parentId = parentRow.deptId
    }
    formVisible.value = true
    formLoading.value = true
    try {
      await loadDeptOptions()
    } finally {
      formLoading.value = false
    }
  }

  async function loadDeptForm(row: SysDept, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const [deptRes] = await Promise.all([
        getDept(row.deptId!),
        loadDeptOptions(row.deptId!),
      ])
      Object.assign(formData, deptRes.data ?? {})
      formData.orderNum = Number(formData.orderNum ?? 0)
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysDept) {
    return loadDeptForm(row, 'edit')
  }

  function openViewForm(row: SysDept) {
    return loadDeptForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  async function submitForm() {
    if (formData.deptId != null) {
      await updateDept({ ...formData })
    } else {
      await addDept({ ...formData })
    }
    formVisible.value = false
    resetForm()
    await getList()
    return true
  }

  /** 删除 */
  const deleteVisible = ref(false)
  const deleteLoading = ref(false)
  const deleteIds = ref<number[]>([])

  function openDeleteConfirm(deptId: number) {
    deleteIds.value = [deptId]
    deleteVisible.value = true
  }

  function closeDeleteConfirm() {
    deleteVisible.value = false
    deleteIds.value = []
  }

  async function confirmDelete() {
    if (!deleteIds.value.length) {
      return false
    }
    deleteLoading.value = true
    try {
      await delDept(deleteIds.value[0])
      deleteVisible.value = false
      deleteIds.value = []
      await getList()
      return true
    } finally {
      deleteLoading.value = false
    }
  }

  return {
    queryParams,
    deptTree,
    loading,
    getList,
    search,
    resetQuery,
    saveSort,
    formVisible,
    formScene,
    formLoading,
    formData,
    deptOptions,
    openAddForm,
    openEditForm,
    openViewForm,
    closeForm,
    submitForm,
    deleteVisible,
    deleteLoading,
    deleteIds,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
  }
})

export default useSystemDeptStore
