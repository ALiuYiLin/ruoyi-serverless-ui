/** Flex 主轴对齐方式 */
export type FlexJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

/** Flex 交叉轴对齐方式 */
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

/** Flex 间距：small=8 / middle=16 / large=24 / 自定义像素 */
export type FlexGap = 'small' | 'middle' | 'large' | number

/** Flex 换行方式 */
export type FlexWrap = boolean | 'nowrap' | 'wrap' | 'wrap-reverse'
