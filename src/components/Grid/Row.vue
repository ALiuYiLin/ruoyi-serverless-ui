<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, provide } from 'vue'
import { cn } from 'cn'

import { ROW_GUTTER_KEY, type GridGutter } from './context'
import type { RowAlign, RowGutter, RowJustify } from './types'

const props = withDefaults(
  defineProps<{
    /** 自定义渲染标签，默认 div */
    component?: string
    /** 栅格间距：数字（水平），或 [水平, 垂直] */
    gutter?: RowGutter
    /** 主轴对齐方式 */
    justify?: RowJustify
    /** 交叉轴对齐方式 */
    align?: RowAlign
    /** 是否换行，默认 true */
    wrap?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    component: 'div',
    wrap: true,
  }
)

const gutter = computed<GridGutter>(() => {
  const value = props.gutter
  if (Array.isArray(value)) {
    return { horizontal: value[0] ?? 0, vertical: value[1] ?? 0 }
  }
  return { horizontal: value ?? 0, vertical: 0 }
})
provide(ROW_GUTTER_KEY, gutter)

const justifyClass: Record<RowJustify, string> = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
}

const alignClass: Record<RowAlign, string> = {
  top: 'items-start',
  middle: 'items-center',
  bottom: 'items-end',
  stretch: 'items-stretch',
}

const classes = computed(() =>
  cn(
    'flex',
    props.wrap ? 'flex-wrap' : 'flex-nowrap',
    props.justify && justifyClass[props.justify],
    props.align && alignClass[props.align],
    props.class
  )
)

const style = computed<Record<string, string>>(() => {
  const { horizontal, vertical } = gutter.value
  const style: Record<string, string> = {}
  if (horizontal > 0) {
    style.marginLeft = `${-horizontal / 2}px`
    style.marginRight = `${-horizontal / 2}px`
  }
  if (vertical > 0) {
    style.rowGap = `${vertical}px`
  }
  return style
})
</script>

<template>
  <component :is="component" :class="classes" :style="style">
    <slot />
  </component>
</template>
