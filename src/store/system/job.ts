import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addJob,
  changeJobStatus,
  delJob,
  getJob,
  listJob,
  runJob,
  updateJob,
} from '@/api/monitor/job'
import type { JobQueryParams, SysJob } from '@/types'

export interface JobListFilter {
  jobName?: string
  jobGroup?: string
  status?: '0' | '1'
}

const MIN_LOADING_MS = 300

function createDefaultForm(): SysJob {
  return {
    jobId: undefined,
    jobName: undefined,
    jobGroup: 'DEFAULT',
    invokeTarget: undefined,
    cronExpression: undefined,
    misfirePolicy: '1',
    concurrent: '1',
    status: '0',
    remark: undefined,
  }
}

export const useSystemJobStore = defineStore('system-job', () => {
  const queryParams = reactive<JobQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const jobList = ref<SysJob[]>([])
  const total = ref(0)
  const loading = ref(false)
  let requestSeq = 0

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listJob(queryParams)
      if (seq !== requestSeq) {
        return
      }
      jobList.value = res.rows
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

  function search(filter: JobListFilter) {
    queryParams.jobName = filter.jobName || undefined
    queryParams.jobGroup = filter.jobGroup || undefined
    queryParams.status = filter.status || undefined
    queryParams.pageNum = 1
    return getList()
  }

  function resetQuery() {
    queryParams.jobName = undefined
    queryParams.jobGroup = undefined
    queryParams.status = undefined
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
  const formData = reactive<SysJob>(createDefaultForm())

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  function openAddForm() {
    formScene.value = 'add'
    resetForm()
    formVisible.value = true
  }

  async function loadForm(row: SysJob, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const res = await getJob(row.jobId!)
      Object.assign(formData, res.data ?? {})
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysJob) {
    return loadForm(row, 'edit')
  }

  function openViewForm(row: SysJob) {
    return loadForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  async function submitForm() {
    if (formData.jobId != null) {
      await updateJob({ ...formData })
    } else {
      await addJob({ ...formData })
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
      await delJob(ids)
      deleteVisible.value = false
      deleteIds.value = []
      await getList()
      return true
    } finally {
      deleteLoading.value = false
    }
  }

  /** 状态切换 */
  async function changeStatus(jobId: number, status: '0' | '1') {
    await changeJobStatus(jobId, status)
    const row = jobList.value.find(item => item.jobId === jobId)
    if (row) {
      row.status = status
    }
  }

  /** 执行一次 */
  async function runOnce(row: SysJob) {
    await runJob(row.jobId!, row.jobGroup ?? 'DEFAULT')
  }

  return {
    queryParams,
    jobList,
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
    changeStatus,
    runOnce,
  }
})

export default useSystemJobStore
