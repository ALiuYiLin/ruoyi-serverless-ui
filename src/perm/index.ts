import { admin } from './admin'
import { base, base_auth } from './base'
import { CACHE_PERMS } from './cache'
import { CONFIG_PERMS } from './config'
import { DEPT_PERMS } from './dept'
import { DICT_PERMS } from './dict'
import { JOB_PERMS } from './job'
import { JOB_LOG_PERMS } from './jobLog'
import { LOGININFOR_PERMS } from './logininfor'
import { MENU_PERMS } from './menu'
import { NOTICE_PERMS } from './notice'
import { ONLINE_PERMS } from './online'
import { OPERLOG_PERMS } from './operlog'
import { POST_PERMS } from './post'
import { ROLE_PERMS } from './role'
import { SERVER_PERMS } from './server'
import { USER_PERMS } from './user'
import { PermType } from './types'

/** 所有可分配给角色的权限项（模块_读 / 模块_写） */
export const PERMS = {
  ...USER_PERMS,
  ...ROLE_PERMS,
  ...DEPT_PERMS,
  ...POST_PERMS,
  ...MENU_PERMS,
  ...DICT_PERMS,
  ...CONFIG_PERMS,
  ...NOTICE_PERMS,
  ...OPERLOG_PERMS,
  ...LOGININFOR_PERMS,
  ...ONLINE_PERMS,
  ...JOB_PERMS,
  ...JOB_LOG_PERMS,
  ...SERVER_PERMS,
  ...CACHE_PERMS
}

/** 约定权限模块（按层级组织） */
export const SPECS = {
  [PermType.base]: base,
  [PermType.auth]: base_auth,
  [PermType.role]: PERMS,
  [PermType.admin]: admin
}
