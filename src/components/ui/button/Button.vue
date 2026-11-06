<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { cn } from 'cn'
import { Primitive } from 'reka-ui'
import { buttonVariants } from '.'

import { radiusClass, type Radius } from '../radius'

interface Props extends PrimitiveProps {
  /** 语义颜色，类似 antd：<Button color="danger"> */
  color?: ButtonVariants['color']
  /** 视觉样式：solid / outline / ghost / link */
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  /** 圆角配置：default 保持默认圆角，none/sm/md/lg/full 覆盖 */
  radius?: Radius
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  color: 'default',
  variant: 'solid',
  radius: 'sm',
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-color="color"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ color, variant, size }), radiusClass(props.radius), props.class)"
  >
    <slot />
  </Primitive>
</template>
