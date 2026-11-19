import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 用户管理 - 查看权限 */
const user_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.user
  ],
  apis: [
    APIS.USER_LIST,
    APIS.USER_DETAIL,
    APIS.USER_DEPT_TREE
  ]
}

/** 用户管理 - 编辑权限（新增/修改/删除/重置密码/状态/分配角色） */
const user_write: PermBody = {
  paths: [],
  apis: [
    APIS.USER_ADD,
    APIS.USER_UPDATE,
    APIS.USER_DEL,
    APIS.USER_RESET_PWD,
    APIS.USER_CHANGE_STATUS,
    APIS.USER_AUTH_ROLE,
    APIS.USER_AUTH_ROLE_SAVE
  ]
}

export const USER_PERMS = {
  user_read,
  user_write
}
