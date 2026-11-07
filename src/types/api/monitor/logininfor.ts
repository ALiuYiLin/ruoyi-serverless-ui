import type { PageDomain, BaseEntity } from "../common";

/** 登录日志查询参数 */
export interface LogininforQueryParams extends PageDomain {
  /** 登录地址 */
  ipaddr?: string;
  /** 用户名称 */
  userName?: string;
  /** 登录状态 */
  status?: string;
  /** 登录时间范围 */
  params?: {
    beginTime?: string;
    endTime?: string;
  };
  orderByColumn?: string;
  isAsc?: 'asc' | 'desc';
}

/** 登录日志信息 */
export interface SysLogininfor extends BaseEntity {
  infoId?: number;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  status?: '0' | '1';
  msg?: string;
  loginTime?: string;
}
