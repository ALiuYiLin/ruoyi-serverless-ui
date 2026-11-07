import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  addMenu,
  delMenu,
  getMenu,
  listMenu,
  updateMenu,
  updateMenuSort,
} from '@/api/system/menu'
import { handleTree } from '@/utils/ruoyi'
import type { MenuQueryParams, SysMenu, TreeSelect } from '@/types'

/** 菜单列表筛选条件 */
export interface MenuListFilter {
  menuName?: string
  status?: '0' | '1'
}

/** 最小 loading 时长，避免骨架屏一闪而过 */
const MIN_LOADING_MS = 300

function createDefaultForm(): SysMenu {
  return {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: 'M',
    orderNum: 0,
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
    path: undefined,
    component: undefined,
    perms: undefined,
    query: undefined,
    routeName: undefined,
  }
}

function toTreeSelect(nodes: SysMenu[]): TreeSelect[] {
  return nodes.map(node => ({
    id: node.menuId,
    label: node.menuName ?? '',
    disabled: false,
    children: toTreeSelect(node.children ?? []),
  }))
}

export const useSystemMenuStore = defineStore('system-menu', () => {
  const queryParams = reactive<MenuQueryParams>({
    menuName: undefined,
    status: undefined,
  })
  const menuTree = ref<SysMenu[]>([])
  const loading = ref(false)
  const originalOrders = reactive<Record<number, number>>({})
  let requestSeq = 0

  function recordOriginalOrders(nodes: SysMenu[]) {
    for (const node of nodes) {
      if (node.menuId != null) {
        originalOrders[node.menuId] = node.orderNum ?? 0
      }
      if (node.children?.length) {
        recordOriginalOrders(node.children)
      }
    }
  }

  async function getList() {
    const seq = ++requestSeq
    const startedAt = Date.now()
    loading.value = true
    try {
      const res = await listMenu(queryParams)
      if (seq !== requestSeq) {
        return
      }
      menuTree.value = handleTree(res.data ?? [], 'menuId') as SysMenu[]
      recordOriginalOrders(menuTree.value)
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

  function search(filter: MenuListFilter) {
    queryParams.menuName = filter.menuName || undefined
    queryParams.status = filter.status || undefined
    return getList()
  }

  function resetQuery() {
    queryParams.menuName = undefined
    queryParams.status = undefined
    return getList()
  }

  /** 保存排序 */
  async function saveSort() {
    const menuIds: number[] = []
    const orderNums: number[] = []
    const walk = (nodes: SysMenu[]) => {
      for (const node of nodes) {
        if (node.menuId != null && String(originalOrders[node.menuId]) !== String(node.orderNum)) {
          menuIds.push(node.menuId)
          orderNums.push(node.orderNum ?? 0)
        }
        if (node.children?.length) {
          walk(node.children)
        }
      }
    }
    walk(menuTree.value)
    if (!menuIds.length) {
      return 0
    }
    await updateMenuSort({ menuIds: menuIds.join(','), orderNums: orderNums.join(',') })
    recordOriginalOrders(menuTree.value)
    return menuIds.length
  }

  /** 表单 */
  const formVisible = ref(false)
  const formScene = ref<'add' | 'edit' | 'view'>('add')
  const formLoading = ref(false)
  const formData = reactive<SysMenu>(createDefaultForm())
  const menuOptions = ref<TreeSelect[]>([])

  function resetForm() {
    Object.assign(formData, createDefaultForm())
  }

  async function loadMenuOptions() {
    const res = await listMenu()
    const tree = handleTree(res.data ?? [], 'menuId') as SysMenu[]
    menuOptions.value = [
      {
        id: 0,
        label: '主类目',
        disabled: false,
        children: toTreeSelect(tree),
      },
    ]
  }

  async function openAddForm(parentRow?: SysMenu) {
    formScene.value = 'add'
    resetForm()
    if (parentRow?.menuId != null) {
      formData.parentId = parentRow.menuId
    }
    formVisible.value = true
    formLoading.value = true
    try {
      await loadMenuOptions()
    } finally {
      formLoading.value = false
    }
  }

  async function loadMenuForm(row: SysMenu, scene: 'edit' | 'view') {
    formScene.value = scene
    resetForm()
    formVisible.value = true
    formLoading.value = true
    try {
      const [menuRes] = await Promise.all([
        getMenu(row.menuId!),
        loadMenuOptions(),
      ])
      Object.assign(formData, menuRes.data ?? {})
      formData.orderNum = Number(formData.orderNum ?? 0)
    } finally {
      formLoading.value = false
    }
  }

  function openEditForm(row: SysMenu) {
    return loadMenuForm(row, 'edit')
  }

  function openViewForm(row: SysMenu) {
    return loadMenuForm(row, 'view')
  }

  function closeForm() {
    formVisible.value = false
    resetForm()
  }

  async function submitForm() {
    if (formData.menuId != null) {
      await updateMenu({ ...formData })
    } else {
      await addMenu({ ...formData })
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

  function openDeleteConfirm(menuId: number) {
    deleteIds.value = [menuId]
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
      await delMenu(deleteIds.value[0])
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
    menuTree,
    loading,
    getList,
    search,
    resetQuery,
    saveSort,
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
  }
})

export default useSystemMenuStore
