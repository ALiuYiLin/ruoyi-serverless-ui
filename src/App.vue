<template>
  <router-view />
  <!-- 侧边栏演示页是全屏布局，这里提供一个返回后台的入口 -->
  <router-link v-if="isDemoRoute" to="/index" class="demo-back-link">
    ← 返回后台
  </router-link>
</template>

<script setup lang="ts">
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'

const route = useRoute()
const isDemoRoute = computed(() => Boolean(route.meta.demo))

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>

<style scoped>
.demo-back-link {
  position: fixed;
  top: 12px;
  right: 16px;
  z-index: 100;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  line-height: 1;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999px;
  text-decoration: none;
  backdrop-filter: blur(4px);
  transition: background-color 0.2s;
}

.demo-back-link:hover {
  background: rgba(0, 0, 0, 0.75);
}
</style>
