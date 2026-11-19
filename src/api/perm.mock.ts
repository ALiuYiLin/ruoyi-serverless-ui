import { PERMS } from '@/perm'
import { admin } from '@/perm/admin'
import { base, base_auth } from '@/perm/base'
import type { UserPermTree } from '@/types'

/**
 * 权限 mock：后端 `GET /getPerms` 就绪后删除本文件。
 *
 * 角色 → 权限项映射，权限项 key 与 `src/perm` 保持一致：
 * - admin：全量
 * - viewer：系统管理只读
 * - operator：系统管理只读 + 用户/角色/部门/通知写权限
 * - monitor：监控模块只读
 * - 其他角色：默认按 viewer
 */
const VIEWER_KEYS = [
  'user_read',
  'role_read',
  'dept_read',
  'post_read',
  'dict_type_read',
  'dict_data_read',
  'config_read',
  'notice_read'
]

const ROLE_PERM_KEYS: Record<string, string[]> = {
  viewer: VIEWER_KEYS,
  operator: [
    ...VIEWER_KEYS,
    'user_write',
    'role_write',
    'dept_write',
    'notice_write'
  ],
  monitor: [
    'operlog_read',
    'logininfor_read',
    'online_read',
    'job_read',
    'job_log_read',
    'server_read',
    'cache_read'
  ]
}

const EMPTY_PERM = { paths: [], apis: [] }

/** 按角色生成用户权限树 */
export function mockUserPerms(roles: string[]): UserPermTree {
  if (roles.includes('admin')) {
    return { base, base_auth, role: PERMS, admin }
  }

  const granted = new Set<string>()
  for (const role of roles) {
    for (const key of ROLE_PERM_KEYS[role] ?? []) granted.add(key)
  }
  // 未知角色默认给只读，保证开发环境能看到菜单
  if (granted.size === 0) VIEWER_KEYS.forEach((key) => granted.add(key))

  return {
    base,
    base_auth,
    role: Object.fromEntries(Object.entries(PERMS).filter(([key]) => granted.has(key))),
    admin: EMPTY_PERM
  }
}
