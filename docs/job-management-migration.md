# 定时任务迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\monitor\job`（`index.vue`、`log.vue`、`detail.vue`）
> 目标：`src/views/monitor/job`，继续使用 shadcn-vue + Tailwind + Pinia 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 1. 迁移范围与现状

参考页面：

- 定时任务列表 + 新增/修改弹窗 + 状态切换 + 执行一次 + 导出；
- 任务日志（log.vue）：分页列表 + 删除/清空/导出 + 日志详情；
- 任务详情弹窗（detail.vue）：任务配置/调度信息 / 日志详情两种模式。

当前项目：

- 缺少 `types/api/monitor/job.ts`、`jobLog.ts`；
- 缺少 `api/monitor/job.ts`、`jobLog.ts`；
- 缺少 views 页面。

后端接口已验证：

- `GET /monitor/job/list` → 200，total=3；
- `GET /monitor/jobLog/list` → 200，total=0；
- 后端菜单 component：`monitor/job/index`。

---

## 2. 目标组件结构

```
src/types/api/monitor/job.ts
src/types/api/monitor/jobLog.ts
src/api/monitor/job.ts
src/api/monitor/jobLog.ts
src/store/system/job.ts
src/views/monitor/job/
├── index.vue           # PageHead + FilterBar + Table + JobForm + JobDetailDialog
├── PageHead.vue        # 标题「定时任务」+ 新增
├── FilterBar.vue       # 任务名称 / 任务组名 / 任务状态
├── Table.vue           # 表格 + 工具栏 + 分页
├── JobForm.vue         # scene = view | add | edit
├── JobLogDialog.vue    # 调度日志弹窗（查询/分页/删除/清空/导出/详情）
└── JobLogDetailDialog.vue
```

说明：

- 参考页面任务日志是独立页面 `/monitor/job-log`；迁移时建议先做 **JobLogDialog**（在当前页打开），避免新增隐藏路由；
- 如果后续需要 URL 直达，再补一个 `job/log.vue` + 隐藏路由。

---

## 3. 任务列表

### 3.1 查询参数

```ts
export interface JobQueryParams extends PageDomain {
  jobName?: string
  jobGroup?: string
  status?: '0' | '1'
}
```

FilterBar：

| 字段 | 组件 | 选项 |
|---|---|---|
| 任务名称 | `Input` | — |
| 任务组名 | `Select` | 全部 / DEFAULT / SYSTEM |
| 任务状态 | `Select` | 全部 / 正常 0 / 暂停 1 |

### 3.2 工具栏

| 按钮 | 行为 |
|---|---|
| 新增 | 打开 JobForm（add） |
| 修改 / 删除 | 选中单条/多条 |
| 执行一次 | `runJob(jobId, jobGroup)` |
| 日志 | 打开 JobLogDialog（带当前任务筛选） |
| 导出 | `download('monitor/job/export', ...)` |

### 3.3 表格列

| 列 | 字段 | 展示 |
|---|---|---|
| 勾选 | — | Checkbox |
| 任务编号 | `jobId` | 文本 |
| 任务名称 | `jobName` | 可点击打开 view |
| 任务组名 | `jobGroup` | DEFAULT / SYSTEM |
| 调用目标字符串 | `invokeTarget` | 文本 |
| cron 执行表达式 | `cronExpression` | 文本 |
| 状态 | `status` | `Switch`（0 正常 / 1 暂停），调 `changeJobStatus` |
| 操作 | — | 修改 / 删除 / 执行一次 / 日志 |

- 状态开关失败回滚；
- 删除/批量删除 `AlertDialog`；
- 分页 + 骨架 + 最小 loading 300ms。

---

## 4. JobForm

### 4.1 字段

| 字段 | 组件 | 校验/说明 |
|---|---|---|
| 任务名称 | `Input` | 必填 |
| 任务分组 | `Select` | DEFAULT / SYSTEM |
| 调用目标字符串 | `Input` | 必填；提示 `ryTask.ryParams('ry')` 格式 |
| cron 执行表达式 | `Input` +「生成表达式」按钮 | 必填 |
| 状态 | `Select` | 正常 0 / 暂停 1 |
| 执行策略 | `Select` | 立即执行 1 / 执行一次 2 / 放弃执行 3（`misfirePolicy`） |
| 是否并发 | `Select` | 允许 0 / 禁止 1（`concurrent`） |
| 备注 | `Textarea` | 可选 |

- `scene = view | add | edit`，view 全 disabled；
- cron 生成器：参考页面用 `Crontab` 组件；第一版可以先用普通 Input + 语法提示，后续再补可视化生成器；
- 调用目标字符串前端做基本校验（不能为空），具体合法性由后端。

---

## 5. 调度日志（JobLogDialog）

### 5.1 查询参数

```ts
export interface JobLogQueryParams extends PageDomain {
  jobId?: number
  jobName?: string
  jobGroup?: string
  status?: '0' | '1'
  params?: { beginTime?: string; endTime?: string }
}
```

FilterBar：任务名称 / 任务组名 / 执行状态 / 执行时间。

### 5.2 表格列

| 列 | 字段 |
|---|---|
| 勾选 | — |
| 日志编号 | `jobLogId` |
| 任务名称 | `jobName` |
| 任务组名 | `jobGroup` |
| 调用目标字符串 | `invokeTarget` |
| 日志信息 | `jobMessage` |
| 执行状态 | `status`（正常 / 失败） |
| 执行时间 | `createTime` |
| 操作 | 详情 / 删除 |

