import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 部门管理 - 查看权限 */
const dept_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.dept
  ],
  apis: [
    APIS.DEPT_LIST,
    APIS.DEPT_LIST_EXCLUDE_CHILD,
    APIS.DEPT_DETAIL
  ]
}

/** 部门管理 - 编辑权限（新增/修改/删除/排序） */
const dept_write: PermBody = {
  paths: [],
  apis: [
    APIS.DEPT_ADD,
    APIS.DEPT_UPDATE,
    APIS.DEPT_UPDATE_SORT,
    APIS.DEPT_DEL
  ]
}

export const DEPT_PERMS = {
  dept_read,
  dept_write
}
