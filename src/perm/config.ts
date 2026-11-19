import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 参数设置 - 查看权限（含按键名取值） */
const config_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.config
  ],
  apis: [
    APIS.CONFIG_LIST,
    APIS.CONFIG_DETAIL,
    APIS.CONFIG_KEY,
    APIS.CONFIG_EXPORT
  ]
}

/** 参数设置 - 编辑权限（新增/修改/删除/刷新缓存） */
const config_write: PermBody = {
  paths: [],
  apis: [
    APIS.CONFIG_ADD,
    APIS.CONFIG_UPDATE,
    APIS.CONFIG_DEL,
    APIS.CONFIG_REFRESH_CACHE
  ]
}

export const CONFIG_PERMS = {
  config_read,
  config_write
}
