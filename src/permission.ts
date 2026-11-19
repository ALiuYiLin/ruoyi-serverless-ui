import router from './router'
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import { getUserPerms } from '@/api/perm'
import { allAccess, flattenPerms, isPublicPath } from '@/perm/access'
import useUserStore from '@/store/modules/user'
import useLockStore from '@/store/modules/lock'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import type { AppRouteRecord } from '@/types'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path: string): boolean => {
  return whiteList.some((pattern: string) => isPathMatch(pattern, path))
}

router.beforeEach(async (to, from) => {
  NProgress.start()

  if (!getToken()) {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      return true
    }
    NProgress.done()
    return `/login?redirect=${to.fullPath}` // 否则全部重定向到登录页
  }

  // 有 token：标题、登录页、白名单、锁屏
  to.meta.title && useSettingsStore().setTitle(to.meta.title as string)
  const isLock = useLockStore().isLock
  if (to.path === '/login') {
    NProgress.done()
    return { path: '/' }
  }
  if (isWhiteList(to.path)) {
    return true
  }
  if (isLock && to.path !== '/lock') {
    NProgress.done()
    return { path: '/lock' }
  }
  if (!isLock && to.path === '/lock') {
    NProgress.done()
    return { path: '/' }
  }

  const permissionStore = usePermissionStore()

  // 首次进入（登录 / 刷新）：拉取用户信息与权限，生成并注册动态路由
  if (!permissionStore.loaded) {
    isRelogin.show = true
    try {
      // 拉取user_info信息
      await useUserStore().getInfo()
      isRelogin.show = false

      // 拉取当前用户的有效权限（后端就绪前可用 VITE_PERM_MOCK 走本地 mock）
      const { data } = await getUserPerms()
      // 管理员兜底：即使后端漏配也不会把自己锁死
      const access = useUserStore().roles.includes('admin') ? allAccess() : flattenPerms(data)

      const accessRoutes: AppRouteRecord[] = await permissionStore.generateRoutes(access)
      accessRoutes.forEach((route) => {
        if (!isHttp(route.path)) {
          // AppRouteRecord 含若依扩展字段，与 vue-router 的路由联合类型不兼容，边界处断言
          router.addRoute(route as unknown as RouteRecordRaw)
        }
      })
      // 重新导航到目标路由，确保动态路由已注册
      return { ...to, replace: true }
    } catch (err) {
      isRelogin.show = false
      permissionStore.resetAccess()
      await useUserStore().logOut()
      ElMessage.error(err instanceof Error ? err.message : String(err))
      return { path: '/' }
    }
  }

  // 权限已加载：公共路径直接放行，其余必须命中授权路径
  if (!isPublicPath(to.path) && !permissionStore.hasPath(to.path)) {
    NProgress.done()
    return { path: '/401' }
  }
  return true
})

router.afterEach(() => {
  NProgress.done()
})
