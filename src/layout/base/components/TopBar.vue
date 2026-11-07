<script setup lang="ts">
import { Bell, Moon, Sun } from '@lucide/vue'

import Flex from '@/components/Flex/Flex.vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import useSettingsStore from '@/store/modules/settings'
import useUserStore from '@/store/modules/user'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

/** 仓库地址（取自 git remote） */
const repoUrl = 'https://github.com/ALiuYiLin/ruoyi-serverless-ui'

const userName = computed(() => userStore.nickName || userStore.name || '')
const userInitial = computed(() => userName.value.charAt(0) || '?')

/** 切换到指定主题 */
function setTheme(dark: boolean) {
  if (settingsStore.isDark !== dark) {
    settingsStore.toggleTheme()
  }
}
</script>

<template>
  <Flex align="center" :gap="12">
    <!-- 通知 -->
    <Button
      variant="outline"
      size="icon-sm"
      radius="md"
      class="relative size-[34px]"
      title="通知"
    >
      <Bell />
      <span class="absolute top-[7px] right-[5px] size-[7px] rounded-full bg-red-500" />
      <span class="sr-only">通知</span>
    </Button>

    <!-- GitHub 源码 -->
    <Button variant="outline" size="icon-sm" radius="md" class="size-[34px]" as-child title="GitHub 源码">
      <a :href="repoUrl" target="_blank" rel="noopener noreferrer">
        <SvgIcon icon-class="github" />
        <span class="sr-only">GitHub 源码</span>
      </a>
    </Button>

    <!-- 主题切换（日/月分段式开关） -->
    <Flex align="center" :gap="2" class="h-[34px] rounded-[8px] bg-muted p-[3px]">
      <button
        type="button"
        class="flex size-7 items-center justify-center rounded-[6px] border border-transparent transition-colors cursor-pointer"
        :class="!settingsStore.isDark
          ? 'border-border bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'"
        title="浅色模式"
        @click="setTheme(false)"
      >
        <Sun class="size-[15px]" />
        <span class="sr-only">浅色模式</span>
      </button>
      <button
        type="button"
        class="flex size-7 items-center justify-center rounded-[6px] border border-transparent transition-colors"
        :class="settingsStore.isDark
          ? 'border-border bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'"
        title="暗色模式"
        @click="setTheme(true)"
      >
        <Moon class="size-[15px]" />
        <span class="sr-only">暗色模式</span>
      </button>
    </Flex>

    <Separator orientation="vertical" class="h-[22px]" />

    <!-- 用户信息 -->
    <Flex align="center" :gap="9">
      <div class="flex size-[29px] items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
        <img v-if="userStore.avatar" :src="userStore.avatar" alt="" class="size-full object-cover" />
        <span v-else class="text-xs font-medium">{{ userInitial }}</span>
      </div>
      <span class="text-[13px] font-medium whitespace-nowrap text-foreground">{{ userName }}</span>
    </Flex>
  </Flex>
</template>
