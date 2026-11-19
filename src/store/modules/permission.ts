import type { RouteRecordRaw } from 'vue-router'
import auth from '@/plugins/auth'
import router, { constantRoutes, dynamicRoutes as extraRoutes } from '@/router'
import { dynamicRoutes as staticRoutes } from '@/router/dynamic'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/base'
import ParentView from '@/components/ParentView/index.vue'
import { collectGroupPaths, filterRoutes, type UserAccess } from '@/perm/access'
import type { AppRouteRecord, LazyRouteComponent, RouterVo } from '@/types'

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue')

/**
 * 路由来源：
 * - `static`（默认）：本地 `dynamicRoutes` + 权限集过滤
 * - `backend`：回退到 `/getRouters` 返回的菜单树（旧逻辑，便于回滚）
 */
const ROUTE_SOURCE = (import.meta.env.VITE_ROUTE_SOURCE ?? 'static') as 'static' | 'backend'

/** 权限路由 store 的 state */
interface PermissionState {
  /** 权限是否已加载（替代原来用 roles.length === 0 判断） */
  loaded: boolean
  /** 已授权路径（含被保留的分组路径） */
  paths: string[]
  /** 已授权接口 */
  apis: string[]
  /** 全部路由（constantRoutes + 权限动态路由） */
  routes: AppRouteRecord[]
  /** 权限过滤后的动态路由 */
  addRoutes: AppRouteRecord[]
  /** 默认路由（用于面包屑、全局搜索） */
  defaultRoutes: AppRouteRecord[]
  /** 顶部导航路由 */
  topbarRouters: AppRouteRecord[]
  /** 侧边栏路由 */
  sidebarRouters: AppRouteRecord[]
}

const usePermissionStore = defineStore(
  'permission',
  {
    state: (): PermissionState => ({
      loaded: false,
      paths: [],
      apis: [],
      routes: [],
      addRoutes: [],
      defaultRoutes: [],
      topbarRouters: [],
      sidebarRouters: []
    }),
    actions: {
      setRoutes(routes: AppRouteRecord[]) {
        this.addRoutes = routes
        this.routes = constantRoutes.concat(routes)
      },
      setDefaultRoutes(routes: AppRouteRecord[]) {
        this.defaultRoutes = constantRoutes.concat(routes)
      },
      setTopbarRoutes(routes: AppRouteRecord[]) {
        this.topbarRouters = routes
      },
      setSidebarRouters(routes: AppRouteRecord[]) {
        this.sidebarRouters = routes
      },
      /** 是否可访问某个路由路径 */
      hasPath(path: string) {
        return this.paths.includes(path)
      },
      /** 是否可调用某个接口 */
      hasApi(api?: string) {
        return !!api && this.apis.includes(api)
      },
      /** 重置权限状态（退出登录 / 鉴权失败时） */
      resetAccess() {
        this.loaded = false
        this.paths = []
        this.apis = []
        this.routes = []
        this.addRoutes = []
        this.defaultRoutes = []
        this.topbarRouters = []
        this.sidebarRouters = []
      },
      /**
       * 生成可访问路由。
       *
       * static：按权限集裁剪本地 `dynamicRoutes`；
       * backend：走 `/getRouters` 旧逻辑。
       */
      async generateRoutes(access: UserAccess): Promise<AppRouteRecord[]> {
        if (ROUTE_SOURCE === 'backend') {
          const routes = await this.generateRoutesFromBackend()
          this.paths = [...access.paths]
          this.apis = [...access.apis]
          this.loaded = true
          return routes
        }

        const routes = filterRoutes(staticRoutes, access.paths)
        // 分组路径本身不在权限集里，并入后支持直接访问 /system、/system/log 等（走 redirect）
        this.paths = [...new Set([...access.paths, ...collectGroupPaths(routes)])]
        this.apis = [...access.apis]
        this.setRoutes(routes)
        this.setSidebarRouters(constantRoutes.concat(routes))
        this.setDefaultRoutes(routes)
        this.setTopbarRoutes(routes)
        this.loaded = true
        return routes
      },
      /** 旧逻辑：后端菜单树 → 路由（回退用） */
      async generateRoutesFromBackend(): Promise<AppRouteRecord[]> {
        const res = await getRouters()
        const sdata = JSON.parse(JSON.stringify(res.data)) as RouterVo[]
        const rdata = JSON.parse(JSON.stringify(res.data)) as RouterVo[]
        const defaultData = JSON.parse(JSON.stringify(res.data)) as RouterVo[]
        const sidebarRoutes = filterAsyncRouter(sdata)
        const rewriteRoutes = filterAsyncRouter(rdata, true)
        const defaultRoutes = filterAsyncRouter(defaultData)
        const asyncRoutes = filterDynamicRoutes(extraRoutes)
        // AppRouteRecord 含若依扩展字段，与 vue-router 的路由联合类型不兼容，边界处断言
        asyncRoutes.forEach(route => { router.addRoute(route as unknown as RouteRecordRaw) })

        this.setRoutes(rewriteRoutes)
        this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
        this.setDefaultRoutes(sidebarRoutes)
        this.setTopbarRoutes(defaultRoutes)
        return rewriteRoutes
      }
    }
  })

/** 后台菜单字符串对应的组件（Layout / ParentView / InnerLink 为特殊组件） */
function resolveComponent(component?: string): AppRouteRecord['component'] {
  if (!component) {
    return undefined
  }
  if (component === 'Layout') {
    return Layout
  }
  if (component === 'ParentView') {
    return ParentView
  }
  return loadView(component)
}

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: RouterVo[], type = false): AppRouteRecord[] {
  const routes: AppRouteRecord[] = []
  asyncRouterMap.forEach(route => {
    const record: AppRouteRecord = {
      path: route.path ?? '',
      name: route.name,
      hidden: route.hidden,
      redirect: route.redirect,
      alwaysShow: route.alwaysShow,
      query: route.query,
      meta: route.meta
        ? {
            title: route.meta.title,
            icon: route.meta.icon,
            noCache: route.meta.noCache,
            link: route.meta.link
          }
        : undefined
    }
    const component = resolveComponent(route.component)
    if (component) {
      record.component = component
    }
    const children = type && route.children ? filterChildren(route.children) : route.children
    if (children && children.length) {
      record.children = filterAsyncRouter(children, type)
    } else {
      // 没有子路由时不需要重定向
      delete record.redirect
    }
    routes.push(record)
  })
  return routes
}

/** 拍平 ParentView 嵌套的菜单（同时补全子路由路径） */
function filterChildren(childrenMap: RouterVo[], lastRouter?: RouterVo): RouterVo[] {
  const children: RouterVo[] = []
  childrenMap.forEach(el => {
    const path = lastRouter?.path ? `${lastRouter.path}/${el.path ?? ''}` : el.path
    if (el.children && el.children.length && el.component === 'ParentView') {
      children.push(...filterChildren(el.children, { ...el, path }))
    } else {
      children.push({ ...el, path })
    }
  })
  return children
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes: AppRouteRecord[]): AppRouteRecord[] {
  const res: AppRouteRecord[] = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}

export const loadView = (view: string): LazyRouteComponent | undefined => {
  let res: LazyRouteComponent | undefined
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === view) {
      res = () => modules[path]()
    }
  }
  return res
}

export default usePermissionStore
