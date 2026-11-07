import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { forceLogout as forceLogoutApi, list } from '@/api/monitor/online'
import type { OnlineQueryParams, SysUserOnline } from '@/types'

export interface OnlineListFilter {
  ipaddr?: string
  userName?: string
}

const MIN_LOADING_MS = 300

export const useSystemOnlineStore = defineStore('system-online', () => {
  const queryParams = reactive<OnlineQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const onlineList = ref<SysUserOnline[]>([])
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
      onlineList.value = res.rows
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

  function search(filter: OnlineListFilter) {
    queryParams.ipaddr = filter.ipaddr || undefined
    queryParams.userName = filter.userName || undefined
    queryParams.pageNum = 1
    return getList()
  }

  function resetQuery() {
    queryParams.ipaddr = undefined
    queryParams.userName = undefined
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

  async function forceLogout(tokenId: string) {
    await forceLogoutApi(tokenId)
    await getList()
  }

  return {
    queryParams,
    onlineList,
    total,
    loading,
    getList,
    search,
    resetQuery,
    setPage,
    setPageSize,
    forceLogout,
  }
})

export default useSystemOnlineStore
