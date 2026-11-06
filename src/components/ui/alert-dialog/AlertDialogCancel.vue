<script setup lang="ts">
import type { AlertDialogCancelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/components/ui/button'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { AlertDialogCancel } from 'reka-ui'
import { buttonVariants } from '@/components/ui/button'

import { radiusClass, type Radius } from '../radius'

const props = withDefaults(
  defineProps<AlertDialogCancelProps & {
    class?: HTMLAttributes['class']
    /** 语义颜色，与 Button 一致 */
    color?: ButtonVariants['color']
    variant?: ButtonVariants['variant']
    size?: ButtonVariants['size']
    /** 圆角配置：默认 sm */
    radius?: Radius
  }>(),
  {
    color: 'default',
    variant: 'outline',
    size: 'default',
    radius: 'sm',
  },
)

const delegatedProps = reactiveOmit(props, 'class', 'color', 'variant', 'size', 'radius')
</script>

<template>
  <AlertDialogCancel
    data-slot="alert-dialog-cancel"
    v-bind="delegatedProps"
    :class="cn(
      buttonVariants({ color, variant, size }),
      radiusClass(props.radius),
      props.class,
    )"
  >
    <slot />
  </AlertDialogCancel>
</template>
