/**
 * Vue 全局属性类型增强
 *
 * main.ts 与 plugins 通过 app.config.globalProperties 挂载了这些方法/对象，
 * 这里为 getCurrentInstance().proxy 与 Options API 的 this 补上类型。
 */
import type tab from '@/plugins/tab'
import type auth from '@/plugins/auth'
import type cache from '@/plugins/cache'
import type modal from '@/plugins/modal'
import type downloadPlugin from '@/plugins/download'

type RequestDownload = typeof import('@/utils/request')['download']

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 页签操作 */
    $tab: typeof tab
    /** 认证对象 */
    $auth: typeof auth
    /** 缓存对象 */
    $cache: typeof cache
    /** 模态框对象 */
    $modal: typeof modal
    /** 下载文件（plugins/download） */
    $download: typeof downloadPlugin
    /** 字典数据（main.ts 全局方法） */
    useDict: typeof import('@/utils/dict')['useDict']
    /** 下载文件（main.ts 全局方法） */
    download: RequestDownload
    /** 时间格式化 */
    parseTime: typeof import('@/utils/ruoyi')['parseTime']
    /** 重置表单 */
    resetForm: typeof import('@/utils/ruoyi')['resetForm']
    /** 添加日期范围参数 */
    addDateRange: typeof import('@/utils/ruoyi')['addDateRange']
    /** 查询参数键值 */
    getConfigKey: typeof import('@/api/system/config')['getConfigKey']
    /** 字典标签 */
    selectDictLabel: typeof import('@/utils/ruoyi')['selectDictLabel']
  }
}

export {}
