import type { ApiDefinitionOf, ApiKey } from '@/api'
import type { RoutePath } from '@/router/routes'

/**
 * 权限模块类型
 * @notice 变更需同步至后端
 */
export enum PermType {
  /** 基础权限（所有人可访问） */
  base = 'base',
  /** 基础权限（登录后） */
  auth = 'base_auth',
  /** 角色权限（可分配） */
  role = 'role',
  /** 管理权限 */
  admin = 'admin'
}

/** 权限资源体 */
export interface PermBody {
  /** 前端路由 */
  paths: RoutePath[]
  /** 后端接口 */
  apis: ApiDefinitionOf<ApiKey>[]
}
