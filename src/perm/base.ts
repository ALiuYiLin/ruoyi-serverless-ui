import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 基础权限：未登录也可访问 */
export const base: PermBody = {
  paths: [
    ROUTE_PATHS.common.login,
    ROUTE_PATHS.common.register,
    ROUTE_PATHS.common.notFound
  ],
  apis: [
    APIS.LOGIN,
    APIS.REGISTER,
    APIS.CAPTCHA_IMAGE
  ]
}

/** 登录后基础权限：动态菜单、个人中心、首页公告、锁屏解锁 */
export const base_auth: PermBody = {
  paths: [
    ROUTE_PATHS.common.index
  ],
  apis: [
    APIS.LOGOUT,
    APIS.UNLOCK_SCREEN,
    APIS.GET_INFO,
    APIS.GET_ROUTERS,
    APIS.USER_PROFILE,
    APIS.USER_PROFILE_UPDATE,
    APIS.USER_PROFILE_UPDATE_PWD,
    APIS.USER_PROFILE_AVATAR,
    APIS.NOTICE_LIST_TOP,
    APIS.NOTICE_MARK_READ,
    APIS.NOTICE_MARK_READ_ALL
  ]
}
