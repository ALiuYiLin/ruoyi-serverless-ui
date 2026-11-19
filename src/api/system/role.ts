import request, { download } from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type {
  AjaxResult,
  AuthUserQueryParams,
  AuthUserSelectParams,
  RoleDeptTreeResult,
  RoleQueryParams,
  SysRole,
  SysUser,
  TableDataInfo,
} from '@/types'

// 角色模块接口集中管理
export const ROLE_API = {
  ROLE_LIST: 'GET:/system/role/list',
  ROLE_DETAIL: 'GET:/system/role/:roleId',
  ROLE_ADD: 'POST:/system/role',
  ROLE_UPDATE: 'PUT:/system/role',
  ROLE_DATA_SCOPE: 'PUT:/system/role/dataScope',
  ROLE_CHANGE_STATUS: 'PUT:/system/role/changeStatus',
  ROLE_DEL: 'DELETE:/system/role/:roleId',
  ROLE_EXPORT: 'POST:/system/role/export',
  ROLE_AUTH_USER_ALLOCATED_LIST: 'GET:/system/role/authUser/allocatedList',
  ROLE_AUTH_USER_UNALLOCATED_LIST: 'GET:/system/role/authUser/unallocatedList',
  ROLE_AUTH_USER_SELECT_ALL: 'PUT:/system/role/authUser/selectAll',
  ROLE_DEPT_TREE: 'GET:/system/role/deptTree/:roleId'
} as const satisfies Record<string, ApiDefinition>

// 查询角色列表
export function listRole(query: RoleQueryParams): Promise<TableDataInfo<SysRole>> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询角色详细
export function getRole(roleId?: number): Promise<AjaxResult<SysRole>> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_DETAIL)
  return request({
    url: basePath + (roleId ?? ''),
    method
  })
}

// 新增角色
export function addRole(data: SysRole): Promise<AjaxResult> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改角色
export function updateRole(data: SysRole): Promise<AjaxResult> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 角色数据权限
export function dataScope(data: SysRole): Promise<AjaxResult> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_DATA_SCOPE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 角色状态修改
export function changeRoleStatus(roleId: number, status: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_CHANGE_STATUS)
  const data = {
    roleId,
    status
  }
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除角色
export function delRole(roleId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_DEL)
  return request({
    url: basePath + roleId,
    method
  })
}

// 导出角色列表（download 内部固定使用 POST，故只取 basePath）
export function exportRole(query: RoleQueryParams) {
  const { basePath } = useAPI(ROLE_API.ROLE_EXPORT)
  return download(basePath, { ...query }, `role_${new Date().getTime()}.xlsx`)
}

// 查询角色已授权用户列表（保留以备后续扩展）
export function allocatedUserList(query: AuthUserQueryParams): Promise<TableDataInfo<SysUser>> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_AUTH_USER_ALLOCATED_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query: AuthUserQueryParams): Promise<TableDataInfo<SysUser>> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_AUTH_USER_UNALLOCATED_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 批量授权用户
export function authUserSelectAll(data: AuthUserSelectParams): Promise<AjaxResult> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_AUTH_USER_SELECT_ALL)
  return request({
    url: basePath,
    method,
    params: data
  })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId: number): Promise<RoleDeptTreeResult> {
  const { basePath, method } = useAPI(ROLE_API.ROLE_DEPT_TREE)
  return request({
    url: basePath + roleId,
    method
  })
}
