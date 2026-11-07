import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addConfig,
  delConfig,
  getConfig,
  listConfig,
  refreshCache as refreshConfigCache,
  updateConfig,
} from '@/api/system/config'
import type { ConfigQueryParams, SysConfig } from '@/types'

export interface ConfigListFilter {
  configName?: string
  configKey?: string
  configType?: 'Y' | 'N'
  beginTime?: string
  endTime?: string
}

const MIN_LOADING_MS = 300

function createDefaultForm(): SysConfig {
  return {
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: 'N',
    remark: undefined,
  }
}

export const useSystemConfigStore = defineStore('system-config', () => {
  const queryParams = reactive<ConfigQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const configList = ref<SysConfig[]>([])
  const total = ref(0)
  const loading = ref(false)
  let requestSeq = 0

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listConfig(queryParams)
      if (seq !== requestSeq) {
        return
      }
      configList.value = res.rows
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

  function search(filter: ConfigListFilter) {
    queryParams.configName = filter.configName || undefined
    queryParams.configKey = filter.configKey || undefined
    queryParams.configType = filter.configType || undefined
    queryParams.params = {
      beginTime: filter.beginTime || undefined,
      endTime: filter.endTime || undefined,
    }
    queryParams.pageNum = 1
    return getList()
  }

  function resetQuery() {
    queryParams.configName = undefined
    queryParams.configKey = undefined
    queryParams.configType = undefined
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

  const formVisible = ref(false)
  const formScene = ref<'add' | 'edit' | 'view'>('add')
  const formLoading = ref(false)
  const formData = reactive<SysConfig>(createDefaultForm())

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  function openAddForm() {
    formScene.value = 'add'
    resetForm()
    formVisible.value = true
  }

  async function loadForm(row: SysConfig, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const res = await getConfig(row.configId!)
      Object.assign(formData, res.data ?? {})
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysConfig) {
    return loadForm(row, 'edit')
  }

  function openViewForm(row: SysConfig) {
    return loadForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  async function submitForm() {
    if (formData.configId != null) {
      await updateConfig({ ...formData })
    } else {
      await addConfig({ ...formData })
    }
    formVisible.value = false
    resetForm()
    await getList()
    return true
  }

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
      await delConfig(ids)
      deleteVisible.value = false
      deleteIds.value = []
      await getList()
      return true
    } finally {
      deleteLoading.value = false
    }
  }

  async function refreshCache() {
    await refreshConfigCache()
  }

  return {
    queryParams,
    configList,
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
    refreshCache,
  }
})

export default useSystemConfigStore
