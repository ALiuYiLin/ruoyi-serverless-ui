# 角色管理迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 目标：把 `E:\code3\RuoYi-Vue3\src\views\system\role` 迁移到
> `E:\code3\ruoyi-ts\src\views\system\role`，对齐当前用户管理
> `src/views/system/user` 的 shadcn-vue + Pinia store + Tailwind 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 0. 本次方案确认点

1. **角色管理页面不使用部门树，也不加部门筛选**：
   - 角色列表 FilterBar 只保留：角色名称 / 权限字符 / 状态 / 创建时间；
   - 不需要「部门下拉」，不给 `RoleQueryParams` 加 `deptId`。
2. **数据权限弹窗保留部门树，但复用「菜单权限树」同一个组件**：
   - 抽一个通用的 `CheckboxTree.vue`（递归 Checkbox 树 + 展开/折叠 + 全选/全不选 + 父子联动）；
   - 角色表单的「菜单权限」用菜单数据渲染；
   - 数据权限弹窗用部门数据渲染同一个组件。
3. **分配用户不做页面**，改成一个 Dialog：
   - 输入框搜索用户 → 点击添加到 tag → 提交；
   - 不需要已授权列表、取消授权、独立路由。

---

## 1. 迁移范围

参考目录 `E:\code3\RuoYi-Vue3\src\views\system\role`：

| 文件 | 原作用 | 迁移后 |
|---|---|---|
| `index.vue` | 角色列表 + 新增/修改 + 数据权限 | 拆成 `PageHead / FilterBar / Table / RoleForm / DataScopeDialog` |
| `authUser.vue` | 已授权用户页面 | **不迁移页面**，改为 `AuthUserDialog.vue` |
| `selectUser.vue` | 选择用户弹窗 | 合并进 `AuthUserDialog.vue` |

保留能力：

- 角色列表查询、分页、新增、修改、查看、删除、状态切换、导出；
- 菜单权限分配（角色表单内）；
- 数据权限（权限范围 + 自定义时的部门树）；
- 分配用户（搜索 + tag + 提交）。

---

## 2. 目标目录与组件结构

```
src/views/system/role/
├── index.vue              # PageHead + FilterBar + Table + RoleForm + DataScopeDialog + AuthUserDialog
├── PageHead.vue           # 标题「角色管理」+ 新增
├── FilterBar.vue          # 角色名称/权限字符、状态、创建时间
├── Table.vue              # 角色表格 + 工具栏 + 分页 + 删除确认 + 列设置
├── RoleForm.vue           # scene = view | add | edit
├── CheckboxTree.vue       # 通用树（菜单权限 + 数据权限部门树共用）
├── DataScopeDialog.vue    # 数据权限弹窗
└── AuthUserDialog.vue     # 分配用户弹窗
```

`CheckboxTree.vue` 是通用组件，若后续菜单管理也需要，可提升到
`src/components/CheckboxTree/`（与 `Flex` 目录同级）。

页面入口：

```
index.vue
├── PageHead
├── FilterBar
├── Table
├── RoleForm
├── DataScopeDialog
└── AuthUserDialog
```

---

## 3. 列表页设计

### 3.1 查询参数

使用现有 `src/types/api/system/role.ts` 的 `RoleQueryParams`，**不增加 deptId**：

```ts
{
  pageNum: number
  pageSize: number
  roleName?: string
  roleKey?: string
  status?: '0' | '1'
  params?: { beginTime?: string; endTime?: string }
}
```

### 3.2 FilterBar 字段

| 字段 | 组件 | 说明 |
|---|---|---|
| 角色名称 | `Input` | 也可与「权限字符」做成「下拉字段 + 关键字」组合（参考用户管理 FilterBar） |
| 权限字符 | `Input` | 同上 |
| 状态 | `Select` | 全部 / 正常 / 停用 |
| 创建时间 | 两个 `Input type="date"` | 当前没有 RangePicker，沿用用户管理做法 |
| 查询 / 重置 | `Button` | loading 时禁用 + `Loader2` 旋转 |

