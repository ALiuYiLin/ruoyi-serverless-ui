import type { PageDomain, BaseEntity } from "../common";

/** 操作日志查询参数 */
export interface OperlogQueryParams extends PageDomain {
  /** 操作地址 */
  operIp?: string;
  /** 系统模块 */
  title?: string;
  /** 操作人员 */
  operName?: string;
  /** 操作类型 */
  businessType?: string;
  /** 操作状态 */
  status?: string;
  /** 操作时间范围 */
  params?: {
    beginTime?: string;
    endTime?: string;
  };
  orderByColumn?: string;
  isAsc?: 'asc' | 'desc';
}

/** 操作日志信息 */
export interface SysOperLog extends BaseEntity {
  operId?: number;
  title?: string;
  businessType?: number;
  method?: string;
  requestMethod?: string;
  operatorType?: number;
  operName?: string;
  deptName?: string;
  operUrl?: string;
  operIp?: string;
  operLocation?: string;
  operParam?: string;
  jsonResult?: string;
  status?: number;
  errorMsg?: string;
  operTime?: string;
  costTime?: number;
}
