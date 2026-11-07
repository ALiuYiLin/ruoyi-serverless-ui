import request from '@/utils/request'
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

// 查询角色列表
export function listRole(query: RoleQueryParams): Promise<TableDataInfo<SysRole>> {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId?: number): Promise<AjaxResult<SysRole>> {
  return request({
    url: '/system/role/' + (roleId ?? ''),
    method: 'get'
  })
}

// 新增角色
export function addRole(data: SysRole): Promise<AjaxResult> {
  return request({
    url: '/system/role',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data: SysRole): Promise<AjaxResult> {
  return request({
    url: '/system/role',
    method: 'put',
    data: data
  })
}

// 角色数据权限
export function dataScope(data: SysRole): Promise<AjaxResult> {
  return request({
    url: '/system/role/dataScope',
    method: 'put',
    data: data
  })
}

// 角色状态修改
export function changeRoleStatus(roleId: number, status: string): Promise<AjaxResult> {
  const data = {
    roleId,
    status
  }
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(roleId: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/system/role/' + roleId,
    method: 'delete'
  })
}

// 查询角色已授权用户列表（保留以备后续扩展）
export function allocatedUserList(query: AuthUserQueryParams): Promise<TableDataInfo<SysUser>> {
  return request({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: query
  })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query: AuthUserQueryParams): Promise<TableDataInfo<SysUser>> {
  return request({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: query
  })
}

// 批量授权用户
export function authUserSelectAll(data: AuthUserSelectParams): Promise<AjaxResult> {
  return request({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    params: data
  })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId: number): Promise<RoleDeptTreeResult> {
  return request({
    url: '/system/role/deptTree/' + roleId,
    method: 'get'
  })
}
