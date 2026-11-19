/** 支持的小写 HTTP 方法，可直接当作 axios 的方法名使用 */
export type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * `METHOD:path` 形式的接口定义：方法大写、路径以 `/` 开头，可含 `:param` 占位符。
 *
 * - 静态路径：`'GET:/system/user/list'`
 * - 带路径参数：`'GET:/system/user/:id'`、`'GET:/monitor/cache/getValue/:cacheName/:cacheKey'`
 */
export type ApiDefinition = `${Uppercase<ApiMethod>}:/${string}`;

/** `useAPI` 的拆解结果 */
export interface ApiEndpoint {
  /** 小写 HTTP 方法 */
  method: ApiMethod;
  /** 去掉动态参数的集合路径前缀，末尾保留 '/'，方便直接拼接 id / 查询参数 */
  basePath: string;
}

const SUPPORTED_METHODS = new Set<ApiMethod>([
  'get',
  'post',
  'put',
  'patch',
  'delete',
]);

/**
 * 把各模块 `Xxx_API` 常量里的 `METHOD:path` 拆成 `{ method, basePath }`。
 *
 * - `method` 统一转小写，可直接作为 axios 的请求方法使用
 * - `basePath` 截断到第一个路径参数之前，并保留末尾 `/`
 *   （`PUT:/users/:id` → `/users/`，`GET:/users` → `/users`）
 *
 * 定义里的 `:id` 只是占位说明，`useAPI` 不解析参数名：它把路径截断到第一个
 * `/:` 之前作为 `basePath`，实际的参数值由调用方按定义里的顺序拼在 `basePath`
 * 之后；若为多段参数，段与段之间补 `/`，需要转义的参数自行 `encodeURIComponent`。
 * 若路径参数出现在中间（如 `/a/:id/b`），请改用 `request` + 完整 url，
 * 因为 `basePath` 会在第一个参数处被截断。
 *
 * 命名用 `basePath` 而不是 `baseUrl`：这里只是路径前缀（不含 origin），
 * 而 axios 实例的 baseURL 是 `/api`，两者不是一回事，避免混淆。
 *
 * @example
 * const { method, basePath } = useAPI(USER_API.DETAIL);
 * // method   === 'get'
 * // basePath === '/system/user/'
 * request({ url: basePath + userId, method });
 *
 * @param api 模块 API 常量成员，聚合入口为 `APIS.USER_DETAIL`
 * @throws 接口定义不是合法的 `METHOD:path` 格式时抛错
 */
export function useAPI(api: ApiDefinition): ApiEndpoint {
  const separator = api.indexOf(':');

  if (separator <= 0) {
    throw new Error(`[useAPI] 无法解析接口定义: ${api}`);
  }

  const rawMethod = api.slice(0, separator).toLowerCase();
  const path = api.slice(separator + 1);

  if (!SUPPORTED_METHODS.has(rawMethod as ApiMethod)) {
    throw new Error(`[useAPI] 不支持的请求方法: ${api}`);
  }

  if (!path.startsWith('/')) {
    throw new Error(`[useAPI] 接口路径必须以 '/' 开头: ${api}`);
  }

  return { method: rawMethod as ApiMethod, basePath: toBasePath(path) };
}

/**
 * 截断到第一个动态参数之前，保留集合路径与末尾斜杠。
 *
 * `/users/:id`                        → `/users/`
 * `/user-roles/user/:userId/role/:roleId` → `/user-roles/user/`
 * `/users`                            → `/users`
 */
function toBasePath(path: string): string {
  const dynamicIndex = path.indexOf('/:');
  return dynamicIndex === -1 ? path : path.slice(0, dynamicIndex + 1);
}
