<script setup lang="ts">
import type { PaginationPrevProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/components/ui/button'
import { ChevronLeftIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { PaginationPrev, useForwardProps } from 'reka-ui'
import { buttonVariants } from '@/components/ui/button'

import { radiusClass, type Radius } from '../radius'

const props = withDefaults(defineProps<PaginationPrevProps & {
  size?: ButtonVariants['size']
  /** 圆角配置：默认 sm */
  radius?: Radius
  class?: HTMLAttributes['class']
}>(), {
  size: 'default',
  radius: 'sm',
})

const delegatedProps = reactiveOmit(props, 'class', 'size', 'radius')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationPrev
    data-slot="pagination-previous"
    :class="cn(buttonVariants({ color: 'default', variant: 'ghost', size }), radiusClass(props.radius), 'pl-2!', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronLeftIcon data-icon="inline-start" class="cn-rtl-flip" />
      <span class="hidden sm:block">Previous</span>
    </slot>
  </PaginationPrev>
</template>
