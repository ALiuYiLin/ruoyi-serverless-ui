# 菜单管理迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\system\menu\index.vue`
> 目标：`src/views/system/menu`，对齐用户/角色/部门/岗位管理的 shadcn-vue + Pinia + Tailwind 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 1. 迁移范围与现状

参考页面：菜单树表格 + 新增/修改弹窗 + 图标选择 + 保存排序 + 展开/折叠。

当前项目已有：

- `src/types/api/system/menu.ts`：`SysMenu`、`MenuQueryParams`、`MenuSortParams`、`RoleMenuTreeselectResult`
- `src/api/system/menu.ts`：目前只有 `treeselect()`、`roleMenuTreeselect()`（角色管理用）

还需要补：

- `listMenu / getMenu / addMenu / updateMenu / updateMenuSort / delMenu`

---

## 2. 目标组件结构

```
src/views/system/menu/
├── index.vue        # PageHead + FilterBar + Table + MenuForm
├── PageHead.vue     # 标题「菜单管理」+ 新增
├── FilterBar.vue    # 菜单名称 + 状态
├── Table.vue        # 树形表格 + 保存排序 + 展开/折叠
└── MenuForm.vue     # scene = view | add | edit

src/business/components/IconPicker/
└── index.vue        # 图标选择器（可搜索 + SvgIcon 预览）
```

图标选择器放 `src/business/components`，后续其他模块也能复用。

---

## 3. 列表页设计

### 3.1 查询参数

`MenuQueryParams`：

```ts
{
  menuName?: string
  status?: '0' | '1'
}
```

FilterBar：

| 字段 | 组件 |
|---|---|
| 菜单名称 | `Input` |
| 状态 | `Select`（全部 / 正常 / 停用） |
| 查询 / 重置 | `Button` |

### 3.2 工具栏

| 按钮 | 行为 |
|---|---|
| 新增 | 打开 `MenuForm`（parentId=0） |
| 保存排序 | 对比原始 `orderNum`，只提交变更行 → `updateMenuSort({ menuIds, orderNums })` |
| 展开/折叠 | 切换整棵树展开状态 |

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 菜单名称 | `menuName` | 树形列：缩进 + 展开/折叠 chevron；左侧显示图标（`SvgIcon`） |
| 类型 | `menuType` + `isFrame` | 目录 / 菜单 / 按钮 / 外链（标签） |
| 排序 | `orderNum` | 内联 `Input type="number"`（保存排序用） |
| 权限标识 | `perms` | 文本 |
| 组件路径 | `component` | 文本 |
| 状态 | `status` | 正常 / 停用（文本/徽标） |
| 操作 | — | 修改 / 新增子菜单 / 删除 |

树形表格实现与部门管理一致：`handleTree(data, 'menuId')` 组树 → 按 `expandedIds` 拍平成行。

---

## 4. MenuForm

### 4.1 字段（按菜单类型动态显示）

| 字段 | 组件 | 显示条件 |
|---|---|---|
| 上级菜单 | 树形下拉（`TreeSelect` 风格，根节点 id=0 / label「主类目」） | 全部 |
| 菜单类型 | `Select`（目录 M / 菜单 C / 按钮 F）→ 参考用 radio | 全部 |
| 菜单图标 | `IconPicker` | M / C |
| 菜单名称 | `Input`，必填 | 全部 |
| 显示排序 | `Input type="number"`，必填 | 全部 |
| 路由名称 | `Input` | M / C |
| 是否外链 | `Select`（是 0 / 否 1） | M / C |
| 路由地址 | `Input`，必填（非按钮） | M / C |
| 组件路径 | `Input` | C |
| 权限字符 | `Input` | C / F |
| 路由参数 | `Input` | M / C |
| 是否缓存 | `Select`（缓存 0 / 不缓存 1） | C |
| 显示状态 | `Select`（显示 0 / 隐藏 1） | M / C |
| 菜单状态 | `Select`（正常 0 / 停用 1） | 全部 |

### 4.2 场景

```
scene = 'view' | 'add' | 'edit'
```

