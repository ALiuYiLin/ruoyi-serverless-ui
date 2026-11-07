# 数据监控（Druid）迁移报告（RuoYi-Vue3 → ruoyi-ts）

> 参考：`E:\code3\RuoYi-Vue3\src\views\monitor\druid\index.vue`
> 目标：`src/views/monitor/druid/index.vue`
>
> 本报告只做方案设计，不包含代码改动。

---

## 1. 迁移范围与现状

参考页面只有一个 `iframe`，直接嵌入后端 Druid 监控页：

```vue
<template>
  <div>
    <i-frame v-model:src="url" />
  </div>
</template>

<script setup lang="ts">
import iFrame from '@/components/iFrame/index.vue'
const url = ref<string>(import.meta.env.VITE_APP_BASE_API + '/druid/login.html')
</script>
```

当前项目：

- 缺少 `views/monitor/druid`；
- 项目里没有 `components/iFrame`（或可能未暴露），可以用原生 `<iframe>` 或新增通用 `IFrame.vue`。

后端菜单：

- component：`monitor/druid/index`
- 路由：`/monitor/druid`

---

## 2. 目标组件结构

```
src/views/monitor/druid/
└── index.vue        # 全屏 iframe 容器
```

可选：

```
src/business/components/IFrame/index.vue
```

`IFrame` 组件只做 `src` 透传 + 自适应高度，后续其他内嵌页面也能复用。

---

## 3. 实现方案

### 3.1 页面结构

```
Flex direction=column h-full
├── PageHead（标题「数据监控」，可选）
└── iframe
    src = `${import.meta.env.VITE_APP_BASE_API}/druid/login.html`
    全宽全高，无边框
```

### 3.2 URL

```ts
const druidUrl = computed(() => `${import.meta.env.VITE_APP_BASE_API}/druid/login.html`)
```

开发环境：

- `VITE_APP_BASE_API = '/dev-api'`；
- Vite dev proxy 把 `/dev-api` 转发到后端，去掉 `/dev-api` 前缀；
- 最终请求 `http://backend/druid/login.html`。

### 3.3 原生 iframe

```vue
<iframe
  :src="druidUrl"
  class="h-full w-full border-0"
  title="Druid 数据监控"
/>
```

- 父容器必须设置高度（`h-full` / `flex-1`）；
- 外层去掉页面 padding，保证 iframe 撑满内容区；
- 可加 `referrerpolicy="no-referrer"`（按后端需要）。

---

## 4. 可选：IFrame 组件

```vue
<script setup lang="ts">
defineProps<{ src: string; title?: string }>()
</script>

<template>
  <iframe :src="src" :title="title" class="h-full w-full border-0" />
</template>
```

页面中使用：

```vue
<IFrame :src="druidUrl" title="Druid 数据监控" />
```

---

## 5. 错误/降级处理

Druid 页面是否可访问取决于后端配置：

- 如果后端未开启 Druid 监控，iframe 会显示 404/空白；
- 建议在 iframe 外增加一个「在新窗口打开」链接：

```vue
<a :href="druidUrl" target="_blank" rel="noopener">在新窗口打开</a>
```

- 也可以在 iframe `@load` 时仅做日志，不强行探测内容（跨域无法读取）。

---

## 6. 风险点

1. **跨域/cookie**：iframe 与主站同源（都走 dev proxy），一般可正常携带会话；生产环境需要确认 nginx/代理配置。
2. **Druid 登录页**：后端可能要求单独登录，或已开启匿名访问；这是后端配置问题，前端无法绕过。
3. **高度问题**：父容器没有固定高度时 iframe 可能显示 0 高，必须 `h-full`/`flex-1`。
4. **X-Frame-Options**：如果后端返回 `DENY/SAMEORIGIN`，iframe 会被浏览器拦截，需要后端允许同源嵌入。
5. **安全**：Druid 页面包含数据库监控信息，暴露在生产环境有风险，建议仅内网/开发环境开启。

---

## 7. 分阶段实施

| 阶段 | 内容 |
|---|---|
| P0 | 页面 + iframe 容器 |
| P1 | 路由菜单联调（component 必须为 `monitor/druid/index`） |
| P2 | 处理 404/高度/新窗口打开降级 |

---

## 8. 验收清单

- [ ] `/monitor/druid` 页面能加载后端 Druid 登录页
- [ ] iframe 全宽全高，无滚动条错位
- [ ] 后端未开启时给出可读提示或新窗口链接
- [ ] `vue-tsc` / `tsc` / `pnpm build:prod` 通过
