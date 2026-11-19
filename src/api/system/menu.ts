import request from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type {
  AjaxResult,
  MenuQueryParams,
  MenuSortParams,
  RoleMenuTreeselectResult,
  SysMenu,
  TreeSelect,
} from '@/types'

// 菜单模块接口集中管理
export const SYS_MENU_API = {
  SYS_MENU_LIST: 'GET:/system/menu/list',
  SYS_MENU_DETAIL: 'GET:/system/menu/:menuId',
  SYS_MENU_TREESELECT: 'GET:/system/menu/treeselect',
  SYS_MENU_ROLE_TREESELECT: 'GET:/system/menu/roleMenuTreeselect/:roleId',
  SYS_MENU_ADD: 'POST:/system/menu',
  SYS_MENU_UPDATE: 'PUT:/system/menu',
  SYS_MENU_UPDATE_SORT: 'PUT:/system/menu/updateSort',
  SYS_MENU_DEL: 'DELETE:/system/menu/:menuId'
} as const satisfies Record<string, ApiDefinition>

// 查询菜单列表
export function listMenu(query?: MenuQueryParams): Promise<AjaxResult<SysMenu[]>> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询菜单详细
export function getMenu(menuId: number): Promise<AjaxResult<SysMenu>> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_DETAIL)
  return request({
    url: basePath + menuId,
    method
  })
}

// 查询菜单下拉树结构
export function treeselect(): Promise<AjaxResult<TreeSelect[]>> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_TREESELECT)
  return request({
    url: basePath,
    method
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId: number): Promise<RoleMenuTreeselectResult> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_ROLE_TREESELECT)
  return request({
    url: basePath + roleId,
    method
  })
}

// 新增菜单
export function addMenu(data: SysMenu): Promise<AjaxResult> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改菜单
export function updateMenu(data: SysMenu): Promise<AjaxResult> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 保存菜单排序
export function updateMenuSort(data: MenuSortParams): Promise<AjaxResult> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_UPDATE_SORT)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除菜单
export function delMenu(menuId: number): Promise<AjaxResult> {
  const { basePath, method } = useAPI(SYS_MENU_API.SYS_MENU_DEL)
  return request({
    url: basePath + menuId,
    method
  })
}
