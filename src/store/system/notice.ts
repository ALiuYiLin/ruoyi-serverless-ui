import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { addNotice, delNotice, getNotice, listNotice, updateNotice } from '@/api/system/notice'
import type { NoticeQueryParams, SysNotice } from '@/types'

export interface NoticeListFilter {
  noticeTitle?: string
  createBy?: string
  noticeType?: '1' | '2'
}

const MIN_LOADING_MS = 300

function createDefaultForm(): SysNotice {
  return {
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: '1',
    noticeContent: '',
    status: '0',
    isRead: false,
  }
}

export const useSystemNoticeStore = defineStore('system-notice', () => {
  const queryParams = reactive<NoticeQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const noticeList = ref<SysNotice[]>([])
  const total = ref(0)
  const loading = ref(false)
  let requestSeq = 0

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listNotice(queryParams)
      if (seq !== requestSeq) {
        return
      }
      noticeList.value = res.rows
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

  function search(filter: NoticeListFilter) {
    queryParams.noticeTitle = filter.noticeTitle || undefined
    queryParams.createBy = filter.createBy || undefined
    queryParams.noticeType = filter.noticeType || undefined
    queryParams.pageNum = 1
    return getList()
  }

  function resetQuery() {
    queryParams.noticeTitle = undefined
    queryParams.createBy = undefined
    queryParams.noticeType = undefined
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
  const formData = reactive<SysNotice>(createDefaultForm())

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  function openAddForm() {
    formScene.value = 'add'
    resetForm()
    formVisible.value = true
  }

  async function loadForm(row: SysNotice, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const res = await getNotice(row.noticeId!)
      Object.assign(formData, res.data ?? {})
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysNotice) {
    return loadForm(row, 'edit')
  }

  function openViewForm(row: SysNotice) {
    return loadForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  async function submitForm() {
    if (formData.noticeId != null) {
      await updateNotice({ ...formData })
    } else {
      await addNotice({ ...formData })
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
      await delNotice(ids)
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
    noticeList,
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
  }
})

export default useSystemNoticeStore
