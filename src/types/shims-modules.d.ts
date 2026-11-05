/**
 * 第三方模块补充声明（环境声明文件，非模块文件）
 *
 * 仅声明“没有自带类型、也没有对应 @types 包”的模块或包内子路径。
 * 自带类型声明的包（element-plus、axios、element-plus/icons-vue、pinia、
 * vue-router、echarts、fuse.js、vue-cropper、@vueup/vue-quill、clipboard、
 * js-cookie……）不要在这里声明，否则会覆盖官方类型、降级为 any。
 */

/** jsencrypt 只对包根提供类型，bin 子路径需要单独声明 */
declare module 'jsencrypt/bin/jsencrypt.min' {
  import JSEncrypt from 'jsencrypt'
  export default JSEncrypt
}

/** vuedraggable 的类型只声明在包根，dist 子路径需要单独声明 */
declare module 'vuedraggable/dist/vuedraggable.common' {
  import type { DefineComponent } from 'vue'
  const draggable: DefineComponent
  export default draggable
}
