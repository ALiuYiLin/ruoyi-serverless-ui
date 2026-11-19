import request from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { RouterVo, AjaxResult } from '@/types'

// 动态路由接口集中管理
export enum ROUTER_API {
  GET_ROUTERS = 'GET:/getRouters'
}

// 获取路由
export const getRouters = (): Promise<AjaxResult<RouterVo[]>> => {
  const { basePath, method } = useAPI(ROUTER_API.GET_ROUTERS)
  return request({
    url: basePath,
    method
  })
}
