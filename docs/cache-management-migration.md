# 缓存监控 / 缓存列表迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\monitor\cache`（`index.vue`、`list.vue`）
> 目标：`src/views/monitor/cache`，继续使用 shadcn-vue + Tailwind + Pinia 体系。
>
> 本报告只做方案设计，不包含代码改动。

---

## 0. 方案确认点

缓存监控有两个后台菜单：

| 菜单 | 组件（后端） | 迁移后页面 |
|---|---|---|
| 缓存监控 | `monitor/cache/index` | `views/monitor/cache/index.vue` |
| 缓存列表 | `monitor/cache/list` | `views/monitor/cache/list.vue` |

参考页面用 ECharts 画「命令统计饼图」和「内存仪表盘」。

当前项目已按本次迁移要求安装 `echarts@6.1.0`，直接沿用参考实现：

- 命令统计：`pie`（`roseType: 'radius'`）；
- 内存信息：`gauge`，max=1000，value 取 `parseFloat(info.used_memory_human)`。

---

## 1. 迁移范围与现状

当前项目缺少：

- `types/api/monitor/cache.ts`（参考项目有 `SysCache` 类型）；
- `api/monitor/cache.ts`；
- `views/monitor/cache` 两个页面。

后端接口已验证：

| 接口 | 结果 |
|---|---|
| `GET /monitor/cache` | 200；返回 `{ info, commandStats, dbSize }` |
| `GET /monitor/cache/getNames` | 200；data 数组，共 7 项 |
| `GET /monitor/cache/getKeys/{cacheName}` | 200；返回 key 字符串数组 |

---

## 2. 缓存监控（index.vue）

### 2.1 基本信息卡片

字段来自 `cache.info`：

| 属性 | 字段 |
|---|---|
| Redis 版本 | `info.redis_version` |
| 运行模式 | `info.redis_mode`（standalone → 单机，否则集群） |
| 端口 | `info.tcp_port` |
| 客户端数 | `info.connected_clients` |
| 运行时间(天) | `info.uptime_in_days` |
| 使用内存 | `info.used_memory_human` |
| 使用 CPU | `parseFloat(info.used_cpu_user_children).toFixed(2)` |
| 内存配置 | `info.maxmemory_human` |
| AOF 是否开启 | `info.aof_enabled === '0' ? '否' : '是'` |
| RDB 是否成功 | `info.rdb_last_bgsave_status` |
| Key 数量 | `dbSize` |
| 网络入口/出口 | `info.instantaneous_input_kbps` / `info.instantaneous_output_kbps` |

### 2.2 命令统计

`cache.commandStats` 是 `{ name, value }[]`。

方案 A 展示：

```
命令统计
config|get   ██████████ 2
incr         ████████████████████ 124
unlink       ███ 14
```

- 按 value 降序取前 10；
- 用进度条宽度表示占比；
- 点击/悬浮可以看具体数值。

### 2.3 内存信息

- 用进度条展示 `used_memory_human` 与 `maxmemory_human` 的比例；
- 若 `maxmemory` 为 0（无上限），直接展示 used_memory_human + 峰值 `used_memory_peak_human`。

### 2.4 页面结构

```
Flex direction=column gap=14 h-full
├── PageHead（缓存监控 + 刷新）
├── Card「基本信息」
├── grid grid-cols-2 gap-4
│   ├── Card「命令统计」→ 条形列表
│   └── Card「内存信息」→ 进度条 + 数值
└── loading 骨架
```

---

## 3. 缓存列表（list.vue）

参考页面是三列布局：

```
┌──────────────┬──────────────┬──────────────────┐
│ 缓存列表      │ 键名列表      │ 缓存内容          │
│ cache names  │ keys         │ key/value         │
│ [刷新]       │ [刷新]       │ [清理全部]        │
└──────────────┴──────────────┴──────────────────┘
```

### 3.1 缓存列表（左）

- `listCacheName()` → `SysCache[]`；
- 列：序号、缓存名称（去掉尾部 `:`）、备注、操作（清理该缓存名）；
- 行点击 → `getCacheKeys(row.cacheName)`；
- 刷新按钮。

### 3.2 键名列表（中）

- `listCacheKey(cacheName)` → `string[]`；
- 列：序号、缓存键名（去掉 cacheName 前缀）、操作（清理指定 key）；
- 行点击 → `getCacheValue(cacheName, cacheKey)`；
- 刷新按钮。

### 3.3 缓存内容（右）

- 只读展示：缓存名称、缓存键名、缓存内容（textarea/pre）；
- 顶部「清理全部」按钮 → `clearCacheAll()` 二次确认；
- 内容可能很长，用 `max-h + overflow-auto`。

