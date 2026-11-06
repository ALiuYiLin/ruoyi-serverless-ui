<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from 'cn'

import type { SpaceAlign, SpaceDirection, SpaceSize } from './types'

const props = withDefaults(
  defineProps<{
    /** 自定义渲染标签，默认 div */
    component?: string
    /** 间距：small=8 / middle=16 / large=24 / 自定义像素 / [水平, 垂直] */
    size?: SpaceSize | [SpaceSize, SpaceSize]
    /** 排列方向，默认 horizontal */
    direction?: SpaceDirection
    /** 交叉轴对齐方式（horizontal 方向下生效） */
    align?: SpaceAlign
    /** 是否换行 */
    wrap?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    component: 'div',
    direction: 'horizontal',
  }
)

const sizeMap = {
  small: 8,
  middle: 16,
  large: 24,
} as const

function toPx(size: SpaceSize): string {
  return `${typeof size === 'number' ? size : sizeMap[size]}px`
}

const gap = computed(() => {
  if (Array.isArray(props.size)) {
    const [horizontal, vertical] = props.size
    return `${toPx(vertical)} ${toPx(horizontal)}`
  }
  const value = toPx(props.size ?? 'small')
  return `${value} ${value}`
})

const alignClass: Record<SpaceAlign, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
}

const classes = computed(() =>
  cn(
    'inline-flex',
    props.direction === 'vertical' ? 'flex-col' : 'flex-row',
    props.wrap && 'flex-wrap',
    props.align && alignClass[props.align],
    props.class
  )
)

const style = computed(() => ({ gap: gap.value }))
</script>

<template>
  <component :is="component" :class="classes" :style="style">
    <slot />
  </component>
</template>
