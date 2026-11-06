<script setup lang="ts">
import type { LucideIcon } from "@lucide/vue"
import { ChevronRight } from "@lucide/vue"
import { computed } from "vue"
import { useRoute } from "vue-router"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { isExternal } from "@/utils/validate"

/** 侧边栏菜单节点（由 NavProjects 过滤/规范化后传入） */
interface SidebarMenuNode {
  key: string
  title: string
  path: string
  icon?: LucideIcon
  children?: SidebarMenuNode[]
}

defineOptions({ name: "NavProjectsItem" })

const props = withDefaults(
  defineProps<{
    item: SidebarMenuNode
    /** 层级：0 为顶层菜单，>0 为子菜单 */
    depth?: number
  }>(),
  { depth: 0 }
)

const route = useRoute()

const children = computed(() => props.item.children ?? [])
const hasChildren = computed(() => children.value.length > 0)
const isExternalLink = computed(() => isExternal(props.item.path))

/** 当前路由是否落在该菜单（含任意子菜单）下 */
const isActive = computed(() => {
  const current = route.path
  if (current === props.item.path) {
    return true
  }
  return children.value.some(child => current === child.path || current.startsWith(`${child.path}/`))
})
</script>

<template>
  <!-- 顶层：有子菜单 -> 可折叠分组 -->
  <Collapsible v-if="depth === 0 && hasChildren" as-child class="group/collapsible">
    <SidebarMenuItem>
      <CollapsibleTrigger as-child>
        <SidebarMenuButton :tooltip="item.title" :is-active="isActive">
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ item.title }}</span>
          <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          <NavProjectsItem
            v-for="child in children"
            :key="child.key"
            :item="child"
            :depth="depth + 1"
          />
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuItem>
  </Collapsible>

  <!-- 顶层：叶子菜单 -->
  <SidebarMenuItem v-else-if="depth === 0">
    <SidebarMenuButton as-child :is-active="isActive">
      <a v-if="isExternalLink" :href="item.path" target="_blank" rel="noopener">
        <component :is="item.icon" v-if="item.icon" />
        <span>{{ item.title }}</span>
      </a>
      <router-link v-else :to="item.path">
        <component :is="item.icon" v-if="item.icon" />
        <span>{{ item.title }}</span>
      </router-link>
    </SidebarMenuButton>
  </SidebarMenuItem>

  <!-- 子级：有子菜单 -> 继续嵌套 -->
  <Collapsible v-else-if="hasChildren" as-child class="group/collapsible">
    <SidebarMenuSubItem>
      <CollapsibleTrigger as-child>
        <SidebarMenuSubButton :is-active="isActive">
          <component :is="item.icon" v-if="item.icon" />
          <span>{{ item.title }}</span>
          <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </SidebarMenuSubButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          <NavProjectsItem
            v-for="child in children"
            :key="child.key"
            :item="child"
            :depth="depth + 1"
          />
        </SidebarMenuSub>
      </CollapsibleContent>
    </SidebarMenuSubItem>
  </Collapsible>

  <!-- 子级：叶子菜单 -->
  <SidebarMenuSubItem v-else>
    <SidebarMenuSubButton as-child :is-active="isActive">
      <a v-if="isExternalLink" :href="item.path" target="_blank" rel="noopener">
        <component :is="item.icon" v-if="item.icon" />
        <span>{{ item.title }}</span>
      </a>
      <router-link v-else :to="item.path">
        <component :is="item.icon" v-if="item.icon" />
        <span>{{ item.title }}</span>
      </router-link>
    </SidebarMenuSubButton>
  </SidebarMenuSubItem>
</template>
