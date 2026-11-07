<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import AppSidebar from "@/layout/base/components/AppSidebar.vue"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import MainTop from "./components/MainTop.vue"
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <MainTop></MainTop>
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