> 角色管理页面**没有部门筛选**，前端不加载部门树数据。

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 勾选 | — | `Checkbox`，全选/半选 |
| 角色编号 | `roleId` | 文本 |
| 角色名称 | `roleName` | 文本（可点击打开 view 场景） |
| 权限字符 | `roleKey` | 文本 |
| 显示顺序 | `roleSort` | 文本 |
| 状态 | `status` | `Switch`（0 正常 / 1 停用） |
| 创建时间 | `createTime` | 文本 |
| 操作 | — | 修改 / 删除 / 数据权限 / 分配用户 |

交互：

- `roleId === 1`（超级管理员角色）：不显示修改/删除/数据权限/分配用户；
- 状态切换调 `changeRoleStatus`，失败回滚（参考用户管理 Table 的 `handleStatusChange`）；
- 删除：单条/批量 `AlertDialog` 确认 → `delRole(ids)`；
- 工具栏左侧「已选 N 项 / 批量删除」，右侧「列设置（DropdownMenu）+ 导出」；
- 分页复用 `Pagination`，可沿用用户管理 Table 的骨架屏/动态条数逻辑。

实现直接参考：

- `src/views/system/user/Table.vue`（表格、状态、操作列、列设置、删除确认）
- `src/views/system/user/FilterBar.vue`（查询布局、按钮 loading）
- `src/views/system/user/PageHead.vue`

---

## 4. RoleForm（新增 / 修改 / 查看）

### 4.1 场景

```ts
const props = defineProps<{ scene: 'view' | 'add' | 'edit' }>()
const editable = computed(() => props.scene !== 'view')
```

- `view`：同一套字段全部 `disabled`，底部仅「关闭」；
- `add / edit`：可编辑，`edit` 回显 `getRole(roleId)` 数据；
- 与用户管理 Form 保持一致。

### 4.2 字段与组件

| 字段 | 组件 | 校验/说明 |
|---|---|---|
| 角色名称 | `Input` | 必填 |
| 权限字符 | `Input` | 必填；label 旁提示 `@PreAuthorize(@ss.hasRole('admin'))` |
| 角色顺序 | `Input type="number"` | 必填、`min=0`（暂无 InputNumber 组件） |
| 状态 | `Select` | 正常 / 停用 |
| 菜单权限 | `CheckboxTree` | 菜单数据，见第 5 节 |
| 备注 | `Textarea` | 可选 |

---

## 5. CheckboxTree（菜单权限 + 数据权限共用）

参考页面两处 `el-tree show-checkbox`（菜单权限、数据权限部门树）都用同一套交互，抽成一个通用组件：

```
CheckboxTree
├── 工具行
│   ├── Checkbox「展开 / 折叠」
│   ├── Checkbox「全选 / 全不选」
│   └── Checkbox「父子联动」
└── 树节点（递归）
    ├── ChevronRight / ChevronDown（展开图标）
    ├── Checkbox（选中 / 半选）
    └── 节点 label
```

### 5.1 Props / API

```ts
interface Props {
  data: TreeSelect[]
  modelValue: number[]        // 选中节点 ID
  /** 父子联动：true = 联动（对应 el-tree 的 :check-strictly="false"） */
  parentChildLinked?: boolean
  defaultExpandAll?: boolean
}

defineExpose({
  getCheckedKeys(): { checked: number[]; halfChecked: number[] }
})
```

### 5.2 两处用法

**角色表单 · 菜单权限**

```vue
<CheckboxTree
  :data="menuOptions"
  :model-value="form.menuIds ?? []"
  :parent-child-linked="form.menuCheckStrictly"
  @update:model-value="value => (form.menuIds = value)"
/>
```

- 数据：`treeselect()`（新增）或 `roleMenuTreeselect(roleId).menus`（修改）；
- 回显：`roleMenuTreeselect(roleId).checkedKeys`（叶子节点，父节点交给联动逻辑）；
- 提交：`menuIds = checked + halfChecked`。

**数据权限弹窗 · 部门树**

```vue
<CheckboxTree
  :data="deptOptions"
  :model-value="deptIds"
  :parent-child-linked="form.deptCheckStrictly"
  default-expand-all
  @update:model-value="value => (deptIds = value)"
/>
```

- 数据：`deptTreeSelect(roleId).depts`；
- 回显：`deptTreeSelect(roleId).checkedKeys`；
- 提交：`deptIds = checked + halfChecked`；
- 仅当 `dataScope === '2'`（自定义）时显示。

