import request from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { AjaxResult, OnlineQueryParams, SysUserOnline, TableDataInfo } from '@/types'

// 在线用户模块接口集中管理
export const ONLINE_API = {
  ONLINE_LIST: 'GET:/monitor/online/list',
  ONLINE_FORCE_LOGOUT: 'DELETE:/monitor/online/:tokenId'
} as const satisfies Record<string, ApiDefinition>

// 查询在线用户列表
export function list(query: OnlineQueryParams): Promise<TableDataInfo<SysUserOnline>> {
  const { basePath, method } = useAPI(ONLINE_API.ONLINE_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 强退用户
export function forceLogout(tokenId: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(ONLINE_API.ONLINE_FORCE_LOGOUT)
  return request({
    url: basePath + tokenId,
    method
  })
}
