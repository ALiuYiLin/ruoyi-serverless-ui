# 权限驱动的路由 / 菜单过滤方案

> 状态：已实施（P1–P4），后端 `GET /getPerms` 未就绪前用 `VITE_PERM_MOCK` 走本地 mock。
>
> 相关文件：`src/perm`、`src/router/routes.ts`、`src/router/dynamic.ts`、`src/api/perm.ts`、
> `src/store/modules/permission.ts`、`src/permission.ts`、`scripts/perm/index.ts`。

## 1. 背景

原来动态路由来自后端 `/getRouters` 返回的菜单树，权限判断依赖 RuoYi 的权限字符
（`system:user:list` 等）。现在改为：

- 路由：前端静态维护（`src/router/dynamic.ts`），路径常量统一在 `src/router/routes.ts`
- 权限：后端按用户角色下发「有效权限集」，结构同 `tmp/perms.json`
- 过滤：前端用权限集裁剪路由和菜单

## 2. 接口契约

`GET /getPerms`（登录后调用一次），响应体：

```jsonc
{
  "code": 200,
  "msg": "success",
  "data": {
    "base":      { "paths": ["/login", "/register", "/:pathMatch(.*)*"], "apis": ["POST:/login"] },
    "base_auth": { "paths": ["/index", "/lock"], "apis": ["POST:/logout", "GET:/getInfo"] },
    "role": {
      "user_read": { "paths": ["/system/user"], "apis": ["GET:/system/user/list"] },
      "role_read": { "paths": ["/system/role"], "apis": ["GET:/system/role/list"] }
    },
    "admin":     { "paths": [], "apis": [] }
  }
}
```

约定：

1. `base` / `base_auth` 恒返回，所有用户一致
2. `role` 只包含当前用户角色**已授权**的权限项（键名与 `src/perm` 一致），可能是空对象
3. `admin` 只有 `admin` 角色返回内容；管理员也可以直接返回全量 `role`
4. `paths` 使用完整路由地址（`/system/log/operlog`），与 `ROUTE_PATHS` 取值一致
5. `apis` 使用 `METHOD:path` 形式，与 `APIS` 取值一致

前端另有兜底：`roles.includes('admin')` 时直接放行全部路径与接口，避免后端漏配把管理员锁死。

## 3. 数据流

```
登录成功
  └─ 路由守卫（src/permission.ts）
       ├─ getInfo()                 → roles / permissions（保留）
       ├─ getUserPerms()            → data: UserPermTree（或 mock）
       ├─ flattenPerms(data)        → { paths: Set, apis: Set }
       ├─ permissionStore.generateRoutes(access)
       │     ├─ filterRoutes(dynamicRoutes, paths)
       │     ├─ routes / addRoutes / sidebarRouters / defaultRoutes / topbarRouters
       │     └─ loaded = true
       ├─ router.addRoute(...)      → 注册过滤后的动态路由
       └─ return { ...to, replace: true }   → 重新导航
```

后续每次跳转：`loaded === true` 时只做鉴权判断，不再重复请求权限。

## 4. 路由过滤算法

```ts
function filterRoutes(routes, allowedPaths) {
  return routes.flatMap((route) => {
    const children = route.children ? filterRoutes(route.children, allowedPaths) : []
    const keepSelf = allowedPaths.has(route.path)   // 叶子：路径被授权
    const keepGroup = children.length > 0           // 分组：至少有一个子路由被保留
    if (!keepSelf && !keepGroup) return []
    return [{ ...route, children: route.children ? children : undefined }]
  })
}
```

- 分组路径（`/system`、`/monitor`、`/system/log`）不在权限集里，靠子路由存活带出，不会出现空分组
- 注册后把分组路径也并入 `permissionStore.paths`，直接访问 `/system` 时能正常走 redirect
- 未授权地址不会注册 → 守卫判定不在 `paths` 内 → 跳 `/401`

## 5. 菜单过滤

菜单直接由过滤后的路由推导，不再使用后端菜单树：

- `sidebarRouters = constantRoutes + filteredRoutes`
- `NavMenu` 继续负责 `hidden` 过滤、相对路径拼接、图标映射
- `src/router/sidebar-menus.ts` 仅作静态对照，不参与运行时；若后续要启用，必须与
  `dynamicRoutes` 保持同一份路径（可加一致性校验脚本）

