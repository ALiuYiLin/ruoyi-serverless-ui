<script setup lang="ts">
import type { LucideIcon } from "@lucide/vue"
import {
  BookA,
  BookOpen,
  Braces,
  Briefcase,
  Code,
  Database,
  DatabaseZap,
  FilePen,
  Folder,
  GitBranch,
  Hammer,
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
  Toolbox,
  User,
  Users,
  Wifi,
} from "@lucide/vue"

import { SidebarMenu } from "@/components/ui/sidebar"
import { isExternal } from "@/utils/validate"
import { getNormalPath } from "@/utils/ruoyi"
import type { AppRouteRecord } from "@/types"
import NavMenuItem from "./NavMenuItem.vue"
/** 侧边栏菜单节点（过滤、路径补全后交给 NavsidebarRoutersItem 递归渲染） */
interface SidebarMenuNode {
  key: string
  title: string
  path: string
  icon?: LucideIcon
  children?: SidebarMenuNode[]
}

const props = defineProps<{
  sidebarRouters: AppRouteRecord[]
}>()

/**
 * 若依菜单 svg 图标名 -> lucide 图标
 *
 * 后台菜单的 meta.icon 是若依自带 svg 图标名称（src/assets/icons/svg），
 * 迁移到 shadcn 布局后统一在这里映射为对应的 lucide 图标。
 */
const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  system: Settings2,
  monitor: Monitor,
  tool: Toolbox,
  guide: BookOpen,
  user: User,
  peoples: Users,
  'tree-table': Table2,
  tree: GitBranch,
  post: Briefcase,
  dict: BookA,
  edit: SquarePen,
  message: MessageSquare,
  log: ScrollText,
  online: Wifi,
  job: Timer,
  druid: Database,
  server: Server,
  redis: DatabaseZap,
  'redis-list': List,
  build: Hammer,
  code: Code,
  swagger: Braces,
  form: FilePen,
  logininfor: LogIn,
}

/** 解析菜单图标：若传的是若依图标名则查表，未知/缺省时回退到 Folder */
function resolveIcon(icon?: string | LucideIcon): LucideIcon | undefined {
  if (!icon) {
    return undefined
  }
  if (typeof icon === "string") {
    return iconMap[icon] ?? Folder
  }
  return icon
}

/** 拼接菜单完整路径（相对子路径基于父路径补全，外链原样返回） */
function resolvePath(basePath: string, routePath?: string): string {
  if (!routePath) {
    return basePath
  }
  if (isExternal(routePath)) {
    return routePath
  }
  if (routePath.startsWith("/")) {
    return routePath
  }
  return getNormalPath(`${basePath}/${routePath}`)
}

/**
 * 过滤并规范化菜单：
 * - 丢弃 hidden 路由；
 * - 没有 meta.title 的分组（如常量路由 path:''）把可见子菜单提升到当前层级；
 * - 其余转换为统一节点，子菜单递归处理，供模板嵌套展示。
 */
function toMenuNodes(routes: AppRouteRecord[], basePath = ""): SidebarMenuNode[] {
  const nodes: SidebarMenuNode[] = []
  routes.forEach((route) => {
    if (route.hidden) {
      return
    }
    const fullPath = resolvePath(basePath, route.path)
    const children = toMenuNodes(route.children ?? [], fullPath)
    const title = route.meta?.title
    // 无标题的分组（常量路由 path:'' 等）：直接把子菜单提升到当前层级
    if (!title) {
      nodes.push(...children)
      return
    }
    nodes.push({
      key: route.name ?? fullPath,
      title,
      path: route.meta?.link ?? fullPath,
      icon: resolveIcon(route.meta?.icon),
      children,
    })
  })
  return nodes
}

const menus = computed(() => toMenuNodes(props.sidebarRouters))
</script>

<template>
  <SidebarMenu>
    <NavMenuItem v-for="menu in menus" :key="menu.key" :item="menu" />
  </SidebarMenu>
</template>
