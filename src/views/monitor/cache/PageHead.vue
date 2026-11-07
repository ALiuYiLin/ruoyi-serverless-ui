<script setup lang="ts">
import { Loader2, RefreshCw } from '@lucide/vue'

import Button from '@/components/ui/button/Button.vue'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-col gap-[5px]">
      <h1 class="text-[21px] leading-normal font-semibold tracking-[-0.2px] whitespace-nowrap text-foreground">
        缓存监控
      </h1>
      <p class="text-[12.5px] leading-normal whitespace-nowrap text-muted-foreground">
        <!--  -->
      </p>
    </div>
    <Button variant="outline" radius="md" size="lg" :disabled="loading" @click="emit('refresh')">
      <Loader2 v-if="loading" class="animate-spin" />
      <RefreshCw v-else />
      刷新
    </Button>
  </div>
</template>
