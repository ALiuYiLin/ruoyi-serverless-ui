<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from 'cn'

import { paddingStyle, type Padding } from '../padding'
import { radiusClass, type Radius } from '../radius'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  size?: 'default' | 'sm'
  /** 圆角配置：default 保持默认圆角，none/sm/md/lg/full 覆盖 */
  radius?: Radius
  /** 内边距配置：default 保持默认内边距，none/sm/md/lg 或自定义像素值覆盖 */
  padding?: Padding
}>(), {
  size: 'default',
  radius: 'default',
  padding: 'default',
})
</script>

<template>
  <div
    data-slot="card"
    :data-size="size"
    :style="paddingStyle(props.padding)"
    :class="cn('bg-card text-card-foreground ring-foreground/5 dark:ring-foreground/10 gap-6 overflow-hidden rounded-4xl py-6 text-sm shadow-md ring-1 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-4xl *:[img:last-child]:rounded-b-4xl group/card flex flex-col', radiusClass(props.radius), props.class)"
  >
    <slot />
  </div>
</template>
