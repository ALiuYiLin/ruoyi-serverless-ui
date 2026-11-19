import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 菜单管理 - 查看权限（含菜单树、角色菜单树） */
const menu_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.menu
  ],
  apis: [
    APIS.SYS_MENU_LIST,
    APIS.SYS_MENU_DETAIL,
    APIS.SYS_MENU_TREESELECT,
    APIS.SYS_MENU_ROLE_TREESELECT
  ]
}

/** 菜单管理 - 编辑权限（新增/修改/删除/排序） */
const menu_write: PermBody = {
  paths: [],
  apis: [
    APIS.SYS_MENU_ADD,
    APIS.SYS_MENU_UPDATE,
    APIS.SYS_MENU_UPDATE_SORT,
    APIS.SYS_MENU_DEL
  ]
}

export const MENU_PERMS = {
  menu_read,
  menu_write
}