- view：全部字段 disabled，底部只有「关闭」；
- add/edit：可编辑，edit 用 `getMenu(menuId)` 回显；
- 父级数据：`listMenu()` → `handleTree(data,'menuId')`，再在根节点前追加「主类目」；
- 行内「新增」：把当前行 `menuId` 作为 `parentId`。

### 4.3 IconPicker

当前项目图标体系：

- `src/assets/icons/svg/**` + `virtual:svg-icons-register`
- 全局 `<SvgIcon icon-class="xxx" />`

实现方式：

```ts
// 通过 glob 拿到所有图标名
const modules = import.meta.glob('@/assets/icons/svg/*.svg', { eager: true })
const iconNames = Object.keys(modules).map(path => path.split('/').pop()!.replace('.svg', ''))
```

组件：

- `Popover + Input` 搜索；
- 网格展示图标（`SvgIcon`）+ 名称；
- 点击 emit `update:modelValue`；
- 清空图标按钮。

---

## 5. API / 类型

### 5.1 类型

`src/types/api/system/menu.ts` 已有 `SysMenu / MenuQueryParams / MenuSortParams`，可直接复用。

### 5.2 API 补充

在 `src/api/system/menu.ts` 增加：

| 接口 | 方法 |
|---|---|
| `/system/menu/list` | GET（返回扁平列表，前端 `handleTree`） |
| `/system/menu/{menuId}` | GET |
| `/system/menu` | POST |
| `/system/menu` | PUT |
| `/system/menu/updateSort` | PUT（menuIds/orderNums 逗号字符串） |
| `/system/menu/{menuId}` | DELETE |

---

## 6. Store（`src/store/system/menu.ts`）

```ts
useSystemMenuStore = defineStore('system-menu', () => {
  queryParams, menuTree, loading, originalOrders, expandedIds
  getList()        // listMenu → handleTree，同时记录原始排序
  search(), resetQuery(), saveSort()
  formVisible, formScene, formLoading, formData
  openAddForm(parentRow?), openEditForm(row), openViewForm(row)
  closeForm(), submitForm()
  deleteVisible, deleteIds, deleteConfirm
})
```

- 树形表格无分页；
- `getList` 加 `MIN_LOADING_MS=300` + `requestSeq`（与部门一致）；
- 保存排序只提交变更行；
- 删除用 `AlertDialog`。

---

## 7. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-tree-select` | 自实现树形下拉（可复用 DeptTreeSelect 思路）或 Business `TreeSelect` 组件 |
| `el-table tree-props` | 树拍平 Table（同部门） |
| `el-radio-group` | `Select` |
| `el-input-number` | `Input type="number"` |
| `el-tag` | 文本/徽标 span |
| `svg-icon` | 现有 `SvgIcon` |
| `IconSelect` | 新建 `IconPicker` |
| `el-dialog` | `Dialog` |
| `v-loading` | `loading` + `Skeleton` |
| 删除确认 | `AlertDialog` |

---

## 8. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 补 menu API（list/get/add/update/updateSort/del） |
| P1 | IconPicker + MenuForm 基础字段 |
| P2 | 树形 Table + 保存排序 + 展开折叠 |
| P3 | 联调（菜单树数据、图标、排序接口） |

---

## 9. 风险点

1. **表单字段最多**：M/C/F 三种类型条件显示，校验规则要按类型区分（按钮不需要 path/component）。
2. **图标选择器**：需要从 svg 目录动态生成图标列表；`import.meta.glob` 路径别名需确认可用。
3. **树形表格 + 排序**：与部门管理共用同一套拍平/展开/保存排序逻辑，可抽公共 composable。
4. **根菜单 parentId=0**：上级菜单下拉要固定有「主类目」选项。
5. **修改回显**：`getMenu` 返回的 `menuType` 决定显示哪些字段，注意切换类型时清空无关字段。
6. **删除限制**：有子菜单的节点后端通常会拒绝删除，前端保留错误提示即可。

---

## 10. 验收清单

- [ ] 菜单树按菜单名称/状态查询
- [ ] 树形展示、展开/折叠、保存排序正常
- [ ] 新增目录/菜单/按钮，字段按类型正确显示与校验
- [ ] 图标选择器可搜索、可选、可清空
- [ ] 修改回显正确
- [ ] 查看场景只读
- [ ] 删除有确认弹窗
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
