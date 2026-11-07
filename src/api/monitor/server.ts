import request from '@/utils/request'
import type { AjaxResult, ServerInfo } from '@/types'

// 查询服务器监控信息
export function getServer(): Promise<AjaxResult<ServerInfo>> {
  return request({
    url: '/monitor/server',
    method: 'get'
  })
}
