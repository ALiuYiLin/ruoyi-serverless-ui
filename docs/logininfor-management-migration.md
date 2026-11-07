# 登录日志迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\monitor\logininfor\index.vue`
> 目标：`src/views/monitor/logininfor`（菜单属于「系统管理 → 日志管理 → 登录日志」）
>
> 本报告只做方案设计，不包含代码改动。

---

## 0. 方案确认点

1. 登录日志是**只读日志列表**：没有新增/修改表单，只有查询、删除、清空、解锁、导出。
2. 账户解锁：选中一条登录记录，按该记录 `userName` 调 `unlockLogininfor(userName)`。
3. 列表补充最小 loading 300ms + 骨架屏。
4. 状态映射：`0` 成功 / `1` 失败。

---

## 1. 迁移范围与现状

参考文件：`monitor/logininfor/index.vue`（单文件）。

当前项目：

- 没有 `views/monitor` 目录；
- 没有 `types/api/monitor/logininfor.ts`；
- 没有 `api/monitor/logininfor.ts`。

---

## 2. 目标组件结构

```
src/views/monitor/logininfor/
├── index.vue        # PageHead + FilterBar + Table
├── PageHead.vue     # 标题「登录日志」
├── FilterBar.vue    # 登录地址 / 用户名称 / 状态 / 登录时间
└── Table.vue        # 表格 + 工具栏 + 分页
```

API/类型建议放 monitor 分类：

```
src/types/api/monitor/logininfor.ts
src/api/monitor/logininfor.ts
```

`src/types/api/index.ts` 增加 `export * from "./monitor/logininfor"`。

---

## 3. 列表页设计

### 3.1 查询参数

```ts
interface LogininforQueryParams extends PageDomain {
  ipaddr?: string
  userName?: string
  status?: string
  params?: { beginTime?: string; endTime?: string }
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}
```

FilterBar：

| 字段 | 组件 |
|---|---|
| 登录地址 | `Input` |
| 用户名称 | `Input` |
| 状态 | `Select`（成功 / 失败） |
| 登录时间 | 两个 `Input type="date"` |
| 查询 / 重置 | `Button` |

### 3.2 工具栏

| 按钮 | 行为 |
|---|---|
| 解锁 | 需选中**一行** → 取该行 `userName` → AlertDialog → `unlockLogininfor(userName)` |
| 删除 | 单条/批量 → AlertDialog → `delLogininfor(ids)` |
| 清空 | AlertDialog → `cleanLogininfor()` |
| 导出 | `download('monitor/logininfor/export', queryParams, 'logininfor_xxx.xlsx')` |

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 勾选 | — | Checkbox |
| 访问编号 | `infoId` | 文本 |
| 用户名称 | `userName` | 文本 |
| 地址 | `ipaddr` | 文本 |
| 登录地点 | `loginLocation` | 文本 |
| 操作系统 | `os` | 文本 |
| 浏览器 | `browser` | 文本 |
| 登录状态 | `status` | 成功 / 失败 |
| 描述 | `msg` | 文本 |
| 访问时间 | `loginTime` | 文本 |
| 操作 | — | 删除 |

列表加载：8 行 Skeleton + `MIN_LOADING_MS=300`。

---

## 4. 解锁交互

```
选中一行 → 点击「解锁」→ AlertDialog 确认「是否确认解锁用户 xxx?」
        → unlockLogininfor(userName)
        → 成功提示「用户 xxx 解锁成功」
```

- 工具栏「解锁」按钮在 `selectedIds.length !== 1` 时禁用；
- 选中行需要同时保存 `userName`（不能只存 infoId）；
- 失败（用户不存在/未锁定）由后端返回，前端统一提示。

---

## 5. API / 类型

### 5.1 类型（新建）

`src/types/api/monitor/logininfor.ts`：

```ts
export interface LogininforQueryParams extends PageDomain {
  ipaddr?: string
  userName?: string
  status?: string
  params?: { beginTime?: string; endTime?: string }
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}

export interface SysLogininfor extends BaseEntity {
  infoId?: number
  userName?: string
  ipaddr?: string
  loginLocation?: string
  browser?: string
  os?: string
  status?: '0' | '1'
  msg?: string
  loginTime?: string
}
```

### 5.2 API（新建 `src/api/monitor/logininfor.ts`）

| 接口 | 方法 | 说明 |
|---|---|---|
| `/monitor/logininfor/list` | GET | 分页列表 |
| `/monitor/logininfor/{infoId}` | DELETE | 删除（支持数组） |
| `/monitor/logininfor/unlock/{userName}` | GET/PUT | 账户解锁（以参考实现为准） |
| `/monitor/logininfor/clean` | DELETE | 清空 |

返回类型注意 `TableDataInfo<SysLogininfor>`（单层）。

---

## 6. Store（`src/store/system/logininfor.ts`）

```ts
useSystemLogininforStore = defineStore('system-logininfor', () => {
  queryParams, logininforList, total, loading
  getList()        // MIN_LOADING_MS=300 + requestSeq
  search(), resetQuery(), setPage(), setPageSize()

  selectedIds, selectedUserName
  unlockVisible, unlockLoading, openUnlockConfirm(row), confirmUnlock()

  deleteVisible, deleteIds, deleteLoading
  openDeleteConfirm(ids), closeDeleteConfirm(), confirmDelete()
  cleanVisible, cleanLoading, openCleanConfirm(), confirmClean()
})
```

> 日志模块没有表单 scene，逻辑比用户/角色简单；解锁确认也可放在 Table 内部。

---

## 7. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-input` | `Input` |
| `el-select` | `Select` |
| `el-date-picker` | 两个 `Input type="date"` |
| `el-table` | `Table` 系列 |
| `pagination` | `Pagination` |
| `el-tag` | 文本/徽标 |
| `dict-tag` | 文本/徽标映射 |
| `right-toolbar` | 列设置 `DropdownMenu` |
| `v-loading` | `loading` + `Skeleton` |
| 删除/清空/解锁确认 | `AlertDialog` |
| 导出 | `download` 工具 |

---

## 8. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 新建 types/api（monitor/logininfor） |
| P1 | 列表页（查询/分页/删除/清空/导出） |
| P2 | 账户解锁（单行选择 + 确认） |
| P3 | 联调（状态映射、解锁接口） |

---

## 9. 风险点

1. **解锁接口路径/方法**：RuoYi 版本差异较大，需以后端实际路由为准（可能是 `PUT /monitor/logininfor/unlock/{userName}`）。
2. **解锁需要 userName**：不能只依赖 `infoId`，选中行时要保存整行数据。
3. **清空操作**：影响全部登录日志，必须二次确认。
4. **状态映射**：0 成功 / 1 失败。
5. **权限点**：`monitor:logininfor:*`，需要时接 `v-hasPermi`。
6. **排序**：参考页面支持列排序，第一版可先不做。

---

## 10. 验收清单

- [ ] 登录日志按地址/用户/状态/时间查询
- [ ] 分页、批量删除、清空、导出正常
- [ ] 选中单行可解锁，成功/失败提示正确
- [ ] 登录状态显示成功/失败
- [ ] 列表有最小 loading + 骨架
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
