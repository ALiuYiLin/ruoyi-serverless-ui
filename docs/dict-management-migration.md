# 字典管理迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\system\dict`（`index.vue`、`data.vue`、`detail.vue`）
> 目标：`src/views/system/dict`，对齐现有系统管理模块的 shadcn-vue + Pinia + Tailwind 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 0. 方案确认点

1. **字典类型 + 字典数据两级**：
   - 字典类型列表（`index.vue`）；
   - 字典数据（参考实现同时有 `detail.vue` 抽屉和 `data.vue` 独立页面）。
2. 建议迁移时 **先做抽屉（DictDataDrawer）**：点击「列表」在当前页打开字典数据抽屉，交互更轻；
   `data.vue` 独立页面作为可选（对应后端隐藏路由 `/system/dict-data/index/:dictId`）。
3. 列表补充用户管理同款「最小 loading 300ms + 骨架屏」。
4. 字典数据的状态只展示，不做 Switch（参考页面是 `dict-tag`）。

---

## 1. 迁移范围

| 参考文件 | 作用 | 迁移后 |
|---|---|---|
| `index.vue` | 字典类型列表 + 新增/修改弹窗 + 刷新缓存 + 导出 | `PageHead / FilterBar / Table / DictTypeForm` |
| `detail.vue` | 字典数据抽屉 | `DictDataDrawer.vue` |
| `data.vue` | 字典数据独立页 | 可选：`data.vue`（隐藏路由） |

API 参考目录：`src/api/system/dict/type.ts`、`src/api/system/dict/data.ts`。

---

## 2. 目标组件结构

```
src/views/system/dict/
├── index.vue          # PageHead + FilterBar + Table + DictTypeForm + DictDataDrawer
├── PageHead.vue       # 字典管理 + 新增
├── FilterBar.vue      # 字典名称 / 字典类型 / 状态 / 创建时间
├── Table.vue          # 字典类型表格 + 工具栏 + 分页
├── DictTypeForm.vue   # scene = view | add | edit
├── DictDataDrawer.vue # 字典数据抽屉（搜索 + CRUD）
└── DictDataForm.vue   # 字典数据新增/修改表单（抽屉内）
```

---

## 3. 字典类型列表

### 3.1 查询参数（`DictTypeQueryParams`）

```ts
{
  pageNum, pageSize,
  dictName?: string,
  dictType?: string,
  status?: '0' | '1',
  params?: { beginTime?: string; endTime?: string }
}
```

FilterBar：

| 字段 | 组件 |
|---|---|
| 字典名称 | `Input` |
| 字典类型 | `Input` |
| 状态 | `Select` |
| 创建时间 | 两个 `Input type="date"` |
| 查询 / 重置 | `Button` |

### 3.2 工具栏

| 按钮 | 行为 |
|---|---|
| 新增 | 打开 DictTypeForm（add） |
| 修改 | 选中一行时可用 |
| 删除 | 批量删除（AlertDialog） |
| 导出 | `download('system/dict/type/export', queryParams, ...)` |
| 刷新缓存 | `refreshCache()` → 成功提示 |

### 3.3 表格列

| 列 | 字段 |
|---|---|
| 勾选 | — |
| 字典编号 | `dictId` |
| 字典名称 | `dictName` |
| 字典类型 | `dictType`（可点击打开字典数据抽屉） |
| 状态 | `status`（正常 / 停用文本） |
| 备注 | `remark` |
| 创建时间 | `createTime` |
| 操作 | 修改 / 列表（打开抽屉）/ 删除 |

### 3.4 字典类型表单

| 字段 | 组件 | 校验 |
|---|---|---|
| 字典名称 | `Input` | 必填 |
| 字典类型 | `Input` | 必填 |
| 状态 | `Select` | 正常 / 停用 |
| 备注 | `Textarea` | 可选 |

`scene = view / add / edit`，view 全 disabled，只保留关闭。

---

## 4. 字典数据（DictDataDrawer）

### 4.1 交互

- 从字典类型行「列表」打开；
- 抽屉顶部显示当前 `dictType`；
- 查询条件：字典标签 `dictLabel`、状态；
- 工具栏：新增 / 修改 / 删除 / 导出；
- 分页。

### 4.2 列

| 列 | 字段 |
|---|---|
| 勾选 | — |
| 字典编码 | `dictCode` |
| 字典标签 | `dictLabel`（按 `listClass/cssClass` 显示颜色） |
| 字典键值 | `dictValue` |
| 字典排序 | `dictSort` |
| 状态 | `status` |
| 备注 | `remark` |
| 创建时间 | `createTime` |
| 操作 | 修改 / 删除 |

