/** 用户列表筛选条件 */
export interface UserFilter {
  /** 用户名称 */
  userName?: string
  /** 手机号码 */
  phonenumber?: string
  /** 状态（0正常 1停用） */
  status?: '0' | '1'
  /** 创建时间起 */
  beginTime?: string
  /** 创建时间止 */
  endTime?: string
}
