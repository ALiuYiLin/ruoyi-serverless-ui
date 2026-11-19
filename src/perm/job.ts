import { APIS } from '@/api'
import { ROUTE_PATHS } from '@/router/routes'
import type { PermBody } from './types'

/** 定时任务 - 查看权限 */
const job_read: PermBody = {
  paths: [
    ROUTE_PATHS.monitor.job
  ],
  apis: [
    APIS.JOB_LIST,
    APIS.JOB_DETAIL,
    APIS.JOB_EXPORT
  ]
}

/** 定时任务 - 编辑权限（新增/修改/删除/状态/立即执行） */
const job_write: PermBody = {
  paths: [],
  apis: [
    APIS.JOB_ADD,
    APIS.JOB_UPDATE,
    APIS.JOB_DEL,
    APIS.JOB_CHANGE_STATUS,
    APIS.JOB_RUN
  ]
}

export const JOB_PERMS = {
  job_read,
  job_write
}
