import { APIS } from '@/api'
import type { PermBody } from './types'

/** 调度日志 - 查看权限（定时任务页内的日志弹窗，无独立路由） */
const job_log_read: PermBody = {
  paths: [],
  apis: [
    APIS.JOB_LOG_LIST,
    APIS.JOB_LOG_EXPORT
  ]
}

/** 调度日志 - 管理权限（删除/清空） */
const job_log_write: PermBody = {
  paths: [],
  apis: [
    APIS.JOB_LOG_DEL,
    APIS.JOB_LOG_CLEAN
  ]
}

export const JOB_LOG_PERMS = {
  job_log_read,
  job_log_write
}
