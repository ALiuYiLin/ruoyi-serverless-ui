import {
  BookA,
  Briefcase,
  DatabaseZap,
  FilePen,
  GitBranch,
  LayoutDashboard,
  List,
  LogIn,
  MessageSquare,
  Monitor,
  ScrollText,
  Server,
  Settings2,
  SquarePen,
  Table2,
  Timer,
  User,
  Users,
  Wifi,
  type LucideIcon
} from '@lucide/vue'
import { ROUTE_PATHS } from './routes'

/** 侧边栏菜单节点（与 NavMenu 的渲染结构一致） */
export interface SidebarMenuNode {
  key: string
  title: string
  path: string
  icon?: LucideIcon
  children?: SidebarMenuNode[]
}

/**
 * 侧边栏菜单（静态配置，当前未被使用）。
 *
 * - 顺序、层级与侧边栏现状一致：首页 + 系统管理 + 系统监控；
 *   日志管理作为系统管理下的二级分组（对应 `/system/log/...`）。
 * - path 全部取自 `./routes` 的 ROUTE_PATHS，与公共路由、业务路由共用同一份常量。
 * - 图标与 NavMenu 的 iconMap 对应（system→Settings2、peoples→Users …）。
 */
export const sidebarMenus: SidebarMenuNode[] = [
  {
    key: 'Index',
    title: '首页',
    path: ROUTE_PATHS.common.index,
    icon: LayoutDashboard
  },
  {
    key: 'System',
    title: '系统管理',
    path: ROUTE_PATHS.system.root,
    icon: Settings2,
    children: [
      {
        key: 'User',
        title: '用户管理',
        path: ROUTE_PATHS.system.user,
        icon: User
      },
      {
        key: 'Role',
        title: '角色管理',
        path: ROUTE_PATHS.system.role,
        icon: Users
      },
      {
        key: 'Menu',
        title: '菜单管理',
        path: ROUTE_PATHS.system.menu,
        icon: Table2
      },
      {
        key: 'Dept',
        title: '部门管理',
        path: ROUTE_PATHS.system.dept,
        icon: GitBranch
      },
      {
        key: 'Post',
        title: '岗位管理',
        path: ROUTE_PATHS.system.post,
        icon: Briefcase
      },
      {
        key: 'Dict',
        title: '字典管理',
        path: ROUTE_PATHS.system.dict,
        icon: BookA
      },
      {
        key: 'Config',
        title: '参数设置',
        path: ROUTE_PATHS.system.config,
        icon: SquarePen
      },
      {
        key: 'Notice',
        title: '通知公告',
        path: ROUTE_PATHS.system.notice,
        icon: MessageSquare
      },
      {
        key: 'Log',
        title: '日志管理',
        path: ROUTE_PATHS.system.log.root,
        icon: ScrollText,
        children: [
          {
            key: 'Operlog',
            title: '操作日志',
            path: ROUTE_PATHS.system.log.operlog,
            icon: FilePen
          },
          {
            key: 'Logininfor',
            title: '登录日志',
            path: ROUTE_PATHS.system.log.logininfor,
            icon: LogIn
          }
        ]
      }
    ]
  },
  {
    key: 'Monitor',
    title: '系统监控',
    path: ROUTE_PATHS.monitor.root,
    icon: Monitor,
    children: [
      {
        key: 'Online',
        title: '在线用户',
        path: ROUTE_PATHS.monitor.online,
        icon: Wifi
      },
      {
        key: 'Job',
        title: '定时任务',
        path: ROUTE_PATHS.monitor.job,
        icon: Timer
      },
      {
        key: 'Server',
        title: '服务监控',
        path: ROUTE_PATHS.monitor.server,
        icon: Server
      },
      {
        key: 'Cache',
        title: '缓存监控',
        path: ROUTE_PATHS.monitor.cache,
        icon: DatabaseZap
      },
      {
        key: 'CacheList',
        title: '缓存列表',
        path: ROUTE_PATHS.monitor.cacheList,
        icon: List
      }
    ]
  }
]
