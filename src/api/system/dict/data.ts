import request, { download } from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { AjaxResult, DictDataQueryParams, SysDictData, TableDataInfo } from '@/types'

// 字典数据模块接口集中管理
export enum DICT_DATA_API {
  DICT_DATA_LIST = 'GET:/system/dict/data/list',
  DICT_DATA_DETAIL = 'GET:/system/dict/data/:dictCode',
  DICT_DATA_BY_TYPE = 'GET:/system/dict/data/type/:dictType',
  DICT_DATA_ADD = 'POST:/system/dict/data',
  DICT_DATA_UPDATE = 'PUT:/system/dict/data',
  DICT_DATA_DEL = 'DELETE:/system/dict/data/:dictCode',
  DICT_DATA_EXPORT = 'POST:/system/dict/data/export'
}

// 查询字典数据列表
export function listData(query: DictDataQueryParams): Promise<TableDataInfo<SysDictData>> {
  const { basePath, method } = useAPI(DICT_DATA_API.DICT_DATA_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode: number): Promise<AjaxResult<SysDictData>> {
  const { basePath, method } = useAPI(DICT_DATA_API.DICT_DATA_DETAIL)
  return request({
    url: basePath + dictCode,
    method
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType: string): Promise<AjaxResult<SysDictData[]>> {
  const { basePath, method } = useAPI(DICT_DATA_API.DICT_DATA_BY_TYPE)
  return request({
    url: basePath + dictType,
    method
  })
}

// 新增字典数据
export function addData(data: SysDictData): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DICT_DATA_API.DICT_DATA_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改字典数据
export function updateData(data: SysDictData): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DICT_DATA_API.DICT_DATA_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除字典数据
export function delData(dictCode: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DICT_DATA_API.DICT_DATA_DEL)
  return request({
    url: basePath + dictCode,
    method
  })
}

// 导出字典数据列表（download 内部固定使用 POST，故只取 basePath）
export function exportData(query: DictDataQueryParams) {
  const { basePath } = useAPI(DICT_DATA_API.DICT_DATA_EXPORT)
  return download(basePath, { ...query }, `dict_data_${new Date().getTime()}.xlsx`)
}
