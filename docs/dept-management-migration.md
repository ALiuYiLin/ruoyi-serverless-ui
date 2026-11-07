# 部门管理迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 目标：把 `E:\code3\RuoYi-Vue3\src\views\system\dept`（目录部门树表格 + 部门表单）
> 迁移到 `E:\code3\ruoyi-ts\src\views\system\dept`，实现方式对齐当前
> `src/views/system/user`、`src/views/system/role` 的 shadcn-vue + Pinia store + Tailwind 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 0. 方案确认点

1. **部门列表是树形表格，没有分页**：整体替换为「扁平化树行 + 展开/折叠」，不使用 Pagination。
2. **排序列可直接编辑**：每行「排序」用 `Input type="number"` 内联编辑，工具栏「保存排序」批量调用 `updateDeptSort`。
3. **状态列只展示、不切换**：后端没有 `changeStatus` 接口，参考页面也是 `dict-tag` 展示；统一用文本/徽标展示「正常 / 停用」。
4. **表单沿用当前表单模式**：`DeptForm` 支持 `scene = 'view' | 'add' | 'edit'`，view 全只读。
5. **上级部门选择**：复用/抽取现有的 `DeptTreeSelect` 组件（用户管理里已经有一个），只是数据源换成部门树。

---

## 1. 迁移范围

参考目录 `E:\code3\RuoYi-Vue3\src\views\system\dept`：

| 文件 | 作用 | 迁移后 |
|---|---|---|
| `index.vue` | 部门树表格 + 新增/修改弹窗 + 保存排序 | 拆成 `PageHead / FilterBar / Table / DeptForm` |

与角色管理相比，部门管理的特点：

- 没有分页（树形数据一次返回）；
- 没有独立详情页/分配页面；
- 工具栏有「保存排序」和「展开/折叠」；
- 表单只有「上级部门 + 部门名称 + 排序 + 负责人 + 电话 + 邮箱 + 状态」。

---

## 2. 目标目录与组件结构

```
src/views/system/dept/
├── index.vue        # PageHead + FilterBar + Table + DeptForm
├── PageHead.vue     # 标题「部门管理」+ 新增
├── FilterBar.vue    # 部门名称 + 状态 + 查询/重置
├── Table.vue        # 树形表格 + 工具栏（保存排序/展开折叠）+ 删除确认
└── DeptForm.vue     # scene = view | add | edit
```

页面入口：

```
index.vue
├── PageHead
├── FilterBar
├── Table
└── DeptForm
```

### 共用组件建议

当前 `src/views/system/user/DeptTreeSelect.vue` 是页面级组件（单部门树下拉，props 为 `TreeSelect[]`）。
部门管理的「上级部门」也需要同样的交互，建议二选一：

- 方案 A（推荐）：把它提升到 `src/business/components/DeptTreeSelect/`，user / dept 共用；
- 方案 B：部门页复制一份，后续再统一。

提升时同步修改用户管理 `FilterBar.vue`、`Form.vue` 的 import 路径即可。

---

## 3. 列表页设计

### 3.1 查询参数

现有类型 `src/types/api/system/dept.ts`（当前只有 `SysDept`，需要补两个类型）：

```ts
/** 部门查询参数 */
export interface DeptQueryParams {
  deptName?: string
  status?: '0' | '1'
}

/** 保存部门排序参数 */
export interface DeptSortParams {
  deptIds: string   // 逗号分隔
  orderNums: string // 逗号分隔
}
```

FilterBar 字段（参考页面只有两个筛选条件，无创建时间）：

| 字段 | 组件 | 说明 |
|---|---|---|
| 部门名称 | `Input` | 回车触发查询 |
| 状态 | `Select` | 全部 / 正常 / 停用 |
| 查询 / 重置 | `Button` | loading 时禁用 + `Loader2` |

> 部门列表**没有分页参数**，`DeptQueryParams` 不需要 pageNum/pageSize。

### 3.2 工具栏

参考页面的工具栏：

