/** 组件的内边距配置 */
export type Padding = 'default' | 'none' | 'sm' | 'md' | 'lg' | number

const paddingSizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
} as const

/**
 * 将 padding 配置转换为内联样式
 *
 * - `default` / 未传：返回 undefined，保持组件自身默认内边距；
 * - `none`：0；
 * - `sm/md/lg`：16/24/32px；
 * - `number`：自定义像素值。
 *
 * 使用内联样式而不是 `p-*` 类，是为了能稳定覆盖组件内部
 * `data-[size=sm]:py-4` 这类带变体的默认内边距（内联样式优先级最高）。
 */
export function paddingStyle(padding?: Padding): Record<string, string> | undefined {
  if (padding === undefined || padding === 'default') {
    return undefined
  }
  const value = padding === 'none' ? 0 : typeof padding === 'number' ? padding : paddingSizeMap[padding]
  return { padding: `${value}px` }
}
