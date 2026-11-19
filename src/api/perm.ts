import request from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { UserPermResult, UserPermTree } from '@/types'

// 权限模块接口集中管理
export const PERM_API = {
  USER_PERMS: 'GET:/getPerms'
} as const satisfies Record<string, ApiDefinition>

/**
 * 获取当前用户的有效权限。
 *
 * 后端 `GET /getPerms` 未就绪期间，可用 `VITE_PERM_MOCK=true` 走本地 mock
 * （`src/api/perm.mock.ts`），按 `useUserStore().roles` 生成权限树。
 */
export async function getUserPerms(): Promise<UserPermResult> {
  if (import.meta.env.VITE_PERM_MOCK === 'true') {
    const [{ mockUserPerms }, { default: useUserStore }] = await Promise.all([
      import('./perm.mock'),
      import('@/store/modules/user')
    ])
    const roles = useUserStore().roles
    return { code: 200, msg: 'mock perms', data: mockUserPerms(roles) as UserPermTree }
  }

  const { basePath, method } = useAPI(PERM_API.USER_PERMS)
  return request({
    url: basePath,
    method
  })
}