| 按钮 | 行为 |
|---|---|
| 新增 | 打开 `DeptForm`（scene=`add`，parentId 为空） |
| 保存排序 | 对比原始排序，有变化时调用 `updateDeptSort`；无变化提示「未检测到排序修改」 |
| 展开/折叠 | 切换所有节点的展开状态 |

当前页面可以继续用「已选 N 项」吗？**不需要**：部门树没有多选和批量删除，
工具栏只保留「保存排序」「展开/折叠」，右侧可以放「列设置」（可选）。

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 部门名称 | `deptName` | **树形列**：层级缩进 + 展开/折叠 chevron |
| 排序 | `orderNum` | 内联 `Input type="number"`（宽度约 88px，`min=0`） |
| 状态 | `status` | 文本/徽标：正常 / 停用（不做 Switch） |
| 创建时间 | `createTime` | 文本 |
| 操作 | — | 修改 / 新增子部门 / 删除 |

操作细节（对齐参考页面）：

- 「新增」按钮点击时把当前行 `deptId` 作为 `parentId` 传入表单；
- `parentId === 0` 的根部门：**不显示删除**（参考页面 `v-if="scope.row.parentId != 0"`）；
- 删除使用 `AlertDialog` 二次确认（与用户/角色管理一致）；
- 部门名称点击可打开 `view` 场景（可选，保持一致体验）。

### 3.4 树形表格实现（无现成组件）

shadcn 的 `Table` 不支持 `el-table` 的 `row-key/tree-props`，需要自己把树拍平：

```ts
interface DeptRow {
  dept: SysDept
  level: number
  hasChildren: boolean
  expanded: boolean
}

// 根据展开状态拍平
const visibleRows = computed(() => {
  const rows: DeptRow[] = []
  const walk = (nodes: SysDept[], level: number) => {
    for (const node of nodes) {
      const hasChildren = !!node.children?.length
      const expanded = expandedIds.value.has(node.deptId!)
      rows.push({ dept: node, level, hasChildren, expanded })
      if (hasChildren && expanded) {
        walk(node.children!, level + 1)
      }
    }
  }
  walk(deptTree.value, 0)
  return rows
})
```

渲染：

- 部门名称单元格：

  ```vue
  <span :style="{ paddingLeft: `${level * 16}px` }" class="inline-flex items-center gap-1">
    <button v-if="hasChildren" @click="toggleExpand(deptId)">
      <ChevronDown v-if="expanded" />
      <ChevronRight v-else />
    </button>
    <span>{{ dept.deptName }}</span>
  </span>
  ```

- 默认全部展开（`expandedIds` 初始化为所有有子节点的 deptId）；
- 工具栏「展开/折叠」切换：展开时加入全部父节点，折叠时清空；
- 加载时用 `Skeleton` 行占位（3~6 行即可，无分页）；
- 空数据时一行「暂无数据」。

### 3.5 保存排序

参考页面会记录每行原始排序，只提交有变化的行：

```ts
const originalOrders = reactive<Record<number, number>>({})

function recordOriginalOrders(nodes: SysDept[]) {
  for (const node of nodes) {
    originalOrders[node.deptId!] = node.orderNum ?? 0
    if (node.children?.length) recordOriginalOrders(node.children)
  }
}

async function saveSort() {
  const deptIds: number[] = []
  const orderNums: number[] = []
  const walk = (nodes: SysDept[]) => {
    for (const node of nodes) {
      if (String(originalOrders[node.deptId!]) !== String(node.orderNum)) {
        deptIds.push(node.deptId!)
        orderNums.push(node.orderNum ?? 0)
      }
      if (node.children?.length) walk(node.children)
    }
  }
  walk(deptTree.value)
  if (!deptIds.length) {
    ElMessage.warning('未检测到排序修改')
    return
  }
  await updateDeptSort({ deptIds: deptIds.join(','), orderNums: orderNums.join(',') })
  ElMessage.success('排序保存成功')
  recordOriginalOrders(deptTree.value)
}
```

