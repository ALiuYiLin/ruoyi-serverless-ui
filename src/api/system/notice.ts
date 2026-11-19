import request from '@/utils/request'
import { useAPI } from '@/utils/useAPI'
import type { NoticeQueryParams, NoticeReadUserQueryParams, SysNotice, NoticeReadUser, SysNoticeTopResult, AjaxResult, TableDataInfo } from '@/types'

// 公告模块接口集中管理
export enum NOTICE_API {
  NOTICE_LIST = 'GET:/system/notice/list',
  NOTICE_DETAIL = 'GET:/system/notice/:noticeId',
  NOTICE_ADD = 'POST:/system/notice',
  NOTICE_UPDATE = 'PUT:/system/notice',
  NOTICE_DEL = 'DELETE:/system/notice/:noticeId',
  NOTICE_LIST_TOP = 'GET:/system/notice/listTop',
  NOTICE_MARK_READ = 'POST:/system/notice/markRead',
  NOTICE_MARK_READ_ALL = 'POST:/system/notice/markReadAll',
  NOTICE_READ_USERS = 'GET:/system/notice/readUsers/list'
}

// 查询公告列表
export function listNotice(query: NoticeQueryParams): Promise<TableDataInfo<SysNotice>> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_LIST)
  return request({
    url: basePath,
    method,
    params: query
  })
}

// 查询公告详细
export function getNotice(noticeId: number): Promise<AjaxResult<SysNotice>> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_DETAIL)
  return request({
    url: basePath + noticeId,
    method
  })
}

// 新增公告
export function addNotice(data: SysNotice): Promise<AjaxResult> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_ADD)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 修改公告
export function updateNotice(data: SysNotice): Promise<AjaxResult> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_UPDATE)
  return request({
    url: basePath,
    method,
    data: data
  })
}

// 删除公告
export function delNotice(noticeId: number | number[]): Promise<AjaxResult> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_DEL)
  return request({
    url: basePath + noticeId,
    method
  })
}

// 首页顶部公告列表（带已读状态）
export function listNoticeTop(): Promise<SysNoticeTopResult> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_LIST_TOP)
  return request({
    url: basePath,
    method
  })
}

// 标记公告已读
export function markNoticeRead(noticeId: number): Promise<AjaxResult> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_MARK_READ)
  return request({
    url: basePath,
    method,
    params: { noticeId }
  })
}

// 批量标记已读
export function markNoticeReadAll(ids: string): Promise<AjaxResult> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_MARK_READ_ALL)
  return request({
    url: basePath,
    method,
    params: { ids }
  })
}

// 查询公告已读用户列表
export function listNoticeReadUsers(query: NoticeReadUserQueryParams): Promise<TableDataInfo<NoticeReadUser>> {
  const { basePath, method } = useAPI(NOTICE_API.NOTICE_READ_USERS)
  return request({
    url: basePath,
    method,
    params: query
  })
}
