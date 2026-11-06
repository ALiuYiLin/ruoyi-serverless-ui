<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, inject } from 'vue'
import { cn } from 'cn'

import { ROW_GUTTER_KEY } from './context'

const props = withDefaults(
  defineProps<{
    /** 自定义渲染标签，默认 div */
    component?: string
    /** 栅格占位格数（0-24），不传则按内容宽度 */
    span?: number
    /** 左侧间隔格数（0-24） */
    offset?: number
    /** 栅格顺序 */
    order?: number
    /** 向右移动格数（0-24） */
    push?: number
    /** 向左移动格数（0-24） */
    pull?: number
    class?: HTMLAttributes['class']
  }>(),
  {
    component: 'div',
  }
)

const gutter = inject(ROW_GUTTER_KEY, undefined)

/** 格数 -> 百分比 */
function toPercent(value?: number): string | undefined {
  if (value === undefined) {
    return undefined
  }
  return `${(value / 24) * 100}%`
}

const style = computed<Record<string, string | number>>(() => {
  const style: Record<string, string | number> = {}

  const span = toPercent(props.span)
  if (span) {
    style.flex = `0 0 ${span}`
    style.maxWidth = span
  }

  const offset = toPercent(props.offset)
  if (offset) {
    style.marginLeft = offset
  }

  if (props.order !== undefined) {
    style.order = props.order
  }

  const push = toPercent(props.push)
  if (push) {
    style.position = 'relative'
    style.left = push
  }

  const pull = toPercent(props.pull)
  if (pull) {
    style.position = 'relative'
    style.right = pull
  }

  const horizontal = gutter?.value.horizontal ?? 0
  if (horizontal > 0) {
    style.paddingLeft = `${horizontal / 2}px`
    style.paddingRight = `${horizontal / 2}px`
  }

  return style
})

const classes = computed(() => cn('box-border min-w-0 flex-none', props.class))
</script>

<template>
  <component :is="component" :class="classes" :style="style">
    <slot />
  </component>
</template>