---

## 4. DeptForm（新增 / 修改 / 查看）

### 4.1 场景

```ts
const props = defineProps<{ scene: 'view' | 'add' | 'edit' }>()
const editable = computed(() => props.scene !== 'view')
```

- `view`：同一套字段全部 `disabled`，底部只有「关闭」；
- `add`：上级部门可选父部门；
- `edit`：上级部门可修改；
- 标题：`部门详情 / 添加部门 / 修改部门`。

### 4.2 字段与组件

| 字段 | 组件 | 校验/说明 |
|---|---|---|
| 上级部门 | `DeptTreeSelect`（复用） | 必填；`parentId === 0` 时隐藏（根部门） |
| 部门名称 | `Input` | 必填 |
| 显示排序 | `Input type="number"` | 必填、`min=0`（暂无 InputNumber 组件） |
| 负责人 | `Input` | 可选、maxlength=20 |
| 联系电话 | `Input` | 可选；校验 `/^1[3-9]\d{9}$/` |
| 邮箱 | `Input` | 可选；邮箱格式校验 |
| 部门状态 | `Select` | 正常 / 停用 |

### 4.3 上级部门数据源

- **新增**：`listDept()` 拿全量扁平部门 → `handleTree(data, 'deptId')` 组树 → 转成 `TreeSelect[]` 结构：
  ```ts
  function toTreeSelect(nodes: SysDept[]): TreeSelect[] {
    return nodes.map(node => ({
      id: node.deptId!,
      label: node.deptName ?? '',
      disabled: false,
      children: toTreeSelect(node.children ?? []),
    }))
  }
  ```
- **修改**：`listDeptExcludeChild(deptId)` 拿到「排除自己及子部门」的扁平数据 → 组树，避免把上级部门选成自己的子部门；
- **查看**：同样用 `getDept(deptId)` + `listDeptExcludeChild` 回显父部门名称。

`handleTree` 项目里已有：`src/utils/ruoyi.ts` → `handleTree(data, 'deptId')`。

### 4.4 新增子部门

参考页面 `handleAdd(row?)`：

- 无参数（顶部「新增」）：`parentId` 为空，由用户选择上级部门；
- 行内「新增」：`parentId = row.deptId`，表单打开后自动选中该父部门。

### 4.5 根部门保护

- `parentId === 0`：表单里隐藏「上级部门」字段；
- `parentId === 0` 的根部门：表格不显示「删除」按钮（参考页面同样处理）；
- 其他部门删除前需后端校验「是否存在子部门」（后端自带）。

---

## 5. API / 类型迁移清单

### 5.1 需要新建

| 文件 | 内容 |
|---|---|
| `src/api/system/dept.ts` | `listDept / listDeptExcludeChild / getDept / addDept / updateDept / updateDeptSort / delDept` |

### 5.2 需要补充

`src/types/api/system/dept.ts` 目前只有 `SysDept`，需要补充：

```ts
export interface DeptQueryParams {
  deptName?: string
  status?: '0' | '1'
}

export interface DeptSortParams {
  deptIds: string
  orderNums: string
}
```

### 5.3 接口清单

| 接口 | 方法 | 说明 |
|---|---|---|
| `/system/dept/list` | GET | 查询部门列表（扁平数据） |
| `/system/dept/list/exclude/{deptId}` | GET | 查询部门列表（排除自己及子部门），修改时用 |
| `/system/dept/{deptId}` | GET | 部门详情 |
| `/system/dept` | POST | 新增部门 |
| `/system/dept` | PUT | 修改部门 |
| `/system/dept/updateSort` | PUT | 保存排序（deptIds/orderNums 逗号字符串） |
| `/system/dept/{deptId}` | DELETE | 删除部门 |

---

## 6. Store 设计（`src/store/system/dept.ts`）

