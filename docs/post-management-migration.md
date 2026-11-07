# 岗位管理迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 目标：把 `E:\code3\RuoYi-Vue3\src\views\system\post` 迁移到
> `E:\code3\ruoyi-ts\src\views\system\post`，对齐当前
> `src/views/system/user`、`role`、`dept` 的 shadcn-vue + Pinia store + Tailwind 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 0. 方案确认点

1. 岗位管理是标准「分页列表 + 单表单弹窗」，没有树、没有额外弹窗，结构比角色/部门简单。
2. **状态列只展示，不做 Switch**：后端没有 `changeStatus` 接口，参考页面也是 `dict-tag` 展示。
3. 表单沿用当前模式：`PostForm` 支持 `scene = 'view' | 'add' | 'edit'`，view 只读。
4. 列表补齐用户管理同款「最小 loading 时间（300ms）+ 骨架屏」。
5. 工具栏保留：批量删除、列设置、导出；新增按钮放在 PageHead。

---

## 1. 迁移范围

参考目录 `E:\code3\RuoYi-Vue3\src\views\system\post`：

| 文件 | 作用 | 迁移后 |
|---|---|---|
| `index.vue` | 岗位列表 + 新增/修改弹窗 | `PageHead / FilterBar / Table / PostForm / index` |

功能清单：

- 列表：岗位编号、岗位编码、岗位名称、岗位排序、状态、创建时间；
- 查询：岗位编码、岗位名称、状态；
- 操作：新增、修改、单条/批量删除、导出；
- 分页；
- 表单：岗位名称、岗位编码、岗位顺序、岗位状态、备注。

---

## 2. 目标目录与组件结构

```
src/views/system/post/
├── index.vue        # PageHead + FilterBar + Table + PostForm
├── PageHead.vue     # 标题「岗位管理」+ 新增
├── FilterBar.vue    # 岗位编码 / 岗位名称 / 状态 / 查询重置
├── Table.vue        # 表格 + 工具栏 + 分页 + 删除确认
└── PostForm.vue     # scene = view | add | edit
```

页面入口：

```
index.vue
├── PageHead
├── FilterBar
├── Table
└── PostForm
```

---

## 3. 列表页设计

### 3.1 查询参数

现有类型 `src/types/api/system/post.ts` 已包含：

```ts
export interface PostQueryParams extends PageDomain {
  postCode?: string
  postName?: string
  status?: string
}
```

建议迁移时把 `status` 收窄为 `'0' | '1'`（与 `SysPost.status` 保持一致）。

FilterBar 字段：

| 字段 | 组件 | 说明 |
|---|---|---|
| 岗位编码 | `Input` | 回车触发查询 |
| 岗位名称 | `Input` | 回车触发查询 |
| 状态 | `Select` | 全部 / 正常 / 停用 |
| 查询 / 重置 | `Button` | loading 时禁用 + `Loader2` |

> 参考页面没有创建时间筛选，不需要日期组件。

### 3.2 工具栏

| 区域 | 内容 |
|---|---|
| 左侧 | 已选 N 项 + 批量删除 |
| 右侧 | 列设置（DropdownMenu）+ 导出 |

新增按钮放在 `PageHead`，与用户/角色/部门管理一致。

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 勾选 | — | `Checkbox`，全选/半选 |
| 岗位编号 | `postId` | 文本 |
| 岗位编码 | `postCode` | 文本 |
| 岗位名称 | `postName` | 文本（可点击打开 view 场景） |
| 岗位排序 | `postSort` | 文本 |
| 状态 | `status` | 文本/徽标：正常 / 停用（**不做 Switch**） |
| 创建时间 | `createTime` | 文本 |
| 操作 | — | 修改 / 删除 |

交互：

- 删除：单条/批量 → `AlertDialog` 二次确认 → `delPost(ids)` → 刷新；
- 导出：`download('system/post/export', queryParams, 'post_xxx.xlsx')`；
- 分页：复用 `Pagination`，`setPage / setPageSize` 走 store；
- 加载中显示 8 行 `Skeleton`（与角色 Table 一致），配合最小 loading 时间 300ms。

---

## 4. PostForm（新增 / 修改 / 查看）

### 4.1 场景

```ts
const props = defineProps<{ scene: 'view' | 'add' | 'edit' }>()
const editable = computed(() => props.scene !== 'view')
```

- `view`：同一套字段全部 `disabled`，底部只有「关闭」（可选，与用户/角色/部门一致）；
- `add / edit`：可编辑，`edit` 回显 `getPost(postId)`；
- 标题：`岗位详情 / 添加岗位 / 修改岗位`。

### 4.2 字段与组件

| 字段 | 组件 | 校验/说明 |
|---|---|---|
| 岗位名称 | `Input` | 必填 |
| 岗位编码 | `Input` | 必填 |
| 岗位顺序 | `Input type="number"` | 必填、`min=0`（暂无 InputNumber 组件） |
| 岗位状态 | `Select` | 正常 / 停用 |
| 备注 | `Textarea` | 可选 |

