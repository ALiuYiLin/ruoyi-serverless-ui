# 通知公告迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\system\notice`（`index.vue`、`ReadUsers.vue`）
> 目标：`src/views/system/notice`，对齐现有系统管理模块的 shadcn-vue + Pinia + Tailwind 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 1. 迁移范围与现状

参考页面：

- 通知公告分页列表 + 新增/修改弹窗；
- 公告内容使用富文本编辑器（参考 `src/components/Editor`）；
- 「阅读用户」弹窗（`ReadUsers.vue`），查看公告已读用户。

当前项目已有：

- `src/types/api/system/notice.ts`：`NoticeQueryParams`、`SysNotice`、`NoticeReadUserQueryParams`、`NoticeReadUser`、`SysNoticeTopResult`
- `src/api/system/notice.ts`：`listNotice / getNotice / addNotice / updateNotice / delNotice / listNoticeTop / markNoticeRead / markNoticeReadAll / listNoticeReadUsers`

需要确认/修正：

- `listNotice`、`listNoticeReadUsers` 的 `TableDataInfo` 泛型应为单层（`SysNotice` / `NoticeReadUser`）；
- 需要新增 `src/store/system/notice.ts`、`src/views/system/notice/`；
- 需要新富文本编辑器组件（见第 5 节）。

---

## 2. 目标组件结构

```
src/views/system/notice/
├── index.vue             # PageHead + FilterBar + Table + NoticeForm + ReadUsersDialog
├── PageHead.vue          # 标题「通知公告」+ 新增
├── FilterBar.vue         # 公告标题 / 操作人员 / 类型
├── Table.vue             # 表格 + 工具栏 + 分页
├── NoticeForm.vue        # scene = view | add | edit
├── ReadUsersDialog.vue   # 阅读用户弹窗
└── NoticeContent.vue     # 公告内容渲染（可选，详情预览用）

src/business/components/RichTextEditor/
└── index.vue             # 富文本编辑器（Quill）
```

---

## 3. 列表页设计

### 3.1 查询参数（`NoticeQueryParams`）

```ts
{
  pageNum, pageSize,
  noticeTitle?: string,
  createBy?: string,
  noticeType?: '1' | '2'
}
```

FilterBar：

| 字段 | 组件 |
|---|---|
| 公告标题 | `Input` |
| 操作人员 | `Input` |
| 类型 | `Select`（全部 / 通知 1 / 公告 2） |
| 查询 / 重置 | `Button` |

### 3.2 工具栏

| 按钮 | 行为 |
|---|---|
| 新增 | 打开 NoticeForm（add） |
| 修改 | 选中单行可用 |
| 删除 | 单条/批量 → AlertDialog → `delNotice(ids)` |

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 勾选 | — | Checkbox |
| 序号 | `noticeId` | 文本 |
| 公告标题 | `noticeTitle` | 可点击打开 view |
| 公告类型 | `noticeType` | 通知 / 公告 标签 |
| 状态 | `status` | 正常 / 停用 |
| 创建者 | `createBy` | 文本 |
| 创建时间 | `createTime` | 文本 |
| 操作 | — | 阅读用户 / 修改 / 删除 |

列表加载：8 行 Skeleton + `MIN_LOADING_MS=300`。

---

## 4. NoticeForm

### 4.1 场景

```
scene = 'view' | 'add' | 'edit'
```

- view：全部 disabled，公告内容只读渲染；
- add/edit：标题、类型、状态、内容可编辑；
- edit 用 `getNotice(noticeId)` 回显。

### 4.2 字段

| 字段 | 组件 | 校验/说明 |
|---|---|---|
| 公告标题 | `Input` | 必填、maxlength=50 |
| 公告类型 | `Select` | 通知 1 / 公告 2，必填 |
| 状态 | `Select` | 正常 0 / 停用 1 |
| 内容 | `RichTextEditor` | 富文本，view 场景只读渲染 HTML |

---

## 5. 富文本编辑器

项目 `package.json` 已有 `quill: 2.0.2`，但还没有封装组件。

### 5.1 方案

新建 `src/business/components/RichTextEditor/index.vue`：

