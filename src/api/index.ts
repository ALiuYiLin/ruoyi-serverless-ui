/**
 * 全部接口定义的扁平聚合入口，只做汇总、不承载业务请求函数。
 *
 * ```ts
 * APIS.USER_LIST    // 'GET:/system/user/list'
 * APIS.ROLE_DETAIL  // 'GET:/system/role/:roleId'
 * APIS.JOB_LOG_EXPORT
 * useAPI(APIS.ROLE_LIST)
 * ```
 *
 * 各模块的键本身已带模块前缀（`ROLE_LIST`、`DICT_DATA_LIST`…），因此这里直接
 * 展开合并成一层，不再额外套一层模块分组。
 *
 * 模块内部仍使用各自的 `Xxx_API` 常量，避免 api 模块反向依赖本文件而产生循环引用。
 */
import { LOGIN_API } from './login'
import { ROUTER_API } from './menu'
import { CACHE_API } from './monitor/cache'
import { JOB_API } from './monitor/job'
import { JOB_LOG_API } from './monitor/jobLog'
import { LOGININFOR_API } from './monitor/logininfor'
import { ONLINE_API } from './monitor/online'
import { OPERLOG_API } from './monitor/operlog'
import { SERVER_API } from './monitor/server'
import { PERM_API } from './perm'
import { CONFIG_API } from './system/config'
import { DEPT_API } from './system/dept'
import { DICT_DATA_API } from './system/dict/data'
import { DICT_TYPE_API } from './system/dict/type'
import { SYS_MENU_API } from './system/menu'
import { NOTICE_API } from './system/notice'
import { POST_API } from './system/post'
import { ROLE_API } from './system/role'
import { USER_API } from './system/user'

/** 所有模块的接口定义，扁平存放：`APIS.USER_LIST`、`APIS.ROLE_DETAIL` */
export const APIS = {
  ...LOGIN_API,
  ...ROUTER_API,
  ...USER_API,
  ...ROLE_API,
  ...DEPT_API,
  ...POST_API,
  ...SYS_MENU_API,
  ...DICT_TYPE_API,
  ...DICT_DATA_API,
  ...CONFIG_API,
  ...NOTICE_API,
  ...OPERLOG_API,
  ...LOGININFOR_API,
  ...ONLINE_API,
  ...PERM_API,
  ...JOB_API,
  ...JOB_LOG_API,
  ...SERVER_API,
  ...CACHE_API
} as const

/** 聚合入口的键，如 `'USER_LIST' | 'ROLE_DETAIL' | ...` */
export type ApiKey = keyof typeof APIS

/** 指定键对应的接口定义类型，如 `ApiDefinitionOf<'ROLE_DETAIL'>` */
export type ApiDefinitionOf<K extends ApiKey> = (typeof APIS)[K]
