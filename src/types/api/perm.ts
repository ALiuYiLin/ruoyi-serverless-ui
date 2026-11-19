import type { AjaxResult } from './common'

/** 有效权限资源体 */
export interface UserPermBody {
  /** 可访问的前端路由（完整地址） */
  paths: string[]
  /** 可调用的后端接口（METHOD:path） */
  apis: string[]
}

/**
 * 用户有效权限树，与 `tmp/perms.json` 同构。
 *
 * - `base` / `base_auth`：所有用户一致
 * - `role`：仅包含该用户角色已授权的权限项
 * - `admin`：仅管理员有内容
 */
export interface UserPermTree {
  base?: UserPermBody
  base_auth?: UserPermBody
  role?: Record<string, UserPermBody>
  admin?: UserPermBody
}

/** `GET /getPerms` 响应 */
export type UserPermResult = AjaxResult<UserPermTree>
