import request, { download } from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { AjaxResult, JobQueryParams, SysJob, TableDataInfo } from '@/types'

// 定时任务模块接口集中管理
export const JOB_API = {
  JOB_LIST: 'GET:/monitor/job/list',
  JOB_DETAIL: 'GET:/monitor/job/:jobId',
  JOB_ADD: 'POST:/monitor/job',
  JOB_UPDATE: 'PUT:/monitor/job',
  JOB_DEL: 'DELETE:/monitor/job/:jobId',
  JOB_CHANGE_STATUS: 'PUT:/monitor/job/changeStatus',
  JOB_RUN: 'PUT:/monitor/job/run',
  JOB_EXPORT: 'POST:/monitor/job/export'
} as const satisfies Record<string, ApiDefinition>

// 查询定时任务列表
export function listJob(query: JobQueryParams): Promise<TableDataInfo<SysJob>> {
  const { basePath, method } = useAPI(JOB_API.JOB_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询定时任务详细
export function getJob(jobId: number): Promise<AjaxResult<SysJob>> {
  const { basePath, method } = useAPI(JOB_API.JOB_DETAIL)
  return request({
    url: basePath + jobId,
    method
  })
}

// 新增定时任务
export function addJob(data: SysJob): Promise<AjaxResult> {
  const { basePath, method } = useAPI(JOB_API.JOB_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改定时任务
export function updateJob(data: SysJob): Promise<AjaxResult> {
  const { basePath, method } = useAPI(JOB_API.JOB_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除定时任务
export function delJob(jobId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(JOB_API.JOB_DEL)
  return request({
    url: basePath + jobId,
    method
  })
}

// 任务状态修改
export function changeJobStatus(jobId: number, status: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(JOB_API.JOB_CHANGE_STATUS)
  return request({
    url: basePath,
    method,
    data: { jobId, status }
  })
}

// 立即执行一次
export function runJob(jobId: number, jobGroup: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(JOB_API.JOB_RUN)
  return request({
    url: basePath,
    method,
    data: { jobId, jobGroup }
  })
}

// 导出定时任务（download 内部固定使用 POST，故只取 basePath）
export function exportJob(query: JobQueryParams) {
  const { basePath } = useAPI(JOB_API.JOB_EXPORT)
  return download(basePath, { ...query }, `job_${new Date().getTime()}.xlsx`)
}
