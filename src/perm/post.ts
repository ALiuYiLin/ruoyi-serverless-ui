import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 岗位管理 - 查看权限 */
const post_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.post
  ],
  apis: [
    APIS.POST_LIST,
    APIS.POST_DETAIL,
    APIS.POST_EXPORT
  ]
}

/** 岗位管理 - 编辑权限（新增/修改/删除） */
const post_write: PermBody = {
  paths: [],
  apis: [
    APIS.POST_ADD,
    APIS.POST_UPDATE,
    APIS.POST_DEL
  ]
}

export const POST_PERMS = {
  post_read,
  post_write
}
