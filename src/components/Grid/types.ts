/** Row 主轴对齐方式 */
export type RowJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'

/** Row 交叉轴对齐方式 */
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch'

/** 栅格间距：数字（水平），或 [水平, 垂直] */
export type RowGutter = number | [number, number]
