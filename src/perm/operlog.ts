import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 操作日志 - 查看权限 */
const operlog_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.log.operlog
  ],
  apis: [
    APIS.OPERLOG_LIST,
    APIS.OPERLOG_EXPORT
  ]
}

/** 操作日志 - 管理权限（删除/清空） */
const operlog_write: PermBody = {
  paths: [],
  apis: [
    APIS.OPERLOG_DEL,
    APIS.OPERLOG_CLEAN
  ]
}

export const OPERLOG_PERMS = {
  operlog_read,
  operlog_write
}
