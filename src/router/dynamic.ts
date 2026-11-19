import { ROUTE_PATHS } from './routes'
import type { AppRouteRecord } from '@/types'

/**
 * 全部业务路由（不含 constantRoutes）。
 *
 * 运行时由 permission store 按用户有效权限（`GET /getPerms` 返回的 paths）过滤后
 * 注册：`VITE_ROUTE_SOURCE=static`（默认）走本文件，`backend` 回退到旧版
 * `/getRouters` 菜单树。path 全部取自 `./routes` 的 ROUTE_PATHS，且都是完整地址
 * （vue-router 中绝对路径不再与父级拼接），与公共路由、侧边栏共用同一份路径常量。
 *
 * 注意：Layout / ParentView 必须用懒加载（`() => import(...)`），不能顶层 import。
 * permission store 被布局（AppSidebar）引用，本文件又被 store 引用，同时布局组件
 * 还依赖 store：顶层 import Layout 会形成
 * `layout → AppSidebar → store/permission → router/dynamic → layout` 的循环，
 * 访问 `component: Layout` 时命中 TDZ（Cannot access 'Layout' before initialization）。
 */
export const dynamicRoutes: AppRouteRecord[] = [
  {
    path: ROUTE_PATHS.system.root,
    name: 'System',
    component: () => import('@/layout/base'),
    redirect: ROUTE_PATHS.system.user,
    meta: { title: '系统管理', icon: 'system' },
    children: [
      {
        path: ROUTE_PATHS.system.user,
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: ROUTE_PATHS.system.role,
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'peoples' }
      },
      {
        path: ROUTE_PATHS.system.menu,
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理', icon: 'tree-table' }
      },
      {
        path: ROUTE_PATHS.system.dept,
        name: 'Dept',
        component: () => import('@/views/system/dept/index.vue'),
        meta: { title: '部门管理', icon: 'tree' }
      },
      {
        path: ROUTE_PATHS.system.post,
        name: 'Post',
        component: () => import('@/views/system/post/index.vue'),
        meta: { title: '岗位管理', icon: 'post' }
      },
      {
        path: ROUTE_PATHS.system.dict,
        name: 'Dict',
        component: () => import('@/views/system/dict/index.vue'),
        meta: { title: '字典管理', icon: 'dict' }
      },
      {
        path: ROUTE_PATHS.system.config,
        name: 'Config',
        component: () => import('@/views/system/config/index.vue'),
        meta: { title: '参数设置', icon: 'edit' }
      },
      {
        path: ROUTE_PATHS.system.notice,
        name: 'Notice',
        component: () => import('@/views/system/notice/index.vue'),
        meta: { title: '通知公告', icon: 'message' }
      },
      {
        path: ROUTE_PATHS.system.log.root,
        name: 'Log',
        component: () => import('@/components/ParentView/index.vue'),
        meta: { title: '日志管理', icon: 'log' },
        children: [
          {
            path: ROUTE_PATHS.system.log.operlog,
            name: 'Operlog',
            component: () => import('@/views/monitor/operlog/index.vue'),
            meta: { title: '操作日志', icon: 'form' }
          },
          {
            path: ROUTE_PATHS.system.log.logininfor,
            name: 'Logininfor',
            component: () => import('@/views/monitor/logininfor/index.vue'),
            meta: { title: '登录日志', icon: 'logininfor' }
          }
        ]
      }
    ]
  },
  {
    path: ROUTE_PATHS.monitor.root,
    name: 'Monitor',
    component: () => import('@/layout/base'),
    redirect: ROUTE_PATHS.monitor.online,
    meta: { title: '系统监控', icon: 'monitor' },
    children: [
      {
        path: ROUTE_PATHS.monitor.online,
        name: 'Online',
        component: () => import('@/views/monitor/online/index.vue'),
        meta: { title: '在线用户', icon: 'online' }
      },
      {
        path: ROUTE_PATHS.monitor.job,
        name: 'Job',
        component: () => import('@/views/monitor/job/index.vue'),
        meta: { title: '定时任务', icon: 'job' }
      },
      {
        path: ROUTE_PATHS.monitor.server,
        name: 'Server',
        component: () => import('@/views/monitor/server/index.vue'),
        meta: { title: '服务监控', icon: 'server' }
      },
      {
        path: ROUTE_PATHS.monitor.cache,
        name: 'Cache',
        component: () => import('@/views/monitor/cache/index.vue'),
        meta: { title: '缓存监控', icon: 'redis' }
      },
      {
        path: ROUTE_PATHS.monitor.cacheList,
        name: 'CacheList',
        component: () => import('@/views/monitor/cache/list.vue'),
        meta: { title: '缓存列表', icon: 'redis-list' }
      }
    ]
  }
]
