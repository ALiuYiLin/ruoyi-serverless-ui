import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { cleanLogininfor, delLogininfor, list, unlockLogininfor } from '@/api/monitor/logininfor'
import type { LogininforQueryParams, SysLogininfor } from '@/types'

export interface LogininforListFilter {
  ipaddr?: string
  userName?: string
  status?: string
  beginTime?: string
  endTime?: string
}

const MIN_LOADING_MS = 300

export const useSystemLogininforStore = defineStore('system-logininfor', () => {
  const queryParams = reactive<LogininforQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const logininforList = ref<SysLogininfor[]>([])
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
      logininforList.value = res.rows
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

  function search(filter: LogininforListFilter) {
    queryParams.ipaddr = filter.ipaddr || undefined
    queryParams.userName = filter.userName || undefined
    queryParams.status = filter.status || undefined
    queryParams.params = {
      beginTime: filter.beginTime || undefined,
      endTime: filter.endTime || undefined,
    }
    queryParams.pageNum = 1
    return getList()
  }

  function resetQuery() {
    queryParams.ipaddr = undefined
    queryParams.userName = undefined
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
      await delLogininfor(ids)
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
      await cleanLogininfor()
      cleanVisible.value = false
      await getList()
      return true
    } finally {
      cleanLoading.value = false
    }
  }

  /** 账户解锁 */
  async function unlock(userName: string) {
    await unlockLogininfor(userName)
    await getList()
  }

  return {
    queryParams,
    logininforList,
    total,
    loading,
    getList,
    search,
    resetQuery,
    setPage,
    setPageSize,
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
    unlock,
  }
})

export default useSystemLogininforStore
