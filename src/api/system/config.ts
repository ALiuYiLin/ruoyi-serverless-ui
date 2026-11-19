import request, { download } from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { ConfigQueryParams, SysConfig, AjaxResult, TableDataInfo } from '@/types'

// 参数配置模块接口集中管理
export enum CONFIG_API {
  CONFIG_LIST = 'GET:/system/config/list',
  CONFIG_DETAIL = 'GET:/system/config/:configId',
  CONFIG_KEY = 'GET:/system/config/configKey/:configKey',
  CONFIG_ADD = 'POST:/system/config',
  CONFIG_UPDATE = 'PUT:/system/config',
  CONFIG_DEL = 'DELETE:/system/config/:configId',
  CONFIG_REFRESH_CACHE = 'DELETE:/system/config/refreshCache',
  CONFIG_EXPORT = 'POST:/system/config/export'
}

// 查询参数列表
export function listConfig(query: ConfigQueryParams): Promise<TableDataInfo<SysConfig>> {
  const { basePath, method } = useAPI(CONFIG_API.CONFIG_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询参数详细
export function getConfig(configId: number): Promise<AjaxResult<SysConfig>> {
  const { basePath, method } = useAPI(CONFIG_API.CONFIG_DETAIL)
  return request({
    url: basePath + configId,
    method
  })
}

// 根据参数键名查询参数值
export function getConfigKey(configKey: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CONFIG_API.CONFIG_KEY)
  return request({
    url: basePath + configKey,
    method
  })
}

// 新增参数配置
export function addConfig(data: SysConfig): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CONFIG_API.CONFIG_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改参数配置
export function updateConfig(data: SysConfig): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CONFIG_API.CONFIG_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除参数配置
export function delConfig(configId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CONFIG_API.CONFIG_DEL)
  return request({
    url: basePath + configId,
    method
  })
}

// 刷新参数缓存
export function refreshCache(): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CONFIG_API.CONFIG_REFRESH_CACHE)
  return request({
    url: basePath,
    method
  })
}

// 导出参数列表（download 内部固定使用 POST，故只取 basePath）
export function exportConfig(query: ConfigQueryParams) {
  const { basePath } = useAPI(CONFIG_API.CONFIG_EXPORT)
  return download(basePath, { ...query }, `config_${new Date().getTime()}.xlsx`)
}
