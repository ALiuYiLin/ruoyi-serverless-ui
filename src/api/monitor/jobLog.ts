import request, { download } from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { AjaxResult, JobLogQueryParams, SysJobLog, TableDataInfo } from '@/types'

// 调度日志模块接口集中管理
export const JOB_LOG_API = {
  JOB_LOG_LIST: 'GET:/monitor/jobLog/list',
  JOB_LOG_DEL: 'DELETE:/monitor/jobLog/:jobLogId',
  JOB_LOG_CLEAN: 'DELETE:/monitor/jobLog/clean',
  JOB_LOG_EXPORT: 'POST:/monitor/jobLog/export'
} as const satisfies Record<string, ApiDefinition>

// 查询调度日志列表
export function listJobLog(query: JobLogQueryParams): Promise<TableDataInfo<SysJobLog>> {
  const { basePath, method } = useAPI(JOB_LOG_API.JOB_LOG_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 删除调度日志
export function delJobLog(jobLogId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(JOB_LOG_API.JOB_LOG_DEL)
  return request({
    url: basePath + jobLogId,
    method
  })
}

// 清空调度日志
export function cleanJobLog(): Promise<AjaxResult> {
  const { basePath, method } = useAPI(JOB_LOG_API.JOB_LOG_CLEAN)
  return request({
    url: basePath,
    method
  })
}

// 导出调度日志（download 内部固定使用 POST，故只取 basePath）
export function exportJobLog(query: JobLogQueryParams) {
  const { basePath } = useAPI(JOB_LOG_API.JOB_LOG_EXPORT)
  return download(basePath, { ...query }, `job_log_${new Date().getTime()}.xlsx`)
}
