import request, { download } from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { AjaxResult, OperlogQueryParams, SysOperLog, TableDataInfo } from '@/types'

// 操作日志模块接口集中管理
export enum OPERLOG_API {
  OPERLOG_LIST = 'GET:/monitor/operlog/list',
  OPERLOG_DEL = 'DELETE:/monitor/operlog/:operId',
  OPERLOG_CLEAN = 'DELETE:/monitor/operlog/clean',
  OPERLOG_EXPORT = 'POST:/monitor/operlog/export'
}

// 查询操作日志列表
export function list(query: OperlogQueryParams): Promise<TableDataInfo<SysOperLog>> {
  const { basePath, method } = useAPI(OPERLOG_API.OPERLOG_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 删除操作日志
export function delOperlog(operId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(OPERLOG_API.OPERLOG_DEL)
  return request({
    url: basePath + operId,
    method
  })
}

// 清空操作日志
export function cleanOperlog(): Promise<AjaxResult> {
  const { basePath, method } = useAPI(OPERLOG_API.OPERLOG_CLEAN)
  return request({
    url: basePath,
    method
  })
}

// 导出操作日志（download 内部固定使用 POST，故只取 basePath）
export function exportOperlog(query: OperlogQueryParams) {
  const { basePath } = useAPI(OPERLOG_API.OPERLOG_EXPORT)
  return download(basePath, { ...query }, `operlog_${new Date().getTime()}.xlsx`)
}
