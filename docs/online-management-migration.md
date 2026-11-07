# 在线用户迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\monitor\online\index.vue`
> 目标：`src/views/monitor/online`，继续使用 shadcn-vue + Tailwind + Pinia 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 1. 迁移范围与现状

参考页面：在线用户分页列表 + 查询 + 单条强退。

当前项目：

- `src/views/monitor/` 下已有 operlog、logininfor；
- 缺少 online 的类型、API、页面；
- 当前项目没有 `types/api/monitor/online.ts`、`api/monitor/online.ts`。

后端接口已验证：

- `GET /monitor/online/list?pageNum=1&pageSize=10` → 200，total=3；
- 返回字段：`tokenId / userName / deptName / ipaddr / loginLocation / os / browser / loginTime`。

---

## 2. 目标组件结构

```
src/types/api/monitor/online.ts
src/api/monitor/online.ts
src/store/system/online.ts（可选）
src/views/monitor/online/
├── index.vue        # PageHead + FilterBar + Table
├── PageHead.vue     # 标题「在线用户」
├── FilterBar.vue    # 登录地址 / 用户名称
└── Table.vue        # 表格 + 分页 + 强退确认
```

在线用户是只读列表，可以不用 store，直接在页面内维护状态；如果为了统一，也可以加一个轻量 store。

---

## 3. 列表设计

### 3.1 查询参数

```ts
export interface OnlineQueryParams extends PageDomain {
  ipaddr?: string
  userName?: string
}
```

FilterBar：

| 字段 | 组件 |
|---|---|
| 登录地址 | `Input` |
| 用户名称 | `Input` |
| 查询 / 重置 | `Button` |

### 3.2 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 序号 | index | 行号 |
| 会话编号 | `tokenId` | 文本（truncate） |
| 登录名称 | `userName` | 文本 |
| 所属部门 | `deptName` | 文本 |
| 主机 | `ipaddr` | 文本 |
| 登录地点 | `loginLocation` | 文本 |
| 操作系统 | `os` | 文本 |
| 浏览器 | `browser` | 文本 |
| 登录时间 | `loginTime` | 时间戳，用 `parseTime` 格式化 |
| 操作 | — | 强退 |

- 无新增/修改表单；
- 强退：`AlertDialog` 确认 → `forceLogout(tokenId)` → 刷新列表；
- 分页 + 骨架屏（8 行）+ 最小 loading 300ms（与已迁移日志页一致）；
- `loginTime` 后端返回的是毫秒时间戳，注意格式化。

---

## 4. API / 类型

### 4.1 类型（新建）

`src/types/api/monitor/online.ts`：

```ts
export interface OnlineQueryParams extends PageDomain {
  ipaddr?: string
  userName?: string
}

export interface SysUserOnline {
  tokenId?: string
  deptName?: string
  userName?: string
  ipaddr?: string
  loginLocation?: string
  browser?: string
  os?: string
  loginTime?: number
}
```

并在 `src/types/api/index.ts` 增加导出。

### 4.2 API（新建 `src/api/monitor/online.ts`）

| 接口 | 方法 | 说明 |
|---|---|---|
| `/monitor/online/list` | GET | 分页列表 |
| `/monitor/online/{tokenId}` | DELETE | 强退 |

---

## 5. 页面状态

```ts
queryParams: OnlineQueryParams
onlineList, total, loading, requestSeq
getList(), search(), resetQuery(), setPage(), setPageSize()
forceLogoutVisible, forceLogoutRow
openForceLogoutConfirm(row), confirmForceLogout()
```

没有表单 scene，逻辑比业务模块简单。

---

## 6. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-input` | `Input` |
| `el-table` | `Table` 系列 |
| `pagination` | `Pagination` |
| `v-loading` | `loading` + `Skeleton` |
| `$modal.confirm` | `AlertDialog` |
| `parseTime` | `@/utils/ruoyi parseTime` |

---

## 7. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 新建 online types + api |
| P1 | 列表页（查询/分页/强退） |
| P2 | 联调（登录时间格式化、强退后刷新） |

---

## 8. 风险点

1. **`loginTime` 是时间戳**：直接用原值会显示数字，必须 `parseTime`。
2. **强退后 token 失效**：如果强退的是自己，当前会话会下线，需要刷新/重新登录。
3. **权限点**：`monitor:online:list`、`monitor:online:forceLogout`，需要时接 `v-hasPermi`。
4. **分页**：后端返回 `TableDataInfo`，注意单层泛型。

---

## 9. 验收清单

- [ ] 在线用户按登录地址/用户名称查询
- [ ] 分页正常
- [ ] 强退有确认弹窗，成功后列表刷新
- [ ] 登录时间格式化正确
- [ ] 列表有最小 loading + 骨架
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
