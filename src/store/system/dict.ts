import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addType,
  delType,
  getType,
  listType,
  refreshCache as refreshDictCache,
  updateType,
} from '@/api/system/dict/type'
import type { DictTypeQueryParams, SysDictType } from '@/types'

export interface DictTypeListFilter {
  dictName?: string
  dictType?: string
  status?: '0' | '1'
  beginTime?: string
  endTime?: string
}

const MIN_LOADING_MS = 300

function createDefaultForm(): SysDictType {
  return {
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: '0',
    remark: undefined,
  }
}

export const useSystemDictTypeStore = defineStore('system-dict-type', () => {
  const queryParams = reactive<DictTypeQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const typeList = ref<SysDictType[]>([])
  const total = ref(0)
  const loading = ref(false)
  let requestSeq = 0

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listType(queryParams)
      if (seq !== requestSeq) {
        return
      }
      typeList.value = res.rows
      total.value = res.total
      const maxPage = Math.max(1, Math.ceil(res.total / (queryParams.pageSize || 10)))
      if (queryParams.pageNum && queryParams.pageNum > maxPage) {
        queryParams.pageNum = maxPage
        await getList()
      }
    } finally {
      const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  function search(filter: DictTypeListFilter) {
    queryParams.dictName = filter.dictName || undefined
    queryParams.dictType = filter.dictType || undefined
    queryParams.status = filter.status || undefined
    queryParams.params = {
      beginTime: filter.beginTime || undefined,
      endTime: filter.endTime || undefined,
    }
    queryParams.pageNum = 1
    return getList()
  }

  function resetQuery() {
    queryParams.dictName = undefined
    queryParams.dictType = undefined
    queryParams.status = undefined
    queryParams.params = undefined
    queryParams.pageNum = 1
    return getList()
  }

  function setPage(page: number) {
    if (page === queryParams.pageNum) {
      return
    }
    queryParams.pageNum = page
    return getList()
  }

  function setPageSize(size: number) {
    if (size === queryParams.pageSize) {
      return
    }
    queryParams.pageSize = size
    queryParams.pageNum = 1
    return getList()
  }

  /** 表单 */
  const formVisible = ref(false)
  const formScene = ref<'add' | 'edit' | 'view'>('add')
  const formLoading = ref(false)
  const formData = reactive<SysDictType>(createDefaultForm())

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  function openAddForm() {
    formScene.value = 'add'
    resetForm()
    formVisible.value = true
  }

  async function loadForm(row: SysDictType, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const res = await getType(row.dictId!)
      Object.assign(formData, res.data ?? {})
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysDictType) {
    return loadForm(row, 'edit')
  }

  function openViewForm(row: SysDictType) {
    return loadForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  async function submitForm() {
    if (formData.dictId != null) {
      await updateType({ ...formData })
    } else {
      await addType({ ...formData })
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

  function openDeleteConfirm(ids: number[]) {
    if (!ids.length) {
      return
    }
    deleteIds.value = [...ids]
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
      const ids = deleteIds.value.length === 1 ? deleteIds.value[0] : [...deleteIds.value]
      await delType(ids)
      deleteVisible.value = false
      deleteIds.value = []
      await getList()
      return true
    } finally {
      deleteLoading.value = false
    }
  }

  /** 字典数据抽屉 */
  const dataDrawerVisible = ref(false)
  const dataDrawerType = ref<SysDictType>()

  function openDataDrawer(row: SysDictType) {
    dataDrawerType.value = row
    dataDrawerVisible.value = true
  }

  function closeDataDrawer() {
    dataDrawerVisible.value = false
  }

  /** 刷新缓存 */
  async function refreshCache() {
    await refreshDictCache()
  }

  return {
    queryParams,
    typeList,
    total,
    loading,
    getList,
    search,
    resetQuery,
    setPage,
    setPageSize,
    formVisible,
    formScene,
    formLoading,
    formData,
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
    dataDrawerVisible,
    dataDrawerType,
    openDataDrawer,
    closeDataDrawer,
    refreshCache,
  }
})

export default useSystemDictTypeStore
