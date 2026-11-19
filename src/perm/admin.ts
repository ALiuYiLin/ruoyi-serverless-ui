import type { PermBody } from './types';

/**
 * 管理权限：系统管理员独有的资源
 * 业务模块的 CRUD 权限已通过 PERMS（角色权限）覆盖，
 * 此处只放管理级独有的内容（如系统设置、权限管理等）
 */
export const admin: PermBody = {
  paths: [],
  apis: [],
};
