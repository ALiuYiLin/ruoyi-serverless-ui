import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 字典类型 - 查看权限 */
const dict_type_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.dict
  ],
  apis: [
    APIS.DICT_TYPE_LIST,
    APIS.DICT_TYPE_DETAIL,
    APIS.DICT_TYPE_OPTION_SELECT,
    APIS.DICT_TYPE_EXPORT
  ]
}

/** 字典类型 - 编辑权限（新增/修改/删除/刷新缓存） */
const dict_type_write: PermBody = {
  paths: [],
  apis: [
    APIS.DICT_TYPE_ADD,
    APIS.DICT_TYPE_UPDATE,
    APIS.DICT_TYPE_DEL,
    APIS.DICT_TYPE_REFRESH_CACHE
  ]
}

/** 字典数据 - 查看权限（字典数据抽屉，与字典管理同页） */
const dict_data_read: PermBody = {
  paths: [
    ROUTE_PATHS.system.dict
  ],
  apis: [
    APIS.DICT_DATA_LIST,
    APIS.DICT_DATA_DETAIL,
    APIS.DICT_DATA_BY_TYPE,
    APIS.DICT_DATA_EXPORT
  ]
}

/** 字典数据 - 编辑权限（新增/修改/删除） */
const dict_data_write: PermBody = {
  paths: [],
  apis: [
    APIS.DICT_DATA_ADD,
    APIS.DICT_DATA_UPDATE,
    APIS.DICT_DATA_DEL
  ]
}

export const DICT_PERMS = {
  dict_type_read,
  dict_type_write,
  dict_data_read,
  dict_data_write
}