```ts
useSystemDeptStore = defineStore('system-dept', () => {
  // 列表
  queryParams: DeptQueryParams
  deptTree: SysDept[]          // handleTree 后的树
  loading, expandedIds
  originalOrders: Record<number, number>
  getList(), search(filter), resetQuery()
  toggleExpandAll(), toggleExpand(deptId)
  saveSort()

  // 表单
  formVisible, formScene, formLoading, formData
  deptOptions: TreeSelect[]    // 上级部门
  openAddForm(parentRow?), openEditForm(row), openViewForm(row)
  closeForm(), submitForm()

  // 删除
  deleteVisible, deleteIds, deleteLoading
  openDeleteConfirm(ids), closeDeleteConfirm(), confirmDelete()
})
```

说明：

- 列表数据统一存 `deptTree`（树），表格用 `visibleRows` 拍平展示；
- `expandedIds` 放在 store 或 Table 内均可，推荐 Table 内部维护，切换页面不保留也无所谓；
- 部门没有分页和状态切换，store 比用户/角色简单不少。

---

## 7. Element Plus → 现有组件映射

| Element Plus | 迁移后 |
|---|---|
| `el-form` 查询 | 与用户/角色 FilterBar 一致的 `Form + FormField` |
| `el-input` | `Input` |
| `el-select` | `Select / SelectTrigger / SelectContent / SelectItem` |
| `el-radio-group` | `Select` |
| `el-input-number` | `Input type="number"` |
| `el-tree-select` | 复用/抽取 `DeptTreeSelect.vue` |
| `el-table`（`row-key` + `tree-props`） | 自实现「树拍平 + 展开/折叠」的 Table |
| `el-dialog` | `Dialog / DialogContent / DialogFooter` |
| `dict-tag` | 文本/徽标（正常 / 停用） |
| `v-loading` | `loading` + `Skeleton` |
| 删除确认 | `AlertDialog` |
| `right-toolbar` | 可选：`DropdownMenu` 列设置 |
| `v-hasPermi` | 当前项目暂未接入，按需处理 |

---

## 8. 分阶段实施建议

| 阶段 | 内容 |
|---|---|
| P0 | 新建 `api/system/dept.ts`，补齐 `DeptQueryParams / DeptSortParams` |
| P1 | 页面骨架：PageHead / FilterBar / Table（树拍平 + 展开折叠 + 排序编辑 + 保存排序 + 删除） |
| P2 | `DeptForm`（view/add/edit、上级部门树、排除子部门） |
| P3 | 抽取/复用 `DeptTreeSelect`，更新用户管理引用 |
| P4 | 联调与验收 |

---

## 9. 风险点

1. **树形表格需要自实现**：展开/折叠状态、层级缩进、行内排序输入，没有现成 shadcn 组件。
2. **保存排序的「变更检测」**：需要记录原始 `orderNum`，只提交有变化的行；`deptIds/orderNums` 是逗号字符串。
3. **上级部门排除自己及子部门**：修改时必须用 `listDeptExcludeChild`，不能用全量部门树。
4. **根部门保护**：`parentId === 0` 不显示删除、表单不显示上级部门。
5. **无分页、无状态切换**：不要照搬用户/角色管理的分页和 Switch 逻辑。
6. **`handleTree` 的 parentId 默认值**：确认 `handleTree(data, 'deptId')` 能按 `parentId` 正确组树（根节点 parentId = 0）。
7. **`DeptTreeSelect` 抽取**：如果提升到 `src/components`，要同步修改用户管理 FilterBar / Form 的 import。
8. **权限指令**：如需要按钮级权限，需确认 `v-hasPermi` 是否接入。

---

## 10. 验收清单

- [ ] 部门列表按部门名称/状态查询
- [ ] 树形展示、展开/折叠、层级缩进正确
- [ ] 排序列可编辑，保存排序只提交变更行
- [ ] 新增（顶部/行内新增子部门）成功
- [ ] 修改回显上级部门，且不能选到自己的子部门
- [ ] 查看场景全部只读、无确定按钮
- [ ] 删除普通部门有确认弹窗，根部门无删除入口
- [ ] 状态展示正常/停用
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
