/**
 * 权限工具专用的 request 桩。
 *
 * `src/api/**` 顶层会 import `@/utils/request`，真实实现会引入 element-plus、
 * file-saver 等浏览器依赖，在 Node 里无法直接加载；权限工具只需要 API 常量，
 * 因此把它们替换成这个桩（任何请求调用都说明工具用错了模块）。
 */
const request = () => {
  throw new Error('perm tool: request stub should never be called')
}

export const download = () => {
  throw new Error('perm tool: download stub should never be called')
}

export default request
