<script setup lang="ts">
import { Plus, RefreshCw } from '@lucide/vue'
import { ElMessage } from 'element-plus'

import Flex from '@/components/Flex/Flex.vue'
import Button from '@/components/ui/button/Button.vue'
import useSystemConfigStore from '@/store/system/config'

const configStore = useSystemConfigStore()

async function handleRefreshCache() {
  try {
    await configStore.refreshCache()
    ElMessage.success('刷新缓存成功')
  } catch {
    // 请求拦截器已统一提示错误
  }
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-col gap-[5px]">
      <h1 class="text-[21px] leading-normal font-semibold tracking-[-0.2px] whitespace-nowrap text-foreground">
        参数设置
      </h1>
      <p class="text-[12.5px] leading-normal whitespace-nowrap text-muted-foreground">
        <!--  -->
      </p>
    </div>
    <Flex :gap="8">
      <Button variant="outline" radius="md" size="lg" @click="handleRefreshCache">
        <RefreshCw />
        刷新缓存
      </Button>
      <Button color="primary" radius="md" size="lg" @click="configStore.openAddForm()">
        <Plus />
        新增
      </Button>
    </Flex>
  </div>
</template>
