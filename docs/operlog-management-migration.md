# 操作日志迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\monitor\operlog`（`index.vue`、`detail.vue`）
> 目标：`src/views/monitor/operlog`（菜单属于「系统管理 → 日志管理 → 操作日志」）
>
> 本报告只做方案设计，不包含代码改动。

---

## 0. 方案确认点

1. 操作日志是**只读日志列表**：没有新增/修改表单，只有「详情」和删除/清空。
2. 详情用 `Dialog` 展示，请求参数/返回参数用 `<pre>` 格式化 JSON，并提供复制按钮。
3. 列表补充最小 loading 300ms + 骨架屏。
4. 支持按操作时间范围、操作人员、系统模块、操作类型、状态查询。
5. 不涉及导出以外的写操作；导出继续用 `download`。

---

## 1. 迁移范围与现状

参考文件：

| 文件 | 作用 |
|---|---|
| `index.vue` | 列表 + 查询 + 删除/清空 + 导出 + 详情弹窗 |
| `detail.vue` | 日志详情（模块信息、请求参数、返回参数、异常信息） |

当前项目：

- 没有 `views/monitor` 目录；
- 没有 `types/api/system/operlog.ts` 或 `types/api/monitor/operlog.ts`；
- 没有 `api/system/operlog.ts` 或 `api/monitor/operlog.ts`。

---

## 2. 目标组件结构

```
src/views/monitor/operlog/
├── index.vue          # PageHead + FilterBar + Table + OperlogDetailDialog
├── PageHead.vue       # 标题「操作日志」
├── FilterBar.vue      # 操作地址/系统模块/操作人员/类型/状态/操作时间
├── Table.vue          # 表格 + 工具栏 + 分页
└── OperlogDetailDialog.vue
```

API/类型建议放在 monitor 分类（与后端路由对应）：

```
src/types/api/monitor/operlog.ts
src/api/monitor/operlog.ts
```

并在 `src/types/api/index.ts` 增加 `export * from "./monitor/operlog"`。

---

## 3. 列表页设计

### 3.1 查询参数

```ts
interface OperlogQueryParams extends PageDomain {
  operIp?: string
  title?: string
  operName?: string
  businessType?: string
  status?: string
  params?: { beginTime?: string; endTime?: string }
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}
```

FilterBar：

| 字段 | 组件 |
|---|---|
| 操作地址 | `Input` |
| 系统模块 | `Input` |
| 操作人员 | `Input` |
| 类型 | `Select`（其他/新增/修改/删除/授权/导出/导入/强退/生成代码/清空数据） |
| 状态 | `Select`（成功/失败） |
| 操作时间 | 两个 `Input type="date"` |
| 查询 / 重置 | `Button` |

### 3.2 工具栏

| 按钮 | 行为 |
|---|---|
| 删除 | 单条/批量 → AlertDialog → `delOperlog(ids)` |
| 清空 | AlertDialog → `cleanOperlog()`（清空全部） |
| 导出 | `download('monitor/operlog/export', queryParams, ...)` |

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 勾选 | — | Checkbox |
| 日志编号 | `operId` | 文本 |
| 系统模块 | `title` | 文本 |
| 操作类型 | `businessType` | 标签（`sys_oper_type`） |
| 操作人员 | `operName` | 文本 |
| 操作地址 | `operIp` | 文本 |
| 操作状态 | `status` | 成功 / 失败（`sys_common_status`） |
| 操作日期 | `operTime` | 文本 |
| 消耗时间 | `costTime` | `xx ms` |
| 操作 | — | 详情 / 删除 |

列表加载：8 行 Skeleton + `MIN_LOADING_MS=300`。

---

## 4. 详情弹窗（OperlogDetailDialog）

### 4.1 字段

| 字段 | 说明 |
|---|---|
| 操作模块 | `title` |
| 登录信息 | `operName` + `operIp` + `operLocation` |
| 请求地址 | `operUrl` |
| 请求方式 | `requestMethod` |
| 操作方法 | `method` |
| 请求参数 | `operParam`（JSON 美化 + 复制） |
| 返回参数 | `jsonResult`（JSON 美化 + 复制） |
| 异常信息 | `errorMsg`（有值时显示） |
| 操作时间 | `operTime` |
| 消耗时间 | `costTime` |

