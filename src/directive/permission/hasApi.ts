/**
 * v-hasApi 接口权限处理
 *
 * 参数为 `APIS` 中的接口定义，支持数组，任一命中即显示：
 *
 * ```vue
 * <el-button v-hasApi="APIS.USER_ADD">新增</el-button>
 * <el-button v-hasApi="[APIS.USER_UPDATE, APIS.USER_DEL]">编辑</el-button>
 * ```
 *
 * 注意：前端只做显隐，真正的鉴权由后端按 `apis` 完成。
 */
import usePermissionStore from '@/store/modules/permission'

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const apis = Array.isArray(value) ? (value as string[]) : [value as string]

    if (!apis.length || apis.some((api) => !api)) {
      throw new Error(`请设置操作权限标签值`)
    }

    const permissionStore = usePermissionStore()
    if (!apis.some((api) => permissionStore.hasApi(api))) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
