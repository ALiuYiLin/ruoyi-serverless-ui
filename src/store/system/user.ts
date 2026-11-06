import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { addUser, deptTreeSelect, delUser, getUser, listUser, updateUser } from '@/api/system/user'
import { getConfigKey } from '@/api/system/config'
import type { SysPost, SysRole, SysUser, TreeSelect, UserQueryParams } from '@/types'

/** 用户列表筛选条件 */
export interface UserListFilter {
  /** 用户名称 */
  userName?: string
  /** 手机号码 */
  phonenumber?: string
  /** 状态（0正常 1停用） */
  status?: '0' | '1'
  /** 创建时间起 */
  beginTime?: string
  /** 创建时间止 */
  endTime?: string
}

/** 表单默认值 */
function createDefaultForm(): SysUser {
  return {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: '2',
    status: '0',
    remark: undefined,
    postIds: [],
    roleIds: [],
  }
}

export const useSystemUserStore = defineStore('system-user', () => {
  /** loading 最短持续时间，避免骨架屏一闪而过 */
  const MIN_LOADING_MS = 300

  /** 查询参数（分页 + 筛选 + 日期范围） */
  const queryParams = reactive<UserQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  /** 当前页用户列表 */
  const userList = ref<SysUser[]>([])
  /** 总记录数 */
  const total = ref(0)
  /** 加载状态 */
  const loading = ref(false)
  /** 请求序号，避免快速切换时旧请求覆盖新数据 */
  let requestSeq = 0

  /** 新增/修改表单 */
  const formVisible = ref(false)
  const formMode = ref<'add' | 'edit'>('add')
  const formLoading = ref(false)
  const formData = reactive<SysUser>(createDefaultForm())
  const postOptions = ref<SysPost[]>([])
  const roleOptions = ref<SysRole[]>([])
  const deptOptions = ref<TreeSelect[]>([])
  let deptTreeLoaded = false

  /** 删除确认 */
  const deleteVisible = ref(false)
  const deleteLoading = ref(false)
  const deleteIds = ref<number[]>([])

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listUser(queryParams)
      if (seq !== requestSeq) {
        return
      }
      userList.value = res.rows
      total.value = res.total

      // 每页条数变化后，当前页可能超出最大页数，回退到最后一页
      const maxPage = Math.max(1, Math.ceil(res.total / (queryParams.pageSize || 10)))
      if (queryParams.pageNum && queryParams.pageNum > maxPage) {
        queryParams.pageNum = maxPage
        await getList()
      }
    } finally {
      // 即使数据很快返回，也让 loading 至少持续 MIN_LOADING_MS，过渡更平缓
      const remaining = MIN_LOADING_MS - (Date.now() - startedAt)
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining))
      }
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  function applyFilter(filter: UserListFilter) {
    queryParams.userName = filter.userName || undefined
    queryParams.phonenumber = filter.phonenumber || undefined
    queryParams.status = filter.status || undefined
    queryParams.params = {
      beginTime: filter.beginTime || undefined,
      endTime: filter.endTime || undefined,
    }
    queryParams.pageNum = 1
  }

  /** 查询（带筛选条件） */
  function search(filter: UserListFilter) {
    applyFilter(filter)
    return getList()
  }

  /** 重置筛选并查询 */
  function resetQuery() {
    applyFilter({})
    return getList()
  }

  /** 切换页码 */
  function setPage(page: number) {
    if (page === queryParams.pageNum) {
      return
    }
    queryParams.pageNum = page
    return getList()
  }

  /** 切换每页条数 */
  function setPageSize(size: number) {
    if (size === queryParams.pageSize) {
      return
    }
    const previousSize = queryParams.pageSize ?? 10
    queryParams.pageSize = size
    // 数据已全部加载过（每页条数都不小于总数）时，改变条数无需重新请求
    if (queryParams.pageNum === 1 && total.value <= Math.min(previousSize, size)) {
      return
    }
    queryParams.pageNum = 1
    return getList()
  }

  /** 查询部门树（只请求一次） */
  async function loadDeptTree() {
    if (deptTreeLoaded) {
      return
    }
    const res = await deptTreeSelect()
    deptOptions.value = res.data ?? []
    deptTreeLoaded = true
  }

  /** 重置表单 */
  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  /** 打开新增表单 */
  async function openAddForm() {
    formMode.value = 'add'
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const [userRes, configRes] = await Promise.all([
        getUser(),
        getConfigKey('sys.user.initPassword').catch(() => undefined),
      ])
      postOptions.value = userRes.posts ?? []
      roleOptions.value = userRes.roles ?? []
      if (configRes?.msg) {
        formData.password = String(configRes.msg)
      }
      await loadDeptTree()
    } finally {
      formLoading.value = false
    }
  }

  /** 打开修改表单 */
  async function openEditForm(row: SysUser) {
    formMode.value = 'edit'
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const res = await getUser(row.userId)
      Object.assign(formData, res.data ?? {})
      formData.postIds = res.postIds ?? []
      formData.roleIds = res.roleIds ?? []
      // 修改时不回显/提交密码
      formData.password = undefined
      postOptions.value = res.posts ?? []
      roleOptions.value = res.roles ?? []
      await loadDeptTree()
    } finally {
      formLoading.value = false
    }
  }

  /** 关闭表单 */
  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  /** 提交表单（新增/修改） */
  async function submitForm() {
    const isEdit = formData.userId != null
    if (isEdit) {
      await updateUser({ ...formData })
    } else {
      await addUser({ ...formData })
    }
    formVisible.value = false
    resetForm()
    await getList()
    return true
  }

  /** 打开删除确认弹窗 */
  function openDeleteConfirm(ids: number[]) {
    if (!ids.length) {
      return
    }
    deleteIds.value = [...ids]
    deleteVisible.value = true
  }

  /** 关闭删除确认弹窗 */
  function closeDeleteConfirm() {
    deleteVisible.value = false
    deleteIds.value = []
  }

  /** 确认删除并刷新列表 */
  async function confirmDelete() {
    if (!deleteIds.value.length) {
      return false
    }
    deleteLoading.value = true
    try {
      const ids = deleteIds.value.length === 1 ? deleteIds.value[0] : [...deleteIds.value]
      await delUser(ids)
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
    userList,
    total,
    loading,
    getList,
    search,
    resetQuery,
    setPage,
    setPageSize,
    formVisible,
    formMode,
    formLoading,
    formData,
    postOptions,
    roleOptions,
    deptOptions,
    loadDeptTree,
    openAddForm,
    openEditForm,
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

export default useSystemUserStore
