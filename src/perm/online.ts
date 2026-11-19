import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 在线用户 - 查看权限 */
const online_read: PermBody = {
  paths: [
    ROUTE_PATHS.monitor.online
  ],
  apis: [
    APIS.ONLINE_LIST
  ]
}

/** 在线用户 - 管理权限（强退） */
const online_write: PermBody = {
  paths: [],
  apis: [
    APIS.ONLINE_FORCE_LOGOUT
  ]
}

export const ONLINE_PERMS = {
  online_read,
  online_write
}
