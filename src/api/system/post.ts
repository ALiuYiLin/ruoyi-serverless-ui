import request, { download } from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { AjaxResult, PostQueryParams, SysPost, TableDataInfo } from '@/types'

// 岗位模块接口集中管理
export const POST_API = {
  POST_LIST: 'GET:/system/post/list',
  POST_DETAIL: 'GET:/system/post/:postId',
  POST_ADD: 'POST:/system/post',
  POST_UPDATE: 'PUT:/system/post',
  POST_DEL: 'DELETE:/system/post/:postId',
  POST_EXPORT: 'POST:/system/post/export'
} as const satisfies Record<string, ApiDefinition>

// 查询岗位列表
export function listPost(query: PostQueryParams): Promise<TableDataInfo<SysPost>> {
  const { basePath, method } = useAPI(POST_API.POST_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询岗位详细
export function getPost(postId: number): Promise<AjaxResult<SysPost>> {
  const { basePath, method } = useAPI(POST_API.POST_DETAIL)
  return request({
    url: basePath + postId,
    method
  })
}

// 新增岗位
export function addPost(data: SysPost): Promise<AjaxResult> {
  const { basePath, method } = useAPI(POST_API.POST_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改岗位
export function updatePost(data: SysPost): Promise<AjaxResult> {
  const { basePath, method } = useAPI(POST_API.POST_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除岗位
export function delPost(postId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(POST_API.POST_DEL)
  return request({
    url: basePath + postId,
    method
  })
}

// 导出岗位列表（download 内部固定使用 POST，故只取 basePath）
export function exportPost(query: PostQueryParams) {
  const { basePath } = useAPI(POST_API.POST_EXPORT)
  return download(basePath, { ...query }, `post_${new Date().getTime()}.xlsx`)
}
