<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from 'cn'
import type {
  FlexAlign,
  FlexDirection,
  FlexGap,
  FlexJustify,
  FlexPadding,
  FlexWrap,
} from './types'

const props = withDefaults(
  defineProps<{
    /** 自定义渲染标签，默认 div */
    component?: string
    /** 排列方向（优先级高于 vertical） */
    direction?: FlexDirection
    /** 是否为垂直方向（保留兼容，等价于 direction="column"） */
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
    /** 四边内边距 */
    padding?: FlexPadding
    /** 水平内边距（左右） */
    paddingX?: FlexPadding
    /** 垂直内边距（上下） */
    paddingY?: FlexPadding
    /** 上内边距 */
    paddingTop?: FlexPadding
    /** 右内边距 */
    paddingRight?: FlexPadding
    /** 下内边距 */
    paddingBottom?: FlexPadding
    /** 左内边距 */
    paddingLeft?: FlexPadding
    class?: HTMLAttributes['class']
  }>(),
  {
    component: 'div',
  }
)

const directionClass: Record<FlexDirection, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
}

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

const paddingSize = {
  sm: 16,
  md: 24,
  lg: 32,
} as const

/** 内边距配置 -> CSS 值；未配置或 default 返回 undefined */
function toPaddingValue(padding?: FlexPadding): string | undefined {
  if (padding === undefined || padding === 'default') {
    return undefined
  }
  const value = padding === 'none' ? 0 : typeof padding === 'number' ? padding : paddingSize[padding]
  return `${value}px`
}

const classes = computed(() =>
  cn(
    'flex',
    props.direction ? directionClass[props.direction] : props.vertical ? 'flex-col' : 'flex-row',
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

  // padding < paddingX / paddingY < 单边 padding，后者覆盖前者
  const padding = toPaddingValue(props.padding)
  if (padding !== undefined) {
    style.padding = padding
  }
  const paddingX = toPaddingValue(props.paddingX)
  if (paddingX !== undefined) {
    style.paddingLeft = paddingX
    style.paddingRight = paddingX
  }
  const paddingY = toPaddingValue(props.paddingY)
  if (paddingY !== undefined) {
    style.paddingTop = paddingY
    style.paddingBottom = paddingY
  }
  const paddingTop = toPaddingValue(props.paddingTop)
  if (paddingTop !== undefined) {
    style.paddingTop = paddingTop
  }
  const paddingRight = toPaddingValue(props.paddingRight)
  if (paddingRight !== undefined) {
    style.paddingRight = paddingRight
  }
  const paddingBottom = toPaddingValue(props.paddingBottom)
  if (paddingBottom !== undefined) {
    style.paddingBottom = paddingBottom
  }
  const paddingLeft = toPaddingValue(props.paddingLeft)
  if (paddingLeft !== undefined) {
    style.paddingLeft = paddingLeft
  }

  return style
})
</script>

<template>
  <component :is="component" :class="classes" :style="style">
    <slot />
  </component>
</template>
