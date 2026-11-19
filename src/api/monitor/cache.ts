import request from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { AjaxResult, CacheMonitorData, SysCache } from '@/types'

// 缓存监控模块接口集中管理
export enum CACHE_API {
  CACHE_INFO = 'GET:/monitor/cache',
  CACHE_NAMES = 'GET:/monitor/cache/getNames',
  CACHE_KEYS = 'GET:/monitor/cache/getKeys/:cacheName',
  CACHE_VALUE = 'GET:/monitor/cache/getValue/:cacheName/:cacheKey',
  CACHE_CLEAR_NAME = 'DELETE:/monitor/cache/clearCacheName/:cacheName',
  CACHE_CLEAR_KEY = 'DELETE:/monitor/cache/clearCacheKey/:cacheKey',
  CACHE_CLEAR_ALL = 'DELETE:/monitor/cache/clearCacheAll'
}

// 查询缓存详细
export function getCache(): Promise<AjaxResult<CacheMonitorData>> {
  const { basePath, method } = useAPI(CACHE_API.CACHE_INFO)
  return request({
    url: basePath,
    method
  })
}

// 查询缓存名称列表
export function listCacheName(): Promise<AjaxResult<SysCache[]>> {
  const { basePath, method } = useAPI(CACHE_API.CACHE_NAMES)
  return request({
    url: basePath,
    method
  })
}

// 查询缓存键名列表
export function listCacheKey(cacheName: string): Promise<AjaxResult<string[]>> {
  const { basePath, method } = useAPI(CACHE_API.CACHE_KEYS)
  return request({
    url: basePath + encodeURIComponent(cacheName),
    method
  })
}

// 查询缓存内容
export function getCacheValue(cacheName: string, cacheKey: string): Promise<AjaxResult<SysCache>> {
  const { basePath, method } = useAPI(CACHE_API.CACHE_VALUE)
  return request({
    url: `${basePath}${encodeURIComponent(cacheName)}/${encodeURIComponent(cacheKey)}`,
    method
  })
}

// 清理指定名称缓存
export function clearCacheName(cacheName: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CACHE_API.CACHE_CLEAR_NAME)
  return request({
    url: basePath + encodeURIComponent(cacheName),
    method
  })
}

// 清理指定键名缓存
export function clearCacheKey(cacheKey: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CACHE_API.CACHE_CLEAR_KEY)
  return request({
    url: basePath + encodeURIComponent(cacheKey),
    method
  })
}

// 清理全部缓存
export function clearCacheAll(): Promise<AjaxResult> {
  const { basePath, method } = useAPI(CACHE_API.CACHE_CLEAR_ALL)
  return request({
    url: basePath,
    method
  })
}
