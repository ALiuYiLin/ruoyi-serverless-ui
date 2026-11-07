import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addRole,
  changeRoleStatus,
  dataScope,
  delRole,
  deptTreeSelect,
  getRole,
  listRole,
  updateRole,
} from '@/api/system/role'
import { roleMenuTreeselect, treeselect } from '@/api/system/menu'
import type { RoleQueryParams, SysRole, TreeSelect } from '@/types'

/** 角色列表筛选条件 */
export interface RoleListFilter {
  roleName?: string
  roleKey?: string
  status?: '0' | '1'
  beginTime?: string
  endTime?: string
}

/** 表单默认值 */
function createDefaultForm(): SysRole {
  return {
    roleId: undefined,
    roleName: undefined,
    roleKey: undefined,
    roleSort: 0,
    status: '0',
    menuIds: [],
    deptIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined,
  }
}

export const useSystemRoleStore = defineStore('system-role', () => {
  /** 查询参数 */
  const queryParams = reactive<RoleQueryParams>({
    pageNum: 1,
    pageSize: 10,
  })
  const roleList = ref<SysRole[]>([])
  const total = ref(0)
  const loading = ref(false)
  let requestSeq = 0

  async function getList() {
    const seq = ++requestSeq
    loading.value = true
    try {
      const res = await listRole(queryParams)
      if (seq !== requestSeq) {
        return
      }
      roleList.value = res.rows
      total.value = res.total
      const maxPage = Math.max(1, Math.ceil(res.total / (queryParams.pageSize || 10)))
      if (queryParams.pageNum && queryParams.pageNum > maxPage) {
        queryParams.pageNum = maxPage
        await getList()
      }
    } finally {
      if (seq === requestSeq) {
        loading.value = false
      }
    }
  }

  function applyFilter(filter: RoleListFilter) {
    queryParams.roleName = filter.roleName || undefined
    queryParams.roleKey = filter.roleKey || undefined
    queryParams.status = filter.status || undefined
    queryParams.params = {
      beginTime: filter.beginTime || undefined,
      endTime: filter.endTime || undefined,
    }
    queryParams.pageNum = 1
  }

  function search(filter: RoleListFilter) {
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

  /** 新增/修改/查看表单 */
  const formVisible = ref(false)
  const formScene = ref<'add' | 'edit' | 'view'>('add')
  const formLoading = ref(false)
  const formData = reactive<SysRole>(createDefaultForm())
  const menuOptions = ref<TreeSelect[]>([])

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  async function openAddForm() {
    formScene.value = 'add'
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const res = await treeselect()
      menuOptions.value = res.data ?? []
    } finally {
      formLoading.value = false
    }
  }

  async function loadRoleForm(row: SysRole, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const [roleRes, menuRes] = await Promise.all([
        getRole(row.roleId),
        roleMenuTreeselect(row.roleId!),
      ])
      Object.assign(formData, roleRes.data ?? {})
      formData.roleSort = Number(formData.roleSort ?? 0)
      formData.menuIds = menuRes.checkedKeys ?? []
      menuOptions.value = menuRes.menus ?? []
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysRole) {
    return loadRoleForm(row, 'edit')
  }

  function openViewForm(row: SysRole) {
    return loadRoleForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  /** 提交表单；menuIds 由树组件传入（包含选中 + 半选） */
  async function submitForm(menuIds: number[]) {
    formData.menuIds = menuIds
    if (formData.roleId != null) {
      await updateRole({ ...formData })
    } else {
      await addRole({ ...formData })
    }
    formVisible.value = false
    resetForm()
    await getList()
    return true
  }

  /** 删除确认 */
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
      await delRole(ids)
      deleteVisible.value = false
      deleteIds.value = []
      await getList()
      return true
    } finally {
      deleteLoading.value = false
    }
  }

  /** 状态切换 */
  async function changeStatus(roleId: number, status: '0' | '1') {
    await changeRoleStatus(roleId, status)
    const row = roleList.value.find(item => item.roleId === roleId)
    if (row) {
      row.status = status
    }
  }

  /** 数据权限 */
  const dataScopeVisible = ref(false)
  const dataScopeLoading = ref(false)
  const dataScopeForm = reactive<SysRole>(createDefaultForm())
  const dataScopeDeptOptions = ref<TreeSelect[]>([])

  async function openDataScope(row: SysRole) {
    dataScopeVisible.value = true
    dataScopeLoading.value = true
    try {
      const [roleRes, deptRes] = await Promise.all([
        getRole(row.roleId),
        deptTreeSelect(row.roleId!),
      ])
      Object.assign(dataScopeForm, roleRes.data ?? {})
      dataScopeForm.deptIds = deptRes.checkedKeys ?? []
      dataScopeDeptOptions.value = deptRes.depts ?? []
    } finally {
      dataScopeLoading.value = false
    }
  }

  function closeDataScope() {
    dataScopeVisible.value = false
  }

  async function submitDataScope(deptIds: number[]) {
    dataScopeForm.deptIds = deptIds
    await dataScope({ ...dataScopeForm })
    dataScopeVisible.value = false
    await getList()
    return true
  }

  /** 分配用户弹窗 */
  const authUserVisible = ref(false)
  const authUserRole = ref<SysRole>()

  function openAuthUser(row: SysRole) {
    authUserRole.value = row
    authUserVisible.value = true
  }

  function closeAuthUser() {
    authUserVisible.value = false
  }

  return {
    queryParams,
    roleList,
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
    menuOptions,
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
    dataScopeVisible,
    dataScopeLoading,
    dataScopeForm,
    dataScopeDeptOptions,
    openDataScope,
    closeDataScope,
    submitDataScope,
    authUserVisible,
    authUserRole,
    openAuthUser,
    closeAuthUser,
  }
})

export default useSystemRoleStore
