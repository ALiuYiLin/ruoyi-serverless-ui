<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolveLink(onlyOneChild.path, onlyOneChild.query)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <svg-icon :icon-class="onlyOneChild.meta.icon ?? item.meta?.icon ?? ''"/>
          <template #title><span class="menu-title" :title="hasTitle(onlyOneChild.meta.title)">{{ onlyOneChild.meta.title }}</span></template>
        </el-menu-item>
      </app-link>
    </template>

    <el-sub-menu v-else ref="subMenu" :index="resolvePath(item.path)" teleported>
      <template v-if="item.meta" #title>
        <svg-icon :icon-class="item.meta.icon ?? ''" />
        <span class="menu-title" :title="hasTitle(item.meta.title)">{{ item.meta.title }}</span>
      </template>

      <sidebar-item
        v-for="(child, index) in item.children || []"
        :key="child.path + index"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { isExternal } from '@/utils/validate'
import AppLink from './Link.vue'
import { getNormalPath } from '@/utils/ruoyi'
import type { AppRouteRecord } from '@/types'

/** 侧边栏路由（附带 hasOneShowingChild 计算出的标记） */
type SidebarRoute = AppRouteRecord & { noShowingChildren?: boolean }

const props = defineProps({
  // route object
  item: {
    type: Object as PropType<AppRouteRecord>,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})

const onlyOneChild = ref<SidebarRoute>({ path: '' })

function hasOneShowingChild(children: AppRouteRecord[] = [], parent: AppRouteRecord): boolean {
  if (!children) {
    children = []
  }
  const showingChildren = children.filter(item => {
    if (item.hidden) {
      return false
    }
    onlyOneChild.value = item
    return true
  })

  // When there is only one child router, the child router is displayed by default
  if (showingChildren.length === 1) {
    return true
  }

  // Show parent if there are no child router to display
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }

  return false
}

/** 菜单 index（el-menu-item / el-sub-menu 的 index） */
function resolvePath(routePath: string): string {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return getNormalPath(props.basePath + '/' + routePath)
}

/** 链接地址（支持携带 query） */
function resolveLink(routePath: string, routeQuery?: string): RouteLocationRaw {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  if (routeQuery) {
    const query: Record<string, string> = JSON.parse(routeQuery)
    return { path: getNormalPath(props.basePath + '/' + routePath), query }
  }
  return getNormalPath(props.basePath + '/' + routePath)
}

function hasTitle(title?: string): string {
  if (title && title.length > 5) {
    return title
  } else {
    return ""
  }
}
</script>
