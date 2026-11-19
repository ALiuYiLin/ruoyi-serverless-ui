import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 缓存监控 / 缓存列表 - 查看权限 */
const cache_read: PermBody = {
  paths: [
    ROUTE_PATHS.monitor.cache,
    ROUTE_PATHS.monitor.cacheList
  ],
  apis: [
    APIS.CACHE_INFO,
    APIS.CACHE_NAMES,
    APIS.CACHE_KEYS,
    APIS.CACHE_VALUE
  ]
}

/** 缓存监控 / 缓存列表 - 管理权限（清理缓存） */
const cache_write: PermBody = {
  paths: [],
  apis: [
    APIS.CACHE_CLEAR_NAME,
    APIS.CACHE_CLEAR_KEY,
    APIS.CACHE_CLEAR_ALL
  ]
}

export const CACHE_PERMS = {
  cache_read,
  cache_write
}