### 4.3 字典数据表单

| 字段 | 组件 | 说明 |
|---|---|---|
| 字典类型 | `Input disabled` | 当前字典类型 |
| 数据标签 | `Input` | 必填 |
| 数据键值 | `Input` | 必填 |
| 样式属性 | `Input` | `cssClass` |
| 显示排序 | `Input type="number"` | 必填 |
| 回显样式 | `Select` | default / primary / success / info / warning / danger（`listClass`） |
| 状态 | `Select` | 正常 / 停用 |
| 备注 | `Textarea` | 可选 |

可选：`isDefault`（是否默认 Y/N）。

---

## 5. API / 类型

### 5.1 类型

`src/types/api/system/dict.ts` 已存在：

- `DictTypeQueryParams`
- `DictDataQueryParams`
- `SysDictType`
- `SysDictData`

直接复用。

### 5.2 新增 API

建议按参考目录拆分：

```
src/api/system/dict/type.ts
src/api/system/dict/data.ts
```

| 文件 | 接口 |
|---|---|
| `type.ts` | `listType / getType / addType / updateType / delType / refreshCache / optionselect` |
| `data.ts` | `listData / getData / getDicts / addData / updateData / delData` |

接口路径：

- `/system/dict/type/list`、`/system/dict/type/{dictId}`、`/system/dict/type`、`/system/dict/type/refreshCache`、`/system/dict/type/optionselect`
- `/system/dict/data/list`、`/system/dict/data/{dictCode}`、`/system/dict/data/type/{dictType}`、`/system/dict/data`

返回类型注意 `TableDataInfo<SysDictType>` / `TableDataInfo<SysDictData>`（单层）。

---

## 6. Store

### 6.1 字典类型

```ts
useSystemDictTypeStore = defineStore('system-dict-type', () => {
  queryParams, typeList, total, loading
  getList()          // MIN_LOADING_MS=300 + requestSeq
  search(), resetQuery(), setPage(), setPageSize()
  formVisible, formScene, formLoading, formData
  openAddForm(), openEditForm(row), openViewForm(row)
  closeForm(), submitForm()
  deleteVisible, deleteIds, confirmDelete()
  refreshCache()
})
```

### 6.2 字典数据

可以放在同一个 store（`drawerVisible/drawerDictType/dataList...`），也可以单独一个 `useSystemDictDataStore`。
建议单独放，避免字典类型 store 过大。

---

## 7. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-input` | `Input` |
| `el-select` | `Select` |
| `el-date-picker` | 两个 `Input type="date"` |
| `el-drawer` | `Sheet`（项目已有 `components/ui/sheet`） |
| `el-table` | `Table` 系列 |
| `pagination` | `Pagination` |
| `el-tag` | 文本/徽标 span |
| `right-toolbar` | 列设置 `DropdownMenu` |
| `v-loading` | `loading` + `Skeleton` |
| `el-dialog` | `Dialog` |
| 删除确认 | `AlertDialog` |

---

## 8. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 新建 `api/system/dict/type.ts`、`data.ts` |
| P1 | 字典类型列表（查询/分页/删除/导出/刷新缓存） |
| P2 | DictTypeForm（view/add/edit） |
| P3 | DictDataDrawer + DictDataForm（查询/CRUD/导出） |
| P4 | 可选：独立字典数据页面 + 隐藏路由 |
| P5 | 联调 |

---

## 9. 风险点

1. **两级数据**：dict 类型与字典数据两个 CRUD，尽量拆 store 和组件。
2. **字典数据回显样式**：`listClass` 对应颜色类，需要映射到项目 Tailwind 类；`cssClass` 仅原样保存。
3. **刷新缓存**：接口会影响全局字典缓存，成功后需要提示（必要时刷新当前页面字典数据）。
4. **字典数据路由**：如果后端菜单有隐藏的 `dict-data` 页面，需要确认动态路由是否已生成；优先做抽屉可绕开。
5. **状态不切换**：参考页面没有 status 开关接口，展示文本即可。
6. **导出**：字典类型和字典数据各有一个导出接口，注意路径区分。

---

## 10. 验收清单

- [ ] 字典类型按名称/类型/状态/创建时间查询
- [ ] 分页、批量删除、导出、刷新缓存正常
- [ ] 新增/修改/查看字典类型正常
- [ ] 从字典类型打开字典数据抽屉
- [ ] 字典数据按标签/状态查询、分页、CRUD、导出正常
- [ ] 字典数据回显样式颜色正确
- [ ] 列表有最小 loading + 骨架
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
