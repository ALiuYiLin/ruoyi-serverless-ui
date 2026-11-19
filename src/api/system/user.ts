import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi"
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { UserQueryParams, UserFormDataResult, UserProfileResult, UserAuthRoleResult, UserProfileAvatarResult, SysUser, SysUserRoles, AjaxResult, TableDataInfo, TreeSelect } from '@/types'

// 用户模块接口集中管理
export const USER_API = {
  USER_LIST: 'GET:/system/user/list',
  USER_DETAIL: 'GET:/system/user/:id',
  USER_ADD: 'POST:/system/user',
  USER_UPDATE: 'PUT:/system/user',
  USER_DEL: 'DELETE:/system/user/:userId',
  USER_RESET_PWD: 'PUT:/system/user/resetPwd',
  USER_CHANGE_STATUS: 'PUT:/system/user/changeStatus',
  USER_PROFILE: 'GET:/system/user/profile',
  USER_PROFILE_UPDATE: 'PUT:/system/user/profile',
  USER_PROFILE_UPDATE_PWD: 'PUT:/system/user/profile/updatePwd',
  USER_PROFILE_AVATAR: 'POST:/system/user/profile/avatar',
  USER_AUTH_ROLE: 'GET:/system/user/authRole/:userId',
  USER_AUTH_ROLE_SAVE: 'PUT:/system/user/authRole',
  USER_DEPT_TREE: 'GET:/system/user/deptTree'
} as const satisfies Record<string, ApiDefinition>

// 查询用户列表
export function listUser(query: UserQueryParams): Promise<TableDataInfo<SysUser>> {
  const { basePath, method } = useAPI(USER_API.USER_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询用户详细
export function getUser(userId?: number): Promise<UserFormDataResult> {
  const { basePath, method } = useAPI(USER_API.USER_DETAIL)
  return request({
    url: basePath + parseStrEmpty(userId),
    method
  })
}

// 新增用户
export function addUser(data: SysUser): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改用户
export function updateUser(data: SysUser): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除用户
export function delUser(userId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_DEL)
  return request({
    url: basePath + userId,
    method
  })
}

// 用户密码重置
export function resetUserPwd(userId: number, password: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_RESET_PWD)
  const data = {
    userId,
    password
  }
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 用户状态修改
export function changeUserStatus(userId: number, status: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_CHANGE_STATUS)
  const data = {
    userId,
    status
  }
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 查询用户个人信息
export function getUserProfile(): Promise<UserProfileResult> {
  const { basePath, method } = useAPI(USER_API.USER_PROFILE)
  return request({
    url: basePath,
    method
  })
}

// 修改用户个人信息
export function updateUserProfile(data: SysUser): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_PROFILE_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword: string, newPassword: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_PROFILE_UPDATE_PWD)
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 用户头像上传
export function uploadAvatar(file: FormData | File): Promise<UserProfileAvatarResult> {
  const { basePath, method } = useAPI(USER_API.USER_PROFILE_AVATAR)
  return request({
    url: basePath,
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: file
  })
}

// 查询授权角色
export function getAuthRole(userId: number): Promise<UserAuthRoleResult> {
  const { basePath, method } = useAPI(USER_API.USER_AUTH_ROLE)
  return request({
    url: basePath + userId,
    method
  })
}

// 保存授权角色
export function updateAuthRole(data: SysUserRoles): Promise<AjaxResult> {
  const { basePath, method } = useAPI(USER_API.USER_AUTH_ROLE_SAVE)
  return request({
    url: basePath,
    method,
    params: data
  })
}

// 查询部门下拉树结构
export function deptTreeSelect(): Promise<AjaxResult<TreeSelect[]>> {
  const { basePath, method } = useAPI(USER_API.USER_DEPT_TREE)
  return request({
    url: basePath,
    method
  })
}
