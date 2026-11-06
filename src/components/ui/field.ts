/** 输入类组件（Input / SelectTrigger / ...）的视觉变体，类似 antd 的 variant */
export type FieldVariant = 'outlined' | 'filled' | 'borderless' | 'underlined'

/** 各视觉变体对应的边框/背景样式 */
export const fieldVariantClass: Record<FieldVariant, string> = {
  outlined: 'border-input bg-transparent',
  filled: 'border-transparent bg-input/50',
  borderless: 'border-0 bg-transparent shadow-none',
  underlined: 'rounded-none border-x-0 border-t-0 border-b border-input bg-transparent',
}
