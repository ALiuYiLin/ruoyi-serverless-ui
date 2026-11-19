import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 通知公告 - 查看权限（列表/详情/已读用户） */
const notice_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.notice
  ],
  apis: [
    APIS.NOTICE_LIST,
    APIS.NOTICE_DETAIL,
    APIS.NOTICE_READ_USERS
  ]
}

/** 通知公告 - 编辑权限（新增/修改/删除） */
const notice_write: PermBody = {
  paths: [],
  apis: [
    APIS.NOTICE_ADD,
    APIS.NOTICE_UPDATE,
    APIS.NOTICE_DEL
  ]
}

export const NOTICE_PERMS = {
  notice_read,
  notice_write
}
