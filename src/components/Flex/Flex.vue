<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from 'cn'
import type { FlexAlign, FlexGap, FlexJustify, FlexWrap } from './types'

const props = withDefaults(
  defineProps<{
    /** 自定义渲染标签，默认 div */
    component?: string
    /** 是否为垂直方向 */
    vertical?: boolean
    /** 是否换行，或指定换行方式 */
    wrap?: FlexWrap
    /** 主轴对齐方式 */
    justify?: FlexJustify
    /** 交叉轴对齐方式 */
    align?: FlexAlign
    /** 间距：small=8 / middle=16 / large=24 / 自定义像素 */
    gap?: FlexGap
    /** flex 简写属性（作用于容器本身） */
    flex?: string | number
    class?: HTMLAttributes['class']
  }>(),
  {
    component: 'div',
  }
)

const justifyClass: Record<FlexJustify, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
}

const alignClass: Record<FlexAlign, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
}

const gapSize = {
  small: 8,
  middle: 16,
  large: 24,
} as const

const classes = computed(() =>
  cn(
    'flex',
    props.vertical ? 'flex-col' : 'flex-row',
    props.wrap === true && 'flex-wrap',
    props.wrap === false && 'flex-nowrap',
    props.wrap === 'nowrap' && 'flex-nowrap',
    props.wrap === 'wrap' && 'flex-wrap',
    props.wrap === 'wrap-reverse' && 'flex-wrap-reverse',
    props.justify && justifyClass[props.justify],
    props.align && alignClass[props.align],
    props.class
  )
)

const style = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  if (props.gap !== undefined) {
    const gap = typeof props.gap === 'number' ? props.gap : gapSize[props.gap]
    style.gap = `${gap}px`
  }
  if (props.flex !== undefined) {
    style.flex = typeof props.flex === 'number' ? String(props.flex) : props.flex
  }
  return style
})
</script>

<template>
  <component :is="component" :class="classes" :style="style">
    <slot />
  </component>
</template>
