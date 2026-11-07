import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { cleanOperlog, delOperlog, list } from '@/api/monitor/operlog'
import type { OperlogQueryParams, SysOperLog } from '@/types'

export interface OperlogListFilter {
  operIp?: string
  title?: string
  operName?: string
  businessType?: string
  status?: string
  beginTime?: string
  endTime?: string
}

const MIN_LOADING_MS = 300

export const useSystemOperlogStore = defineStore('system-operlog', () => {
  const queryParams = reactive<OperlogQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const operlogList = ref<SysOperLog[]>([])
  const total = ref(0)
  const loading = ref(false)
  let requestSeq = 0

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await list(queryParams)
      if (seq !== requestSeq) {
        return
      }
      operlogList.value = res.rows
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

  function search(filter: OperlogListFilter) {
    queryParams.operIp = filter.operIp || undefined
    queryParams.title = filter.title || undefined
    queryParams.operName = filter.operName || undefined
    queryParams.businessType = filter.businessType || undefined
    queryParams.status = filter.status || undefined
    queryParams.params = {
      beginTime: filter.beginTime || undefined,
      endTime: filter.endTime || undefined,
    }
    queryParams.pageNum = 1
    return getList()
  }

  function resetQuery() {
    queryParams.operIp = undefined
    queryParams.title = undefined
    queryParams.operName = undefined
    queryParams.businessType = undefined
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

  /** 详情 */
  const detailVisible = ref(false)
  const detailLog = ref<SysOperLog>()

  function openDetail(row: SysOperLog) {
    detailLog.value = row
    detailVisible.value = true
  }

  function closeDetail() {
    detailVisible.value = false
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
      await delOperlog(ids)
      deleteVisible.value = false
      deleteIds.value = []
      await getList()
      return true
    } finally {
      deleteLoading.value = false
    }
  }

  /** 清空 */
  const cleanVisible = ref(false)
  const cleanLoading = ref(false)

  function openCleanConfirm() {
    cleanVisible.value = true
  }

  function closeCleanConfirm() {
    cleanVisible.value = false
  }

  async function confirmClean() {
    cleanLoading.value = true
    try {
      await cleanOperlog()
      cleanVisible.value = false
      await getList()
      return true
    } finally {
      cleanLoading.value = false
    }
  }

  return {
    queryParams,
    operlogList,
    total,
    loading,
    getList,
    search,
    resetQuery,
    setPage,
    setPageSize,
    detailVisible,
    detailLog,
    openDetail,
    closeDetail,
    deleteVisible,
    deleteLoading,
    deleteIds,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    cleanVisible,
    cleanLoading,
    openCleanConfirm,
    closeCleanConfirm,
    confirmClean,
  }
})

export default useSystemOperlogStore
