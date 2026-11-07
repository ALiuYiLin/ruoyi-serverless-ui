import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { addPost, delPost, getPost, listPost, updatePost } from '@/api/system/post'
import type { PostQueryParams, SysPost } from '@/types'

/** 岗位列表筛选条件 */
export interface PostListFilter {
  postCode?: string
  postName?: string
  status?: '0' | '1'
}

/** 最小 loading 时长，避免骨架屏一闪而过 */
const MIN_LOADING_MS = 300

function createDefaultForm(): SysPost {
  return {
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: '0',
    remark: undefined,
  }
}

export const useSystemPostStore = defineStore('system-post', () => {
  const queryParams = reactive<PostQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const postList = ref<SysPost[]>([])
  const total = ref(0)
  const loading = ref(false)
  let requestSeq = 0

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listPost(queryParams)
      if (seq !== requestSeq) {
        return
      }
      postList.value = res.rows
      total.value = res.total
      const maxPage = Math.max(1, Math.ceil(res.total / (queryParams.pageSize || 10)))
      if (queryParams.pageNum && queryParams.pageNum > maxPage) {
        queryParams.pageNum = maxPage
        await getList()
      }
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

  function applyFilter(filter: PostListFilter) {
    queryParams.postCode = filter.postCode || undefined
    queryParams.postName = filter.postName || undefined
    queryParams.status = filter.status || undefined
    queryParams.pageNum = 1
  }

  function search(filter: PostListFilter) {
    applyFilter(filter)
    return getList()
  }

  function resetQuery() {
    applyFilter({})
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
  const formData = reactive<SysPost>(createDefaultForm())

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  function openAddForm() {
    formScene.value = 'add'
    resetForm()
    formVisible.value = true
  }

  async function loadPostForm(row: SysPost, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const res = await getPost(row.postId!)
      Object.assign(formData, res.data ?? {})
      formData.postSort = Number(formData.postSort ?? 0)
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysPost) {
    return loadPostForm(row, 'edit')
  }

  function openViewForm(row: SysPost) {
    return loadPostForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  async function submitForm() {
    if (formData.postId != null) {
      await updatePost({ ...formData })
    } else {
      await addPost({ ...formData })
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
      await delPost(ids)
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
    postList,
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

export default useSystemPostStore
