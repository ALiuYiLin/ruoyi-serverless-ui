/**
 * 全局环境类型声明（环境声明文件，非模块文件）
 *
 * 注意：本文件不能出现顶层 `import` / `export`，否则其中的 `declare module`
 * 会变成“模块增强”，必须目标模块存在且可合并，无法声明通配模块。
 */

/** `.vue` 单文件组件模块声明 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/** Vite 环境变量类型 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