> 注意父子联动的语义：`form.menuCheckStrictly = true` / `form.deptCheckStrictly = true`
> 表示**联动**，传给组件时是 `parentChildLinked = true`，不要和 `check-strictly` 搞反。

---

## 6. 数据权限弹窗（DataScopeDialog）

### 6.1 字段

| 字段 | 组件 | 说明 |
|---|---|---|
| 角色名称 | `Input` | `disabled` |
| 权限字符 | `Input` | `disabled` |
| 权限范围 | `Select` | 1 全部 / 2 自定义 / 3 本部门 / 4 本部门及以下 / 5 仅本人 |
| 数据权限（仅 dataScope=2） | `CheckboxTree` | 部门树，复用第 5 节组件 |

### 6.2 行为

- 打开：`getRole(roleId)` 回显 `roleName / roleKey / dataScope`；
- 若 `dataScope = 2`：`deptTreeSelect(roleId)` 加载部门树 + `checkedKeys`；
- 切换权限范围：从「自定义」切到其他值时清空部门树勾选；
- 提交：`dataScope({ roleId, dataScope, deptIds: checked + halfChecked })`；
- 成功关闭并刷新列表。

---

## 7. 分配用户（AuthUserDialog，不做独立页面）

### 7.1 交互设计

```
Dialog「分配用户」
├── 搜索区
│   ├── Input（搜索关键字：用户名称 / 手机号）
│   └── Button「搜索」
├── 搜索结果列表
│   ├── 用户名称 / 昵称 / 手机号
│   └── 「添加」按钮（点击加入已选）
├── 已选用户 Tags（每个 tag 带 × 可移除）
└── Footer：取消 / 提交
```

- 搜索：`unallocatedUserList({ roleId, userName, phonenumber, pageNum, pageSize })`；
  - 搜索框可以做成「字段下拉 + 关键字」组合（用户名称 / 手机号码），也可以默认按 userName；
- 结果列表展示未授权用户，点击「添加」把用户放进 `selectedUsers`；
- 已选用 tag 展示（建议安装 shadcn `badge`，或先用带 × 的 span chip）；
- 提交：`authUserSelectAll({ roleId, userIds: selectedIds.join(',') })`；
- 成功后关闭弹窗并提示，不刷新角色列表；
- 不实现：已授权列表、取消授权、批量取消、`/system/role-auth` 路由。

### 7.2 需要的接口

| 接口 | 用途 |
|---|---|
| `unallocatedUserList` | 搜索未授权用户 |
| `authUserSelectAll` | 提交选中的用户授权 |

不再需要：`allocatedUserList`、`authUserCancel`、`authUserCancelAll`、隐藏路由 `role-auth`。

---

## 8. API / 类型迁移清单

### 8.1 需要新建

| 文件 | 内容 |
|---|---|
| `src/api/system/role.ts` | `listRole / getRole / addRole / updateRole / dataScope / changeRoleStatus / delRole / deptTreeSelect / unallocatedUserList / authUserSelectAll` |
| `src/api/system/menu.ts` | `treeselect()`、`roleMenuTreeselect(roleId)` |
| `src/types/api/system/menu.ts` | `SysMenu`、`MenuQueryParams`、`RoleMenuTreeselectResult` |

### 8.2 已存在可复用

- `src/types/api/system/role.ts`：`RoleQueryParams`、`SysRole`、`SysUserRole`、`AuthUserSelectParams`、`RoleDeptTreeResult`
- `src/types/api/system/user.ts`：`SysUser`、`AuthUserQueryParams`
- `src/types/api/common.ts`：`TreeSelect`、`TableDataInfo`、`AjaxResult`

### 8.3 类型修正

```ts
// 当前是 number[]，后端实际接收逗号字符串
export interface AuthUserSelectParams {
  roleId: number
  userIds: string
}
```

`RoleQueryParams` **不需要** `deptId`（角色管理没有部门筛选）。

---

## 9. Store 设计（`src/store/system/role.ts`）

