import request, { download } from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { AjaxResult, DictTypeQueryParams, SysDictType, TableDataInfo } from '@/types'

// 字典类型模块接口集中管理
export enum DICT_TYPE_API {
  DICT_TYPE_LIST = 'GET:/system/dict/type/list',
  DICT_TYPE_DETAIL = 'GET:/system/dict/type/:dictId',
  DICT_TYPE_ADD = 'POST:/system/dict/type',
  DICT_TYPE_UPDATE = 'PUT:/system/dict/type',
  DICT_TYPE_DEL = 'DELETE:/system/dict/type/:dictId',
  DICT_TYPE_REFRESH_CACHE = 'DELETE:/system/dict/type/refreshCache',
  DICT_TYPE_OPTION_SELECT = 'GET:/system/dict/type/optionselect',
  DICT_TYPE_EXPORT = 'POST:/system/dict/type/export'
}

// 查询字典类型列表
export function listType(query: DictTypeQueryParams): Promise<TableDataInfo<SysDictType>> {
  const { basePath, method } = useAPI(DICT_TYPE_API.DICT_TYPE_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询字典类型详细
export function getType(dictId: number): Promise<AjaxResult<SysDictType>> {
  const { basePath, method } = useAPI(DICT_TYPE_API.DICT_TYPE_DETAIL)
  return request({
    url: basePath + dictId,
    method
  })
}

// 新增字典类型
export function addType(data: SysDictType): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DICT_TYPE_API.DICT_TYPE_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改字典类型
export function updateType(data: SysDictType): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DICT_TYPE_API.DICT_TYPE_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除字典类型
export function delType(dictId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DICT_TYPE_API.DICT_TYPE_DEL)
  return request({
    url: basePath + dictId,
    method
  })
}

// 刷新字典缓存
export function refreshCache(): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DICT_TYPE_API.DICT_TYPE_REFRESH_CACHE)
  return request({
    url: basePath,
    method
  })
}

// 获取字典选择框列表
export function optionselect(): Promise<AjaxResult<SysDictType[]>> {
  const { basePath, method } = useAPI(DICT_TYPE_API.DICT_TYPE_OPTION_SELECT)
  return request({
    url: basePath,
    method
  })
}

// 导出字典类型列表（download 内部固定使用 POST，故只取 basePath）
export function exportType(query: DictTypeQueryParams) {
  const { basePath } = useAPI(DICT_TYPE_API.DICT_TYPE_EXPORT)
  return download(basePath, { ...query }, `dict_type_${new Date().getTime()}.xlsx`)
}