### 3.4 交互细节

- 三列高度撑满内容区，各自滚动；
- 清理缓存名 / 清理 key / 清理全部都要 `AlertDialog` 确认；
- 清理成功后刷新对应列表；
- 空状态：`暂无缓存 / 请选择缓存名称 / 请选择缓存键名`。

---

## 4. API / 类型

### 4.1 类型（新建 `src/types/api/monitor/cache.ts`）

```ts
export interface SysCache {
  cacheName?: string
  cacheKey?: string
  cacheValue?: string
  remark?: string
}

export interface CacheCommandStat {
  name: string
  value: number | string
}

export interface CacheInfo {
  redis_version?: string
  redis_mode?: string
  tcp_port?: string
  connected_clients?: string
  uptime_in_days?: string
  used_memory_human?: string
  used_cpu_user_children?: string
  maxmemory_human?: string
  aof_enabled?: string
  rdb_last_bgsave_status?: string
  instantaneous_input_kbps?: string
  instantaneous_output_kbps?: string
  used_memory_peak_human?: string
  [key: string]: string | undefined
}

export interface CacheMonitorData {
  info?: CacheInfo
  commandStats?: CacheCommandStat[]
  dbSize?: number
}
```

### 4.2 API（新建 `src/api/monitor/cache.ts`）

| 函数 | 接口 | 方法 |
|---|---|---|
| `getCache` | `/monitor/cache` | GET |
| `listCacheName` | `/monitor/cache/getNames` | GET |
| `listCacheKey` | `/monitor/cache/getKeys/{cacheName}` | GET |
| `getCacheValue` | `/monitor/cache/getValue/{cacheName}/{cacheKey}` | GET |
| `clearCacheName` | `/monitor/cache/clearCacheName/{cacheName}` | DELETE |
| `clearCacheKey` | `/monitor/cache/clearCacheKey/{cacheKey}` | DELETE |
| `clearCacheAll` | `/monitor/cache/clearCacheAll` | DELETE |

注意 URL 中的 cacheName / cacheKey 需要 `encodeURIComponent`。

---

## 5. 状态管理

缓存页面是独立只读/清理页面，建议直接在页面内维护：

- `index.vue`：`cache`, `loading`
- `list.vue`：`cacheNames`, `cacheKeys`, `nowCacheName`, `cacheForm`, `loading`, `subLoading`

不需要放入全局 store。

---

## 6. 组件映射

| Element Plus | 迁后 |
|---|---|
| `el-card` | `Card` |
| `el-table` + highlight-current-row | `Table` + 行点击样式（`cursor-pointer hover:bg-muted`） |
| `el-input readonly` | `Input disabled` |
| `el-input type=textarea readonly` | `Textarea disabled` 或 `<pre>` |
| `$modal.confirm` | `AlertDialog` |
| `v-loading` | `loading` + `Skeleton` |
| `echarts` | 已安装 `echarts@6.1.0`，命令统计饼图 + 内存仪表盘 |

---

## 7. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | cache 类型 + API |
| P1 | 缓存监控页（基本信息 + 命令统计 + 内存） |
| P2 | 缓存列表页（三列 + 清理 + 刷新） |
| P3 | 联调（无缓存/空 key/清空全部） |

---

## 8. 风险点

1. **echarts**：不引入时视觉与参考不同，但功能一致；如要求高度还原再安装 echarts。
2. **`used_memory_human` 可能是 "1.52M"**：不能直接 `parseFloat` 当 MB；展示原字符串即可。
3. **`maxmemory` 为 0**：表示无限制，内存仪表盘不能按百分比算；需特殊处理。
4. **URL 编码**：cacheName / cacheKey 可能含 `:`、特殊字符，必须编码。
5. **key 前缀**：缓存名列表显示去掉 `:`，键名列表显示去掉 `cacheName` 前缀。
6. **清空全部**：影响所有缓存，必须二次确认。
7. **长内容**：缓存 value 可能很长，内容区要可滚动，避免撑破布局。

---

## 9. 验收清单

- [ ] 缓存监控页展示 Redis 版本、运行模式、端口、客户端数、运行时间、内存、CPU、AOF/RDB、Key 数量、网络流量
- [ ] 命令统计按数值展示
- [ ] 内存信息展示 used / peak
- [ ] 缓存列表三列联动：点缓存名 → 键名 → 内容
- [ ] 刷新缓存名/键名正常
- [ ] 清理缓存名/键名/全部有确认并成功刷新
- [ ] 空状态正常
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
