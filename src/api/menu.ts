import request from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { RouterVo, AjaxResult } from '@/types'

// 动态路由接口集中管理
export const ROUTER_API = {
  GET_ROUTERS: 'GET:/getRouters'
} as const satisfies Record<string, ApiDefinition>

// 获取路由
export const getRouters = (): Promise<AjaxResult<RouterVo[]>> => {
  const { basePath, method } = useAPI(ROUTER_API.GET_ROUTERS)
  return request({
    url: basePath,
    method
  })
}
