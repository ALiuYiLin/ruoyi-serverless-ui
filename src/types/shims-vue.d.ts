/**
 * Vue 类型兼容声明（临时兼容层，环境声明文件）
 *
 * 背景：项目从 JS 迁移到 TS 尚未完成，业务代码大量依赖 getCurrentInstance()
 * 的宽松代理（proxy.$xxx）以及模板中隐式的 props 类型。直接启用 Vue 官方类型
 * 会在 60+ 个文件中暴露 300+ 处历史类型问题，因此这里暂时以环境模块声明的
 * 形式补齐项目显式导入的 Vue 导出，均为 any，保持与迁移前一致的宽松检查。
 *
 * 其余 Vue API（ref / computed / watch 等）通过 unplugin-auto-import 生成的
 * auto-imports.d.ts 自动导入；但 shadcn-vue 组件是显式 `import { ref } from 'vue'`
 * 的，因此这里也需要提供对应导出。
 *
 * TODO: 完成业务代码类型迁移后删除本文件，改用 Vue 官方类型。
 *
 * 注意：
 * 1. 本文件不能出现顶层 `import` / `export`，否则 `declare module 'vue'` 会变成
 *    模块增强：要么与官方类型合并冲突，要么（若写成脚本文件）直接覆盖官方模块
 *    类型，导致 `import { createApp } from 'vue'` 之类的导入全部失效。
 * 2. 新增对 Vue 的具名导入时，需要在这里补充对应声明，或从 @vue/* 类型来源引入。
 */
declare module 'vue' {
  /** getCurrentInstance() 返回实例的 proxy，保持宽松类型 */
  interface ComponentInternalInstance {
    proxy: any
  }

  /** 入口创建应用（main.ts） */
  export const createApp: any
  /** 应用实例类型（插件 install 签名） */
  export type App = any
  /** 组件类型（env.d.ts 中 .vue 模块声明使用） */
  export type DefineComponent<Props = any, RawBindings = any, D = any> = any

  /* ---- shadcn-vue 组件显式导入的 Vue API（宽松版本） ---- */

  /** 组件类型 */
  export type Component = any
  /** 响应式引用 */
  export type Ref<T = any> = any
  /** 计算属性引用 */
  export type ComputedRef<T = any> = any
  /** DOM 属性类型 */
  export type HTMLAttributes<T = any> = any
  /** 创建响应式引用（保持泛型调用合法，返回宽松 Ref） */
  export function ref<T = any>(value?: T): Ref<T>
  /** 创建计算属性（保持泛型调用合法，返回宽松 ComputedRef） */
  export function computed<T = any>(getter: () => T): ComputedRef<T>
  /** 可写计算属性 */
  export function computed<T = any>(options: { get: () => T; set?: (value: any) => void }): ComputedRef<T>
}
