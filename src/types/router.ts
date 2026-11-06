import type { RouteComponent, RouteMeta } from 'vue-router'

/** 懒加载路由组件 */
export type LazyRouteComponent = () => Promise<unknown>

/** 路由元信息：后端 MetaVo 的基础上补充前端扩展字段 */
export interface AppRouteMeta extends RouteMeta {
  /** 菜单标题（侧边栏、面包屑、标签页展示） */
  title?: string
  /** 菜单图标（对应 src/assets/icons/svg 下的名称） */
  icon?: string
  /** 设置为 true 时不会被 keep-alive 缓存 */
  noCache?: boolean
  /** 外链地址（http(s):// 开头） */
  link?: string
  /** 是否固定在 tagsView 中 */
  affix?: boolean
  /** 当前路由高亮的菜单路径 */
  activeMenu?: string
  /** 是否在面包屑中显示 */
  breadcrumb?: boolean
}

/**
 * 应用路由记录
 *
 * 后台菜单（RouterVo）经 permission store 转换后的结构：
 * 保留 vue-router 路由记录的核心字段，同时包含若依的菜单扩展字段。
 */
export interface AppRouteRecord {
  /** 路由地址 */
  path: string
  /** 路由名称 */
  name?: string
  /** 组件：后台菜单字符串经 Layout / ParentView / loadView 转换后的结果 */
  component?: RouteComponent | LazyRouteComponent
  /** 命名视图 */
  components?: Record<string, RouteComponent | LazyRouteComponent>
  /** 重定向地址，noRedirect 表示面包屑中不可点击 */
  redirect?: string
  /** 是否在侧边栏隐藏 */
  hidden?: boolean
  /** 当一个路由下 children 大于 1 个时是否始终显示父级菜单 */
  alwaysShow?: boolean
  /** 菜单权限标识 */
  permissions?: string[]
  /** 角色权限标识 */
  roles?: string[]
  /** 路由参数（JSON 字符串，由后端菜单透传） */
  query?: string
  /** 路由元信息 */
  meta?: AppRouteMeta
  /** 子路由 */
  children?: AppRouteRecord[]
}
