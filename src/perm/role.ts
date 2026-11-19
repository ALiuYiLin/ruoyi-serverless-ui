import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 角色管理 - 查看权限（含已授权/未授权用户、部门树、导出） */
const role_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.role
  ],
  apis: [
    APIS.ROLE_LIST,
    APIS.ROLE_DETAIL,
    APIS.ROLE_DEPT_TREE,
    APIS.ROLE_AUTH_USER_ALLOCATED_LIST,
    APIS.ROLE_AUTH_USER_UNALLOCATED_LIST,
    APIS.ROLE_EXPORT
  ]
}

/** 角色管理 - 编辑权限（新增/修改/删除/数据权限/状态/分配用户） */
const role_write: PermBody = {
  paths: [],
  apis: [
    APIS.ROLE_ADD,
    APIS.ROLE_UPDATE,
    APIS.ROLE_DEL,
    APIS.ROLE_DATA_SCOPE,
    APIS.ROLE_CHANGE_STATUS,
    APIS.ROLE_AUTH_USER_SELECT_ALL
  ]
}

export const ROLE_PERMS = {
  role_read,
  role_write
}
