<script lang="ts" setup>
import Flex from "@/components/Flex/Flex.vue"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import TopBar from "@/layout/base/components/TopBar.vue"

const route = useRoute()

/** 当前路由匹配到的菜单标题，用于面包屑/页面名称展示 */
const breadcrumbs = computed(() =>
  route.matched
    .filter(item => item.meta?.title)
    .map(item => ({
      title: item.meta.title as string,
      path: item.path,
    })),
)
</script>
<template>
  <header
    class="justify-between border-b-2 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
  >
    <div class="flex items-center gap-2 px-4">
      <SidebarTrigger class="-ml-1" />
      <Separator
        orientation="vertical"
        class="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <template v-for="(item, index) in breadcrumbs" :key="item.path">
            <BreadcrumbSeparator v-if="index > 0" class="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage v-if="index === breadcrumbs.length - 1">
                {{ item.title }}
              </BreadcrumbPage>
              <BreadcrumbLink v-else as-child>
                <RouterLink :to="item.path">{{ item.title }}</RouterLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </template>
          <BreadcrumbItem v-if="!breadcrumbs.length">
            <BreadcrumbPage>-</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <TopBar class="pr-7" />
  </header>
</template>
