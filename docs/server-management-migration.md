# 服务监控迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\monitor\server\index.vue`
> 目标：`src/views/monitor/server`，继续使用 shadcn-vue + Tailwind + Pinia 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 1. 迁移范围与现状

参考页面：只读的服务监控面板，展示：

- CPU 信息：核心数、用户使用率、系统使用率、当前空闲率；
- 内存信息：物理内存 / JVM 的总量、已用、剩余、使用率；
- 服务器信息：服务器名称、IP、操作系统、系统架构、项目路径；
- Java 虚拟机信息：名称、版本、启动时间、运行时长、安装路径、运行参数；
- 磁盘状态：盘符路径、文件系统、盘符类型、总大小、可用大小、已用大小、使用率。

当前项目：

- 缺少 `types/api/monitor/server.ts`、`api/monitor/server.ts`、`views/monitor/server`；
- 没有 `echarts` 依赖，也不需要（服务监控不使用图表）。

后端接口已验证：

- `GET /monitor/server` → 200；
- 返回结构：`{ cpu, mem, jvm, sys, sysFiles }`。

---

## 2. 目标组件结构

```
src/types/api/monitor/server.ts
src/api/monitor/server.ts
src/views/monitor/server/
├── index.vue        # 数据加载 + 布局
├── PageHead.vue     # 标题「服务监控」+ 刷新按钮
└── InfoCard.vue     # 可复用卡片容器（可选）
```

服务监控是纯展示页，不需要 store；页面内 `ref` 保存数据即可。

---

## 3. 数据展示设计

### 3.1 CPU 卡片

| 属性 | 字段 |
|---|---|
| 核心数 | `cpu.cpuNum` |
| 用户使用率 | `cpu.used` % |
| 系统使用率 | `cpu.sys` % |
| 当前空闲率 | `cpu.free` % |

### 3.2 内存卡片

两列对比：

| 属性 | 物理内存 | JVM |
|---|---|---|
| 总内存 | `mem.total` G | `jvm.total` M |
| 已用内存 | `mem.used` G | `jvm.used` M |
| 剩余内存 | `mem.free` G | `jvm.free` M |
| 使用率 | `mem.usage` % | `jvm.usage` % |

使用率 > 80% 用 `text-destructive` 高亮。

### 3.3 服务器信息

| 属性 | 字段 |
|---|---|
| 服务器名称 | `sys.computerName` |
| 服务器 IP | `sys.computerIp` |
| 操作系统 | `sys.osName` |
| 系统架构 | `sys.osArch` |
| 项目路径 | `sys.userDir` |

### 3.4 JVM 信息

| 属性 | 字段 |
|---|---|
| Java 名称 | `jvm.name` |
| Java 版本 | `jvm.version` |
| 启动时间 | `jvm.startTime` |
| 运行时长 | `jvm.runTime` |
| 安装路径 | `jvm.home` |
| 运行参数 | `jvm.inputArgs` |

### 3.5 磁盘状态

`sysFiles` 数组，每行：

| 列 | 字段 |
|---|---|
| 盘符路径 | `dirName` |
| 文件系统 | `sysTypeName` |
| 盘符类型 | `typeName` |
| 总大小 | `total` |
| 可用大小 | `free` |
| 已用大小 | `used` |
| 已用百分比 | `usage` % |

---

## 4. 页面状态

```ts
const server = ref<ServerInfo>({})
const loading = ref(false)

async function getList() {
  loading.value = true
  try {
    const res = await getServer()
    server.value = res.data ?? {}
  } finally {
    loading.value = false
  }
}
```

- 首次进入自动加载；
- PageHead 放「刷新」按钮，重新拉取数据；
- loading 期间显示骨架/加载文字，避免空白页面。

---

## 5. API / 类型

### 5.1 类型（新建）

`src/types/api/monitor/server.ts`：

```ts
export interface ServerCpu {
  cpuNum?: number
  total?: number
  used?: number
  sys?: number
  free?: number
  wait?: number
}

export interface ServerMem {
  total?: number
  used?: number
  free?: number
  usage?: number
}

export interface ServerJvm {
  name?: string
  version?: string
  startTime?: string
  runTime?: string
  home?: string
  inputArgs?: string
  total?: number
  used?: number
  free?: number
  max?: number
  usage?: number
}

export interface ServerSys {
  computerName?: string
  computerIp?: string
  osName?: string
  osArch?: string
  userDir?: string
}

export interface ServerSysFile {
  dirName?: string
  sysTypeName?: string
  typeName?: string
  total?: string
  free?: string
  used?: string
  usage?: number
}

export interface ServerInfo {
  cpu?: ServerCpu
  mem?: ServerMem
  jvm?: ServerJvm
  sys?: ServerSys
  sysFiles?: ServerSysFile[]
}
```

### 5.2 API（新建 `src/api/monitor/server.ts`）

| 接口 | 方法 |
|---|---|
| `/monitor/server` | GET |

---

## 6. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-card` | `Card`（已有 radius/padding 配置） |
| 原生 table 布局 | `Table` 系列或 Tailwind 定义信息网格 |
| `v-loading` | `loading` + `Skeleton` |
| 图标（Cpu/Tickets/Monitor/CoffeeCup） | lucide 图标（`Cpu`、`MemoryStick`、`Monitor`、`Coffee`、`HardDrive`） |

布局建议：

- 顶部两列：CPU 卡片 + 内存卡片；
- 中间：服务器信息卡片（两列信息）；
- JVM 信息 + 磁盘状态各占一行；
- 全部用 `Card` + 信息行，不引入 ECharts。

---

## 7. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | server 类型 + API |
| P1 | 页面骨架 + 5 个信息卡片 |
| P2 | 刷新 / loading / 使用率高亮 |
| P3 | 联调（字段展示、磁盘多行） |

---

## 8. 风险点

1. **纯展示页**：重点是字段完整性和布局，不需要复杂状态。
2. **磁盘列表可能为空或多项**：`v-for` + 空状态。
3. **使用率可能超过 80%**：颜色高亮用 `text-destructive`。
4. **单位**：内存使用 G、JVM 使用 M、磁盘字符串自带单位，直接展示。
5. **刷新频率**：不要自动轮询，避免频繁请求后端。

---

## 9. 验收清单

- [ ] 页面加载后展示 CPU / 内存 / 服务器 / JVM / 磁盘信息
- [ ] 使用率超过 80% 时高亮
- [ ] 刷新按钮可重新拉取数据
- [ ] 磁盘列表支持多行、空状态
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
