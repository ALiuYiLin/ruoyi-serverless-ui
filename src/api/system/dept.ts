import request from '@/utils/request'
import { useAPI, type ApiDefinition } from '@/utils/useAPI'
import type { AjaxResult, DeptQueryParams, DeptSortParams, SysDept } from '@/types'

// 部门模块接口集中管理
export const DEPT_API = {
  DEPT_LIST: 'GET:/system/dept/list',
  DEPT_LIST_EXCLUDE_CHILD: 'GET:/system/dept/list/exclude/:deptId',
  DEPT_DETAIL: 'GET:/system/dept/:deptId',
  DEPT_ADD: 'POST:/system/dept',
  DEPT_UPDATE: 'PUT:/system/dept',
  DEPT_UPDATE_SORT: 'PUT:/system/dept/updateSort',
  DEPT_DEL: 'DELETE:/system/dept/:deptId'
} as const satisfies Record<string, ApiDefinition>

// 查询部门列表
export function listDept(query?: DeptQueryParams): Promise<AjaxResult<SysDept[]>> {
  const { basePath, method } = useAPI(DEPT_API.DEPT_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询部门列表（排除节点）
export function listDeptExcludeChild(deptId: number): Promise<AjaxResult<SysDept[]>> {
  const { basePath, method } = useAPI(DEPT_API.DEPT_LIST_EXCLUDE_CHILD)
  return request({
    url: basePath + deptId,
    method
  })
}

// 查询部门详细
export function getDept(deptId: number): Promise<AjaxResult<SysDept>> {
  const { basePath, method } = useAPI(DEPT_API.DEPT_DETAIL)
  return request({
    url: basePath + deptId,
    method
  })
}

// 新增部门
export function addDept(data: SysDept): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DEPT_API.DEPT_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改部门
export function updateDept(data: SysDept): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DEPT_API.DEPT_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 保存部门排序
export function updateDeptSort(data: DeptSortParams): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DEPT_API.DEPT_UPDATE_SORT)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除部门
export function delDept(deptId: number): Promise<AjaxResult> {
  const { basePath, method } = useAPI(DEPT_API.DEPT_DEL)
  return request({
    url: basePath + deptId,
    method
  })
}
