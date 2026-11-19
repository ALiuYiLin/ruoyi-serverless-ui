import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 登录日志 - 查看权限 */
const logininfor_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.log.logininfor
  ],
  apis: [
    APIS.LOGININFOR_LIST,
    APIS.LOGININFOR_EXPORT
  ]
}

/** 登录日志 - 管理权限（删除/清空/账户解锁） */
const logininfor_write: PermBody = {
  paths: [],
  apis: [
    APIS.LOGININFOR_DEL,
    APIS.LOGININFOR_CLEAN,
    APIS.LOGININFOR_UNLOCK
  ]
}

export const LOGININFOR_PERMS = {
  logininfor_read,
  logininfor_write
}
