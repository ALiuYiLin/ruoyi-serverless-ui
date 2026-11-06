<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

import AppSidebar from "@/layout/base/components/AppSidebar.vue"
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
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

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
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="border-b-2 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
      </header>
      <!-- <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="bg-muted/50 aspect-video rounded-xl" />
          <div class="bg-muted/50 aspect-video rounded-xl" />
          <div class="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div> -->
      <div class="main-content">
        <RouterView></RouterView>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
<style scoped>
.main-content{
  padding: 18px 24px;
  flex: 1;
}
</style>
