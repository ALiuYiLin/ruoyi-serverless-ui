import request from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { AjaxResult, ServerInfo } from '@/types'

// 服务监控模块接口集中管理
export const SERVER_API = {
  SERVER_INFO: 'GET:/monitor/server'
} as const satisfies Record<string, ApiDefinition>

// 查询服务器监控信息
export function getServer(): Promise<AjaxResult<ServerInfo>> {
  const { basePath, method } = useAPI(SERVER_API.SERVER_INFO)
  return request({
    url: basePath,
    method
  })
}
