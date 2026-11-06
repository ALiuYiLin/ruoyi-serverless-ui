<script setup lang="ts">
import type { PaginationNextProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/components/ui/button'
import { ChevronRightIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import { cn } from 'cn'
import { PaginationNext, useForwardProps } from 'reka-ui'
import { buttonVariants } from '@/components/ui/button'

import { radiusClass, type Radius } from '../radius'

const props = withDefaults(defineProps<PaginationNextProps & {
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
  <PaginationNext
    data-slot="pagination-next"
    :class="cn(buttonVariants({ color: 'default', variant: 'ghost', size }), radiusClass(props.radius), 'pr-2!', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <span class="hidden sm:block">Next</span>
      <ChevronRightIcon data-icon="inline-end" class="cn-rtl-flip" />
    </slot>
  </PaginationNext>
</template>
