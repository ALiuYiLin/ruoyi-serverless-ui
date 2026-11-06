import type { ComputedRef, InjectionKey } from 'vue'

/** Row 传递给 Col 的间距（px） */
export interface GridGutter {
  horizontal: number
  vertical: number
}

export const ROW_GUTTER_KEY: InjectionKey<ComputedRef<GridGutter>> = Symbol('row-gutter')
