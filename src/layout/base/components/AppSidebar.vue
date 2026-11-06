<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from "@lucide/vue"
import TeamSwitcher from "@/layout/base/components/TeamSwitcher.vue"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"


import usePermissionStore from '@/store/modules/permission'
import NavMenu from "./NavMenu.vue";

const permissionStore = usePermissionStore()

const sidebarRouters = computed(() => permissionStore.sidebarRouters)

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMenu :sidebarRouters="sidebarRouters" />
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
