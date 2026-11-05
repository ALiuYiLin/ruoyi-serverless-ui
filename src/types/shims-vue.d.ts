/**
 * Vue 类型兼容声明（临时兼容层，环境声明文件）
 *
 * 背景：项目从 JS 迁移到 TS 尚未完成，业务代码大量依赖 getCurrentInstance()
 * 的宽松代理（proxy.$xxx）以及模板中隐式的 props 类型。直接启用 Vue 官方类型
 * 会在 60+ 个文件中暴露 300+ 处历史类型问题，因此这里暂时以环境模块声明的
 * 形式补齐项目显式导入的 Vue 导出，均为 any，保持与迁移前一致的宽松检查。
 *
 * 其余 Vue API（ref / computed / watch 等）通过 unplugin-auto-import 生成的
 * auto-imports.d.ts 自动导入，不需要在此声明。
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
}
