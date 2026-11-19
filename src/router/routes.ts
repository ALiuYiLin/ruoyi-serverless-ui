/**
 * 路由路径常量（唯一来源）。
 *
 * 公共路由（constantRoutes）、业务路由（dynamicRoutes）、侧边栏菜单
 * （sidebarMenus）都从这里取 path，保证「可访问地址」只维护一份。
 *
 * 本文件不依赖任何组件 / store，可被路由、布局、菜单安全引用（不会形成循环依赖）。
 */
export const ROUTE_PATHS = {
  /** 公共路由 */
  common: {
    /** 根布局占位路径，不是可访问地址 */
    root: '',
    index: '/index',
    login: '/login',
    register: '/register',
    lock: '/lock',
    redirect: '/redirect',
    /** /redirect 的子路由，:path 为动态段 */
    redirectChild: '/redirect/:path(.*)',
    unauthorized: '/401',
    /** 404 兜底 */
    notFound: '/:pathMatch(.*)*'
  },
  /** 业务路由：系统管理 */
  system: {
    root: '/system',
    user: '/system/user',
    role: '/system/role',
    menu: '/system/menu',
    dept: '/system/dept',
    post: '/system/post',
    dict: '/system/dict',
    config: '/system/config',
    notice: '/system/notice',
    log: {
      root: '/system/log',
      operlog: '/system/log/operlog',
      logininfor: '/system/log/logininfor'
    }
  },
  /** 业务路由：系统监控 */
  monitor: {
    root: '/monitor',
    online: '/monitor/online',
    job: '/monitor/job',
    server: '/monitor/server',
    cache: '/monitor/cache',
    cacheList: '/monitor/cacheList'
  }
} as const

/** 递归取出常量表里所有非空路径字面量 */
type LeafPaths<T> = T extends string
  ? T extends ''
    ? never
    : T
  : { [K in keyof T]: LeafPaths<T[K]> }[keyof T]

/** 所有可访问路径的联合类型（不含空串占位） */
export type RoutePath = LeafPaths<typeof ROUTE_PATHS>
