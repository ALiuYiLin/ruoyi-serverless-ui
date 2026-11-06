/** 组件的圆角配置 */
export type Radius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'full'

const radiusClassMap: Record<Radius, string> = {
  default: '',
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

/**
 * 将 radius 配置转换为 Tailwind 圆角类
 *
 * `default` 返回空串，保持组件自身默认圆角；其余值通过 `cn()` 合并覆盖默认圆角。
 */
export function radiusClass(radius?: Radius): string {
  if (!radius) {
    return ''
  }
  return radiusClassMap[radius] ?? ''
}
