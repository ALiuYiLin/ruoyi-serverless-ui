import type { BaseEntity } from "../common";

/** 部门信息（用户/部门树等场景使用） */
export interface SysDept extends BaseEntity {
  /** 部门编号 */
  deptId?: number;
  /** 父部门ID */
  parentId?: number;
  /** 祖级列表 */
  ancestors?: string;
  /** 部门名称 */
  deptName?: string;
  /** 显示顺序 */
  orderNum?: number;
  /** 负责人 */
  leader?: string;
  /** 联系电话 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 状态（0正常 1停用） */
  status?: '0' | '1';
  /** 子部门 */
  children?: SysDept[];
}
