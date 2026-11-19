import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { AppRouteRecord, UserPermTree } from '@/types'

/** 归一化后的用户权限集 */
export interface UserAccess {
  /** 可访问路径 */
  paths: Set<string>
  /** 可调用接口 */
  apis: Set<string>
  hasPath(path: string): boolean
  hasApi(api?: string): boolean
}

/** 创建权限集 */
export function createAccess(paths: Iterable<string>, apis: Iterable<string>): UserAccess {
  const pathSet = new Set(paths)
  const apiSet = new Set(apis)
  return {
    paths: pathSet,
    apis: apiSet,
    hasPath: (path: string) => pathSet.has(path),
    hasApi: (api?: string) => !!api && apiSet.has(api)
  }
}

/**
 * 把后端权限树拍平成路径 / 接口集合。
 *
 * 与 `tmp/perms.json` 同构：base + base_auth + admin + role 下所有权限项取并集。
 */
export function flattenPerms(tree?: UserPermTree | null): UserAccess {
  const paths: string[] = []
  const apis: string[] = []

  const push = (body?: { paths?: string[]; apis?: string[] } | null) => {
    body?.paths?.forEach((path) => paths.push(path))
    body?.apis?.forEach((api) => apis.push(api))
  }

  push(tree?.base)
  push(tree?.base_auth)
  push(tree?.admin)
  Object.values(tree?.role ?? {}).forEach((body) => push(body))

  return createAccess(paths, apis)
}

/** 展平路由路径常量（空串跳过） */
function flattenRoutePaths(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') {
    if (node) out.push(node)
    return out
  }
  if (node && typeof node === 'object') {
    Object.values(node as Record<string, unknown>).forEach((value) => flattenRoutePaths(value, out))
  }
  return out
}

/** 管理员兜底：全部路由路径与接口 */
export function allAccess(): UserAccess {
  return createAccess(flattenRoutePaths(ROUTE_PATHS), Object.values(APIS))
}

/**
 * 按授权路径裁剪路由树。
 *
 * - 叶子路由：`path` 在授权集内才保留
 * - 分组路由：只要有一个子路由被保留就保留（分组路径本身不在权限集里）
 */
export function filterRoutes(routes: AppRouteRecord[], paths: Set<string>): AppRouteRecord[] {
  const result: AppRouteRecord[] = []
  for (const route of routes) {
    const children = route.children ? filterRoutes(route.children, paths) : []
    const keepSelf = paths.has(route.path)
    if (!keepSelf && children.length === 0) continue
    result.push({
      ...route,
      children: route.children ? children : undefined
    })
  }
  return result
}

/** 收集带子路由的分组路径，供直接访问分组地址时放行（走 redirect） */
export function collectGroupPaths(routes: AppRouteRecord[], out: string[] = []): string[] {
  for (const route of routes) {
    if (route.children?.length) {
      out.push(route.path)
      collectGroupPaths(route.children, out)
    }
  }
  return out
}

/** 公共路径：不参与权限判断，避免登录后自锁 */
const PUBLIC_PATHS = new Set<string>([
  '/',
  ROUTE_PATHS.common.index,
  ROUTE_PATHS.common.login,
  ROUTE_PATHS.common.register,
  ROUTE_PATHS.common.unauthorized,
  ROUTE_PATHS.common.lock
])

/** 是否为公共路径（含页签刷新中转 `/redirect/**`） */
export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path) || path.startsWith(`${ROUTE_PATHS.common.redirect}/`)
}