### 4.2 交互

- 打开时取当前行数据即可（参考页面后端没有单独详情接口，列表行数据全量）；
- JSON 美化：
  ```ts
  function formatJson(value?: string) {
    try { return JSON.stringify(JSON.parse(value ?? ''), null, 2) }
    catch { return value ?? '' }
  }
  ```
- 复制按钮：`navigator.clipboard.writeText` + `ElMessage.success`；
- 长文本用 `max-h-64 overflow-auto` 的 `<pre>` 展示。

---

## 5. API / 类型

### 5.1 类型（新建）

`src/types/api/monitor/operlog.ts`：

```ts
export interface OperlogQueryParams extends PageDomain {
  operIp?: string
  title?: string
  operName?: string
  businessType?: string
  status?: string
  params?: { beginTime?: string; endTime?: string }
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}

export interface SysOperLog extends BaseEntity {
  operId?: number
  title?: string
  businessType?: number
  method?: string
  requestMethod?: string
  operatorType?: number
  operName?: string
  deptName?: string
  operUrl?: string
  operIp?: string
  operLocation?: string
  operParam?: string
  jsonResult?: string
  status?: number
  errorMsg?: string
  operTime?: string
  costTime?: number
}
```

> `businessType`/`status` 的类型以后端实际返回为准，参考字典值可能是数字。

### 5.2 API（新建 `src/api/monitor/operlog.ts`）

| 接口 | 方法 | 说明 |
|---|---|---|
| `/monitor/operlog/list` | GET | 分页列表 |
| `/monitor/operlog/{operId}` | DELETE | 删除（支持数组） |
| `/monitor/operlog/clean` | DELETE | 清空 |

---

## 6. Store（`src/store/system/operlog.ts`）

```ts
useSystemOperlogStore = defineStore('system-operlog', () => {
  queryParams, operlogList, total, loading, selectedIds
  getList()        // MIN_LOADING_MS=300 + requestSeq
  search(), resetQuery(), setPage(), setPageSize()

  detailVisible, detailLoading, currentLog
  openDetail(row), closeDetail()

  deleteVisible, deleteIds, deleteLoading
  openDeleteConfirm(ids), closeDeleteConfirm(), confirmDelete()
  cleanVisible, cleanLoading, openCleanConfirm(), confirmClean()
})
```

> 日志模块没有表单 scene，store 比用户/角色简单很多。

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
| `el-dialog` | `Dialog` |
| `dict-tag` | 文本/徽标映射 |
| `right-toolbar` | 列设置 `DropdownMenu` |
| `v-loading` | `loading` + `Skeleton` |
| 复制 | `navigator.clipboard` + `ElMessage` |
| 删除确认 | `AlertDialog` |

---

## 8. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 新建 operlog types + api，导出类型 |
| P1 | 列表页（查询/分页/删除/清空/导出） |
| P2 | 详情弹窗（JSON 展示 + 复制） |
| P3 | 联调（字典映射、分页、清空） |

---

## 9. 风险点

1. **字典值映射**：`businessType` 可能是数字（0-9）或字符串，需以实际接口为准；状态 0 成功 / 1 失败。
2. **详情无独立接口**：直接用列表行数据，若后端将来裁剪列表字段需要新接口。
3. **JSON 美化**：`operParam`/`jsonResult` 可能是空串或非法 JSON，要 try/catch。
4. **清空操作**：影响全部日志，必须二次确认。
5. **时间排序**：参考页面支持列排序（`orderByColumn/isAsc`），第一版可先不做，后续补。
6. **权限**：日志查询/删除权限点属于 `monitor:operlog:*`，需要时再接 `v-hasPermi`。

---

## 10. 验收清单

- [ ] 操作日志按操作地址/模块/人员/类型/状态/时间查询
- [ ] 分页、批量删除、清空、导出正常
- [ ] 详情弹窗字段完整，JSON 美化、复制可用
- [ ] 操作类型/状态标签正确
- [ ] 列表有最小 loading + 骨架
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
