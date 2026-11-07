import request from '@/utils/request'
import type { AjaxResult, RoleMenuTreeselectResult, TreeSelect } from '@/types'

// 查询菜单下拉树结构
export function treeselect(): Promise<AjaxResult<TreeSelect[]>> {
  return request({
    url: '/system/menu/treeselect',
    method: 'get'
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId: number): Promise<RoleMenuTreeselectResult> {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  })
}