- 基于 Quill（或 `@vueup/vue-quill`，如未安装可只依赖 quill 2）；
- props：
  ```ts
  {
    modelValue?: string
    placeholder?: string
    readOnly?: boolean
    minHeight?: number
  }
  ```
- emits：`update:modelValue`；
- 工具栏建议：标题、加粗、斜体、下划线、列表、引用、链接、图片、清除格式；
- 容器高度 `min-height: 192px`（参考页面 `:min-height="192"`）；
- view 场景用 `readOnly`；
- 注意 XSS：内容由后端保存，展示时用 `v-html` 需确认后端已过滤；或后续接 sanitize 库。

### 5.2 备选

如果暂时不想引入富文本：

- 先用 `Textarea` 存纯文本，后续替换 `RichTextEditor`；
- 但公告内容通常要求富文本，建议直接实现。

---

## 6. 阅读用户弹窗（ReadUsersDialog）

### 6.1 数据

- `listNoticeReadUsers({ pageNum, pageSize, noticeId, searchValue })`
- 打开时传入当前公告 `noticeId`。

### 6.2 结构

```
Dialog「阅读用户」
├── 搜索框（登录名/用户名 searchValue）+ 查询/重置
├── 表格：用户名称 / 用户昵称 / 部门 / 手机号码 / 阅读时间
└── 分页
```

### 6.3 列

| 列 | 字段 |
|---|---|
| 用户名称 | `userName` |
| 用户昵称 | `nickName` |
| 部门 | `deptName` |
| 手机号码 | `phonenumber` |
| 阅读时间 | `readTime` |

---

## 7. Store（`src/store/system/notice.ts`）

```ts
useSystemNoticeStore = defineStore('system-notice', () => {
  queryParams, noticeList, total, loading
  getList()          // MIN_LOADING_MS=300 + requestSeq
  search(), resetQuery(), setPage(), setPageSize()

  formVisible, formScene, formLoading, formData
  openAddForm(), openEditForm(row), openViewForm(row)
  closeForm(), submitForm()

  deleteVisible, deleteIds, deleteLoading
  openDeleteConfirm(ids), closeDeleteConfirm(), confirmDelete()

  readUsersVisible, readUsersLoading, readUsers, readUsersTotal
  openReadUsers(row), closeReadUsers(), searchReadUsers()
})
```

阅读用户弹窗状态也可放在 `ReadUsersDialog` 内部，避免 store 过大。

---

## 8. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-input` | `Input` |
| `el-select` | `Select` |
| `el-table` | `Table` 系列 |
| `pagination` | `Pagination` |
| `el-dialog` | `Dialog` |
| `el-tag` | 文本/徽标 |
| `right-toolbar` | 列设置 `DropdownMenu` |
| `v-loading` | `loading` + `Skeleton` |
| `Editor` | 新建 `RichTextEditor`（Quill） |
| 删除确认 | `AlertDialog` |

---

## 9. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 检查/修正 `api/system/notice.ts` 泛型；准备 `RichTextEditor` |
| P1 | 列表页（查询/分页/删除） |
| P2 | NoticeForm（标题/类型/状态/富文本） |
| P3 | ReadUsersDialog |
| P4 | 联调（公告内容渲染、已读用户） |

---

## 10. 风险点

1. **富文本编辑器是主要工作量**：需要封装、只读渲染、内容同步、样式适配暗色主题。
2. **XSS**：`v-html` 渲染公告内容要确认后端过滤或前端 sanitize。
3. **阅读用户接口**：`/system/notice/readUsers/list` 依赖后端扩展，需联调确认。
4. **公告类型/状态映射**：类型 1/2，状态 0/1，不要混用字典。
5. **首页公告**：`listNoticeTop / markNoticeRead` 已存在，但顶部通知弹窗目前未实现，属于独立需求。
6. **列表泛型**：避免 `SysNotice[][]` 类型错误。

---

## 11. 验收清单

- [ ] 公告列表按标题/操作人员/类型查询
- [ ] 分页、批量删除正常
- [ ] 新增/修改公告，富文本内容保存与回显正确
- [ ] 查看公告只读显示富文本
- [ ] 阅读用户弹窗搜索、分页正常
- [ ] 列表有最小 loading + 骨架
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