```ts
useSystemRoleStore = defineStore('system-role', () => {
  // 列表
  queryParams, roleList, total, loading
  getList(), search(filter), resetQuery(), setPage(), setPageSize()

  // 表单
  formVisible, formScene, formLoading, formData
  menuOptions
  openAddForm(), openEditForm(row), openViewForm(row), closeForm(), submitForm()

  // 删除
  deleteVisible, deleteIds, deleteLoading
  openDeleteConfirm(ids), closeDeleteConfirm(), confirmDelete()

  // 状态
  changeStatus(roleId, status)

  // 数据权限
  dataScopeVisible, dataScopeLoading, dataScopeData
  deptOptions
  openDataScope(row), closeDataScope(), submitDataScope()
})
```

分配用户弹窗状态（搜索关键字、搜索结果、已选用户）放在 `AuthUserDialog.vue` 内部即可。

---

## 10. Element Plus → 现有组件映射

| Element Plus | 迁移后 |
|---|---|
| `el-input` | `Input` |
| `el-input type="textarea"` | `Textarea` |
| `el-select` | `Select / SelectTrigger / SelectContent / SelectItem` |
| `el-radio-group` | `Select` |
| `el-switch` | `Switch` |
| `el-checkbox` | `Checkbox` |
| `el-date-picker type="daterange"` | 两个 `Input type="date"` |
| `el-input-number` | `Input type="number"` |
| `el-tree show-checkbox` | 新建 `CheckboxTree.vue`（菜单权限 + 数据权限共用） |
| `el-dialog` | `Dialog / DialogContent / DialogFooter` |
| `el-table` | `Table / TableHeader / TableBody / TableRow / TableHead / TableCell` |
| `pagination` | 现有 `Pagination` 组件 |
| `right-toolbar` | `DropdownMenu` 列设置（同用户 Table） |
| `el-tooltip` | `Tooltip` 或原生 `title` |
| `dict-tag` | 文本/状态徽标 |
| `v-loading` | `loading` + `Skeleton` |
| `el-tag`（已选用户） | shadcn `Badge`（需安装）或自定义 chip |

---

## 11. 分阶段实施建议

| 阶段 | 内容 |
|---|---|
| P0 | `api/system/role.ts`、`api/system/menu.ts`、`types/api/system/menu.ts`，修正 `AuthUserSelectParams` |
| P1 | 列表页：PageHead / FilterBar / Table（状态、删除、列设置、导出） |
| P2 | `CheckboxTree.vue` + `RoleForm.vue`（view/add/edit，菜单权限） |
| P3 | `DataScopeDialog.vue`（权限范围 + 部门树，复用 CheckboxTree） |
| P4 | `AuthUserDialog.vue`（搜索、tag、提交） |
| P5 | 联调与验收 |

---

## 12. 风险点

1. **CheckboxTree 半选/联动逻辑**：菜单权限与数据权限共用，需处理选中、半选、父子联动、回显、提交 `checked + halfChecked`。
2. **`menuCheckStrictly / deptCheckStrictly` 语义**：`true = 父子联动`，传给组件时注意转换。
3. **超级管理员角色 `roleId === 1` 保护**：隐藏修改/删除/数据权限/分配用户。
4. **`AuthUserSelectParams.userIds` 类型**：后端要逗号字符串，不是数组。
5. **分配用户只需要搜索 + 添加**：`unallocatedUserList` 数据可能较多，结果列表建议分页或限制条数。
6. **数据权限自定义范围**：`deptIds` 提交需要包含半选部门节点。
7. **权限指令**：`v-hasPermi` 在用户管理页暂未使用，角色管理如需按钮权限要确认接回方式。

---

## 13. 验收清单

- [ ] 角色列表支持角色名称/权限字符/状态/创建时间筛选
- [ ] 分页、列设置、批量删除、导出正常
- [ ] 状态切换成功，失败回滚
- [ ] 新增角色：字段校验、菜单权限保存正确
- [ ] 修改角色：菜单权限正确回显
- [ ] 查看角色：全部只读，无确定按钮
- [ ] 数据权限：权限范围切换、自定义时部门树回显/提交正确
- [ ] 分配用户：搜索 → 加入 tag → 移除 tag → 提交成功
- [ ] `roleId === 1` 无修改/删除/数据权限/分配用户入口
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
