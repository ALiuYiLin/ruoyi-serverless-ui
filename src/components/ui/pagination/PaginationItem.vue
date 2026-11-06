<script setup lang="ts">
import type { PaginationListItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/components/ui/button'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { PaginationListItem } from 'reka-ui'
import { buttonVariants } from '@/components/ui/button'

import { radiusClass, type Radius } from '../radius'

const props = withDefaults(defineProps<PaginationListItemProps & {
  size?: ButtonVariants['size']
  /** 圆角配置：默认 sm */
  radius?: Radius
  class?: HTMLAttributes['class']
  isActive?: boolean
}>(), {
  size: 'icon',
  radius: 'sm',
})

const delegatedProps = reactiveOmit(props, 'class', 'size', 'isActive', 'radius')
</script>

<template>
  <PaginationListItem
    data-slot="pagination-item"
    v-bind="delegatedProps"
    :class="cn(
      buttonVariants({
        color: 'default',
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      radiusClass(props.radius),
      props.class)"
  >
    <slot />
  </PaginationListItem>
</template>