## 6. 公共路径（避免 401 自锁）

以下路径永远放行，不参与权限判断：

- `/`、`/index`、`/login`、`/register`、`/401`、`/lock`
- `/redirect/**`（页签刷新中转）

即使后端漏返回 `base_auth`，也不会出现「登录后立刻 401」。

## 7. Mock（后端就绪前）

- `src/api/perm.mock.ts`：按角色返回权限树，数据直接取自 `@/perm` 的 `base` / `base_auth` / `PERMS`
- 角色映射：
  - `admin`：全量
  - `viewer`：系统管理只读
  - `operator`：系统管理只读 + 用户/角色/部门/通知写权限
  - `monitor`：监控模块只读
  - 其他角色：默认按 `viewer`
- 开关：`.env.development` 中 `VITE_PERM_MOCK=true`；真实接口就绪后置为 `false`

## 8. 兼容与回退

- `VITE_ROUTE_SOURCE=static|backend`：默认 `static`（新逻辑）；设为 `backend` 可回退到
  `/getRouters` 生成菜单的旧逻辑（旧代码保留在 permission store 中）
- `roles` / `permissions` 字段与 `v-hasPermi` / `v-hasRole` 指令保持不变，逐步迁移
- `src/api/menu.ts` 的 `getRouters` 保留，待新逻辑稳定后再删除

## 9. 接口级权限

- `permissionStore.hasApi(APIS.USER_ADD)` 判断接口是否在授权集
- 指令 `v-hasApi="APIS.USER_ADD"`（支持数组），用法与 `v-hasPermi` 一致
- 前端仅做显隐控制，真正的拦截由后端按 `apis` 鉴权

## 10. 改动清单

| 文件 | 内容 |
| --- | --- |
| `src/types/api/perm.ts` | `UserPermBody` / `UserPermTree` / `UserPermResult` |
| `src/api/perm.ts` | `GET:/getPerms` 接口 + mock 开关 |
| `src/api/perm.mock.ts` | 角色 → 权限树 mock |
| `src/perm/access.ts` | `flattenPerms` / `filterRoutes` / `allAccess` / `isPublicPath` |
| `src/perm/base.ts` | `base_auth.apis` 增加 `APIS.USER_PERMS` |
| `src/api/index.ts` | `APIS` 聚合新增 `PERM_API` |
| `src/store/modules/permission.ts` | 新增 `loaded/paths/apis`，静态路由过滤，旧逻辑保留为回退 |
| `src/permission.ts` | 守卫改为「权限集 → 路由过滤 → 401」 |
| `src/directive/permission/hasApi.ts` | 接口级权限指令 |
| `.env.development` | `VITE_PERM_MOCK=true` |

## 11. 验收

- [x] `pnpm gen:perm`：paths 23/23、apis 118/118，无缺漏
- [x] `pnpm type-check`、`pnpm build:prod` 通过
- [x] mock 角色（admin / viewer / operator / monitor）过滤结果符合预期
- [ ] 后端 `GET /getPerms` 就绪后关闭 mock 联调
- [ ] 逐步用 `v-hasApi` 替换按钮显示逻辑

## 12. 边界与风险

1. **路径口径**：后端必须返回与 `ROUTE_PATHS` 相同的完整地址，否则过滤落空；可参考
   `tmp/perms.json` 作为契约基准
2. **404 vs 401**：未授权/不存在的地址统一跳 `/401`（当前实现）；如需区分，可在守卫里
   先判断地址是否存在于 `dynamicRoutes`
3. **重复注册**：`dynamicRoutes` 的 `name` 唯一，重复登录/刷新时 `addRoute` 按名称覆盖
4. **配置漂移**：新增页面时需同步 `routes.ts` + `dynamic.ts` + `src/perm`，`pnpm gen:perm` 会校验
5. **循环依赖**：`dynamicRoutes` 里的 `Layout` / `ParentView` 必须懒加载
   （`() => import(...)`）。`permission` store 被布局（AppSidebar）引用，若 `dynamic.ts`
   再顶层 import 布局组件，会形成 `layout → AppSidebar → store → dynamic → layout`
   的循环，命中 `Cannot access 'Layout' before initialization` 的 TDZ 错误
