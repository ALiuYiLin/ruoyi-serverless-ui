import request from '@/utils/request'
import type { AjaxResult, JobQueryParams, SysJob, TableDataInfo } from '@/types'

// 查询定时任务列表
export function listJob(query: JobQueryParams): Promise<TableDataInfo<SysJob>> {
  return request({
    url: '/monitor/job/list',
    method: 'get',
    params: query
  })
}

// 查询定时任务详细
export function getJob(jobId: number): Promise<AjaxResult<SysJob>> {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'get'
  })
}

// 新增定时任务
export function addJob(data: SysJob): Promise<AjaxResult> {
  return request({
    url: '/monitor/job',
    method: 'post',
    data: data
  })
}

// 修改定时任务
export function updateJob(data: SysJob): Promise<AjaxResult> {
  return request({
    url: '/monitor/job',
    method: 'put',
    data: data
  })
}

// 删除定时任务
export function delJob(jobId: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/monitor/job/' + jobId,
    method: 'delete'
  })
}

// 任务状态修改
export function changeJobStatus(jobId: number, status: string): Promise<AjaxResult> {
  return request({
    url: '/monitor/job/changeStatus',
    method: 'put',
    data: { jobId, status }
  })
}

// 立即执行一次
export function runJob(jobId: number, jobGroup: string): Promise<AjaxResult> {
  return request({
    url: '/monitor/job/run',
    method: 'put',
    data: { jobId, jobGroup }
  })
}
