# 参数设置（配置管理）迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\system\config\index.vue`
> 目标：`src/views/system/config`，对齐现有系统管理模块的 shadcn-vue + Pinia + Tailwind 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 1. 迁移范围与现状

参考页面：参数配置分页列表 + 新增/修改弹窗 + 导出 + 刷新缓存。

当前项目已有：

- `src/types/api/system/config.ts`：`ConfigQueryParams`、`SysConfig`
- `src/api/system/config.ts`：`listConfig / getConfig / getConfigKey / addConfig / updateConfig / delConfig / refreshCache`

需要确认/修正：

- `listConfig` 返回类型应为 `TableDataInfo<SysConfig>`（不要写成 `SysConfig[]` 造成双层数组）；
- 状态/系统内置字段使用 `'Y' | 'N'`。

需要新增：`src/store/system/config.ts`、`src/views/system/config/` 页面组件。

---

## 2. 目标组件结构

```
src/views/system/config/
├── index.vue         # PageHead + FilterBar + Table + ConfigForm
├── PageHead.vue      # 标题「参数设置」+ 新增
├── FilterBar.vue     # 参数名称 / 参数键名 / 系统内置 / 创建时间
├── Table.vue         # 表格 + 工具栏 + 分页
└── ConfigForm.vue    # scene = view | add | edit
```

---

## 3. 列表页设计

### 3.1 查询参数（`ConfigQueryParams`）

```ts
{
  pageNum, pageSize,
  configName?: string,
  configKey?: string,
  configType?: 'Y' | 'N',
  params?: { beginTime?: string; endTime?: string }
}
```

FilterBar：

| 字段 | 组件 |
|---|---|
| 参数名称 | `Input` |
| 参数键名 | `Input` |
| 系统内置 | `Select`（全部 / 是 Y / 否 N） |
| 创建时间 | 两个 `Input type="date"` |
| 查询 / 重置 | `Button` |

### 3.2 工具栏

| 按钮 | 行为 |
|---|---|
| 新增 | 打开 ConfigForm（add） |
| 修改 | 选中单行可用 |
| 删除 | 单条/批量 → AlertDialog → `delConfig(ids)` |
| 导出 | `download('system/config/export', queryParams, 'config_xxx.xlsx')` |
| 刷新缓存 | `refreshCache()` → 成功提示 |

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 勾选 | — | Checkbox |
| 参数主键 | `configId` | 文本 |
| 参数名称 | `configName` | 文本 |
| 参数键名 | `configKey` | 文本 |
| 参数键值 | `configValue` | 文本（可截断） |
| 系统内置 | `configType` | 是 / 否 标签 |
| 备注 | `remark` | 文本 |
| 创建时间 | `createTime` | 文本 |
| 操作 | — | 修改 / 删除 |

列表加载：8 行 Skeleton + `MIN_LOADING_MS=300`。

---

## 4. ConfigForm

### 4.1 场景

```
scene = 'view' | 'add' | 'edit'
```

- view：全部 disabled，仅「关闭」；
- add/edit：可编辑，`edit` 用 `getConfig(configId)` 回显。

### 4.2 字段

| 字段 | 组件 | 校验 |
|---|---|---|
| 参数名称 | `Input` | 必填 |
| 参数键名 | `Input` | 必填 |
| 参数键值 | `Input` | 必填 |
| 系统内置 | `Select`（是 Y / 否 N） | 必填 |
| 备注 | `Textarea` | 可选 |

> 参考页面参数键值也是普通 input；如需长文本可换 Textarea，但保持与后端字段一致。

---

## 5. API / 类型

### 5.1 已有接口

| 接口 | 方法 | 说明 |
|---|---|---|
| `/system/config/list` | GET | 分页列表 |
| `/system/config/{configId}` | GET | 详情 |
| `/system/config/configKey/{configKey}` | GET | 按键名取值（`getConfigKey`） |
| `/system/config` | POST | 新增 |
| `/system/config` | PUT | 修改 |
| `/system/config/{configId}` | DELETE | 删除 |
| `/system/config/refreshCache` | DELETE | 刷新缓存（以现有 api 实现为准） |

### 5.2 类型

`ConfigQueryParams`、`SysConfig` 已存在，直接复用。

---

## 6. Store（`src/store/system/config.ts`）

```ts
useSystemConfigStore = defineStore('system-config', () => {
  queryParams, configList, total, loading
  getList()          // MIN_LOADING_MS=300 + requestSeq
  search(), resetQuery(), setPage(), setPageSize()

  formVisible, formScene, formLoading, formData
  openAddForm(), openEditForm(row), openViewForm(row)
  closeForm(), submitForm()

  deleteVisible, deleteIds, deleteLoading
  openDeleteConfirm(ids), closeDeleteConfirm(), confirmDelete()

  refreshCache()
})
```

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
| `right-toolbar` | 列设置 `DropdownMenu` |
| `v-loading` | `loading` + `Skeleton` |
| `el-dialog` | `Dialog` |
| 删除确认 | `AlertDialog` |

---

## 8. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 检查/修正 `api/system/config.ts` 的泛型与 refreshCache 方法 |
| P1 | 列表页（查询/分页/删除/导出/刷新缓存） |
| P2 | ConfigForm（view/add/edit） |
| P3 | 联调与验收 |

---

## 9. 风险点

1. **返回类型**：`TableDataInfo<SysConfig>`，避免 `SysConfig[][]`。
2. **刷新缓存接口**：确认当前 api 文件中 `refreshCache` 的请求方法（DELETE/POST）与后端一致。
3. **系统内置字段**：`configType` 是 `'Y' | 'N'`，不要把是/否当作状态 0/1。
4. **导出**：路径为 `system/config/export`，参数用当前查询条件。
5. **参数键值**：可能很长，表格用 truncate + title 悬浮显示。

---

## 10. 验收清单

- [ ] 参数列表按名称/键名/系统内置/创建时间查询
- [ ] 分页、列设置、批量删除、导出正常
- [ ] 新增/修改/查看参数正常
- [ ] 刷新缓存成功提示
- [ ] 系统内置显示是/否
- [ ] 列表有最小 loading + 骨架
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