> 参考页面顺序是「岗位名称 → 岗位编码 → 岗位顺序 → 状态 → 备注」，迁移保持一致。

---

## 5. API / 类型迁移清单

### 5.1 需要新建

| 文件 | 内容 |
|---|---|
| `src/api/system/post.ts` | `listPost / getPost / addPost / updatePost / delPost` |

接口：

| 接口 | 方法 | 说明 |
|---|---|---|
| `/system/post/list` | GET | 岗位分页列表 |
| `/system/post/{postId}` | GET | 岗位详情 |
| `/system/post` | POST | 新增 |
| `/system/post` | PUT | 修改 |
| `/system/post/{postId}` | DELETE | 删除（支持单条/批量） |

注意返回类型应为 `TableDataInfo<SysPost>`（单层数组），不是 `TableDataInfo<SysPost[]>`。

### 5.2 已存在、直接复用

- `src/types/api/system/post.ts`：`PostQueryParams`、`SysPost`（已在 `types/api/index.ts` 中导出）；
- `src/types/api/common.ts`：`TableDataInfo`、`AjaxResult`、`PageDomain`。

---

## 6. Store 设计（`src/store/system/post.ts`）

参考 `src/store/system/role.ts`：

```ts
useSystemPostStore = defineStore('system-post', () => {
  // 列表
  queryParams: PostQueryParams
  postList, total, loading
  getList()          // 带 MIN_LOADING_MS = 300 + requestSeq
  search(filter), resetQuery()
  setPage(), setPageSize()

  // 表单
  formVisible, formScene, formLoading, formData
  openAddForm(), openEditForm(row), openViewForm(row)
  closeForm(), submitForm()

  // 删除
  deleteVisible, deleteIds, deleteLoading
  openDeleteConfirm(ids), closeDeleteConfirm(), confirmDelete()
})
```

说明：

- 没有状态切换 action（后端无接口）；
- `deleteIds` 用数组兼容批量删除；
- 列表 `getList` 必须和用户/角色一致：`requestSeq` 防旧请求覆盖，`finally` 里等待剩余时间再清 `loading`；
- 导出不放进 store，Table 里直接调 `download`。

---

## 7. Element Plus → 现有组件映射

| Element Plus | 迁移后 |
|---|---|
| `el-input` | `Input` |
| `el-input type="textarea"` | `Textarea` |
| `el-select` | `Select / SelectTrigger / SelectContent / SelectItem` |
| `el-radio-group` | `Select` |
| `el-input-number` | `Input type="number"` |
| `el-dialog` | `Dialog / DialogContent / DialogFooter` |
| `el-table` | `Table / TableHeader / TableBody / TableRow / TableHead / TableCell` |
| `pagination` | 现有 `Pagination` 组件 |
| `dict-tag` | 文本/徽标（正常 / 停用） |
| `right-toolbar` | `DropdownMenu` 列设置（同用户/角色 Table） |
| `v-loading` | `loading` + `Skeleton` |
| 删除确认 | `AlertDialog` |
| `v-hasPermi` | 当前项目暂未接入，按需处理 |

---

## 8. 分阶段实施建议

| 阶段 | 内容 |
|---|---|
| P0 | 新建 `api/system/post.ts`，`status` 类型收窄 |
| P1 | PageHead / FilterBar / Table（含最小 loading + 骨架 + 删除确认 + 导出 + 分页） |
| P2 | `PostForm`（view/add/edit + 校验） |
| P3 | 联调与验收 |

---

## 9. 风险点

1. **状态不能切换**：后端没有 `changeStatus` 接口，不要照搬用户管理的 `Switch`。
2. **`TableDataInfo` 泛型**：写 `TableDataInfo<SysPost>`，避免出现 `SysPost[][]` 类型错误。
3. **岗位编码唯一性**：由后端校验，前端只做必填。
4. **批量删除**：`el-table` 多选后一次传 `postIds` 数组，后端 `/system/post/{ids}` 支持路径拼接。
5. **最小 loading + 骨架**：`getList` 里加 300ms 下限；Table 渲染固定 8 行骨架。
6. **导出参数**：导出使用当前 `queryParams`，不需要分页参数也可以按参考实现原样传。

---

## 10. 验收清单

- [ ] 岗位列表按岗位编码/岗位名称/状态查询
- [ ] 分页、列设置、导出正常
- [ ] 新增岗位校验通过并刷新列表
- [ ] 修改岗位回显正确
- [ ] 查看岗位只读、无确定按钮（如实现 view 场景）
- [ ] 单条/批量删除有确认弹窗
- [ ] 状态只展示正常/停用
- [ ] 列表加载有骨架屏且至少持续 300ms
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
