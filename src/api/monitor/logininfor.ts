import request, { download } from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { AjaxResult, LogininforQueryParams, SysLogininfor, TableDataInfo } from '@/types'

// 登录日志模块接口集中管理
export enum LOGININFOR_API {
  LOGININFOR_LIST = 'GET:/monitor/logininfor/list',
  LOGININFOR_DEL = 'DELETE:/monitor/logininfor/:infoId',
  LOGININFOR_UNLOCK = 'GET:/monitor/logininfor/unlock/:userName',
  LOGININFOR_CLEAN = 'DELETE:/monitor/logininfor/clean',
  LOGININFOR_EXPORT = 'POST:/monitor/logininfor/export'
}

// 查询登录日志列表
export function list(query: LogininforQueryParams): Promise<TableDataInfo<SysLogininfor>> {
  const { basePath, method } = useAPI(LOGININFOR_API.LOGININFOR_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 删除登录日志
export function delLogininfor(infoId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(LOGININFOR_API.LOGININFOR_DEL)
  return request({
    url: basePath + infoId,
    method
  })
}

// 账户解锁
export function unlockLogininfor(userName: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(LOGININFOR_API.LOGININFOR_UNLOCK)
  return request({
    url: basePath + userName,
    method
  })
}

// 清空登录日志
export function cleanLogininfor(): Promise<AjaxResult> {
  const { basePath, method } = useAPI(LOGININFOR_API.LOGININFOR_CLEAN)
  return request({
    url: basePath,
    method
  })
}

// 导出登录日志（download 内部固定使用 POST，故只取 basePath）
export function exportLogininfor(query: LogininforQueryParams) {
  const { basePath } = useAPI(LOGININFOR_API.LOGININFOR_EXPORT)
  return download(basePath, { ...query }, `logininfor_${new Date().getTime()}.xlsx`)
}
