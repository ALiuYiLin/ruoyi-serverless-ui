<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from 'cn'

import { radiusClass, type Radius } from '../radius'
import type { InputVariant } from './types'

const props = withDefaults(
  defineProps<{
    defaultValue?: string | number
    modelValue?: string | number
    /** 视觉变体：outlined 默认 / filled / borderless / underlined */
    variant?: InputVariant
    /** 圆角配置：default 保持默认圆角，none/sm/md/lg/full 覆盖 */
    radius?: Radius
    class?: HTMLAttributes['class']
  }>(),
  {
    variant: 'outlined',
    radius: 'sm',
  }
)

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

/** 各视觉变体对应的边框/背景样式 */
const variantClass: Record<InputVariant, string> = {
  outlined: 'border-input bg-transparent',
  filled: 'border-transparent bg-input/50',
  borderless: 'border-0 bg-transparent shadow-none',
  underlined: 'rounded-none border-x-0 border-t-0 border-b border-input bg-transparent',
}
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :data-variant="variant"
    :class="cn(
      'bg-input/50 border-transparent focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-9 rounded-3xl border px-3 py-1 text-base transition-[color,box-shadow,background-color] file:h-7 file:text-sm file:font-medium focus-visible:ring-3 aria-invalid:ring-3 md:text-sm w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
      radiusClass(props.radius),
      variantClass[props.variant],
      props.class,
    )"
  >
</template>
