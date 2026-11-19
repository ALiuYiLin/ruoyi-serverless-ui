import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 服务监控 - 查看权限 */
const server_read: PermBody = {
  paths: [
    ROUTE_PATHS.monitor.server
  ],
  apis: [
    APIS.SERVER_INFO
  ]
}

export const SERVER_PERMS = {
  server_read
}