工具栏：批量删除、清空、导出。

### 5.3 日志详情

`JobLogDetailDialog` 展示：

- 基本信息：日志编号、执行状态、开始时间、结束时间、记录时间、执行耗时；
- 任务信息：任务名称、任务分组、日志信息；
- 调用目标；
- 异常信息（status=1 时显示 `exceptionInfo`）。

---

## 6. 任务详情（可选）

参考 `detail.vue` 的「任务详细」模式，展示任务配置、调度信息、调用目标。
如果 JobForm 已支持 `scene='view'`，可以不再单独做任务详情弹窗，直接复用 JobForm 的 view 场景。

---

## 7. API / 类型

### 7.1 类型

`src/types/api/monitor/job.ts`：

```ts
export interface JobQueryParams extends PageDomain {
  jobName?: string
  jobGroup?: string
  status?: '0' | '1'
}

export interface SysJob extends BaseEntity {
  jobId?: number
  jobName?: string
  jobGroup?: string
  invokeTarget?: string
  cronExpression?: string
  nextValidTime?: string
  misfirePolicy?: '1' | '2' | '3'
  concurrent?: '0' | '1'
  status?: '0' | '1'
  remark?: string
}
```

`src/types/api/monitor/jobLog.ts`：

```ts
export interface JobLogQueryParams extends PageDomain {
  jobId?: number
  jobName?: string
  jobGroup?: string
  status?: '0' | '1'
  params?: { beginTime?: string; endTime?: string }
}

export interface SysJobLog extends BaseEntity {
  jobLogId?: number
  jobName?: string
  jobGroup?: string
  invokeTarget?: string
  jobMessage?: string
  exceptionInfo?: string
  status?: '0' | '1'
  startTime?: string
  endTime?: string
  createTime?: string
}
```

### 7.2 API

`src/api/monitor/job.ts`：

| 接口 | 方法 |
|---|---|
| `/monitor/job/list` | GET |
| `/monitor/job/{jobId}` | GET |
| `/monitor/job` | POST |
| `/monitor/job` | PUT |
| `/monitor/job/{jobIds}` | DELETE |
| `/monitor/job/changeStatus` | PUT |
| `/monitor/job/run` | PUT |

`src/api/monitor/jobLog.ts`：

| 接口 | 方法 |
|---|---|
| `/monitor/jobLog/list` | GET |
| `/monitor/jobLog/{jobLogId}` | DELETE |
| `/monitor/jobLog/clean` | DELETE |

---

## 8. Store

```ts
useSystemJobStore = defineStore('system-job', () => {
  // 列表
  queryParams, jobList, total, loading
  getList(), search(), resetQuery(), setPage(), setPageSize()
  changeStatus(jobId, status), runOnce(row)

  // 表单
  formVisible, formScene, formLoading, formData
  openAddForm(), openEditForm(row), openViewForm(row)
  closeForm(), submitForm()

  // 删除
  deleteVisible, deleteIds, confirmDelete()

  // 日志
  logVisible, logQuery, logList, logTotal, logLoading
  openLogDialog(row), closeLogDialog(), getLogList(), deleteLog(), cleanLog()
})
```

日志状态也可以放到 `JobLogDialog` 内部，避免 store 太大。

---

## 9. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-input` | `Input` |
| `el-select` | `Select` |
| `el-switch` | `Switch` |
| `el-table` | `Table` 系列 |
| `pagination` | `Pagination` |
| `el-dialog` | `Dialog` |
| `el-tag` | 文本/徽标 |
| `v-loading` | `loading` + `Skeleton` |
| `right-toolbar` | `DropdownMenu` 列设置 |
| 删除/清空/执行确认 | `AlertDialog` |
| `Crontab` | 可选：后续实现 cron 生成器；第一版普通 Input |

---

## 10. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | job / jobLog 类型与 API |
| P1 | 任务列表（查询/分页/状态切换/删除/执行一次/导出） |
| P2 | JobForm（view/add/edit） |
| P3 | JobLogDialog + 日志详情 |
| P4 | 联调（cron、状态切换、执行一次、日志） |

---

## 11. 风险点

1. **cron 表达式生成器**：参考用 `Crontab` 组件，项目暂无；第一版可用 Input，后续补。
2. **状态切换**：`changeJobStatus` 会真正启停调度，失败要回滚。
3. **执行一次**：`runJob(jobId, jobGroup)` 立即执行，需二次确认并提示。
4. **任务日志路由**：参考是独立页面，建议先用弹窗；如做页面要补隐藏路由。
5. **`nextValidTime`**：后端可能返回日期字符串或时间戳，表格显示做兼容。
6. **导出**：`monitor/job/export`、`monitor/jobLog/export` 两个路径不要混。
7. **权限点**：`monitor:job:*`、`monitor:job:changeStatus`。

---

## 12. 验收清单

- [ ] 任务列表按名称/组名/状态查询
- [ ] 分页、批量删除、导出正常
- [ ] 状态开关启停成功，失败回滚
- [ ] 新增/修改任务字段校验正确，cron 保存正确
- [ ] 查看任务只读
- [ ] 执行一次有确认并成功提示
- [ ] 调度日志查询/分页/删除/清空/导出正常
- [ ] 日志详情字段完整，异常信息显示
- [ ] 列表有最小 loading + 骨架
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
