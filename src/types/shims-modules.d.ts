/**
 * 第三方模块补充声明（环境声明文件，非模块文件）
 *
 * 仅声明“没有自带类型、也没有对应 @types 包”的模块或包内子路径。
 * 自带类型声明的包（element-plus、@element-plus/icons-vue、axios、fuse.js、
 * vue-cropper、js-cookie、pinia、vue-router……）不要在这里声明，
 * 否则会覆盖官方类型、降级为 any。
 */

/** jsencrypt 只对包根提供类型，bin 子路径需要单独声明 */
declare module 'jsencrypt/bin/jsencrypt.min' {
  import JSEncrypt from 'jsencrypt'
  export default JSEncrypt
}
