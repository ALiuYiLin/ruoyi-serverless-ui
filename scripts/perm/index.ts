/**
 * 权限配置校验 / 导出工具
 *
 * 用法：`pnpm gen:perm`（或 `node scripts/perm/index.ts`）
 *
 * 1. 用 Vite 的 SSR 能力加载 `src/perm`、`src/api`、`src/router/routes` 中的常量，
 *    复用 `@` 别名；`@/utils/request` 会被替换成桩文件，避免加载浏览器依赖。
 * 2. 校验 `PERMS` / `SPECS` 是否完整覆盖 `ROUTE_PATHS` 与 `APIS`（缺漏、重复）。
 * 3. 校验通过后输出 `tmp/perms.json`，结构保持 SPECS 层级（role 下按权限项展开），
 *    供后端直接使用。
 */
import { createServer } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** 项目根目录（scripts/perm -> ../..） */
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const abs = (p: string) => path.resolve(rootDir, p).replace(/\\/g, '/')
const tmpDir = path.join(rootDir, 'tmp')

/** 终端样式（ANSI） */
const styles = {
  bold: '\x1b[1m',
  reset: '\x1b[0m'
}

const colors = {
  fg: {
    green: '\x1b[32m'
  },
  bg: {
    green: '\x1b[42m',
    yellow: '\x1b[43m'
  }
}

/** 写入 tmp 目录（不存在则创建） */
function writeFile(name: string, data: string) {
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
  fs.writeFileSync(path.resolve(tmpDir, name), data)
}

/** 排除对象指定属性，返回新对象 */
function omitObject<T extends object>(obj: T, keys: string[]): Record<string, unknown> {
  const res: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key)) res[key] = value
  }
  return res
}

interface PermBody {
  paths: string[]
  apis: string[]
}

type PermMap = Record<string, PermBody>
type Specs = Record<string, PermBody | PermMap>
type PermField = 'paths' | 'apis'

interface AppContext {
  specs: Specs
  perms: PermMap
  roleKey: string
  paths: string[]
  apis: string[]
}

/** 展平 ROUTE_PATHS：跳过空串和 root 占位（分组本身不参与权限点） */
function flattenPaths(node: unknown, out: string[] = []): string[] {
  if (typeof node === 'string') {
    if (node) out.push(node)
    return out
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (key === 'root') continue
      flattenPaths(value, out)
    }
  }
  return out
}

/** 用 Vite SSR 加载前端常量模块 */
async function loadApp() {
  const server = await createServer({
    configFile: false,
    root: rootDir,
    appType: 'custom',
    logLevel: 'error',
    server: { middlewareMode: true },
    optimizeDeps: { noDiscovery: true },
    resolve: {
      alias: {
        // request 会引入 element-plus / file-saver 等浏览器依赖，工具只需要常量
        '@/utils/request': abs('scripts/perm/request.stub.ts'),
        '@': abs('src')
      }
    }
  })

  try {
    const { SPECS, PERMS } = await server.ssrLoadModule('/src/perm/index.ts')
    const { PermType } = await server.ssrLoadModule('/src/perm/types.ts')
    const { APIS } = await server.ssrLoadModule('/src/api/index.ts')
    const { ROUTE_PATHS } = await server.ssrLoadModule('/src/router/routes.ts')

    const ctx: AppContext = {
      specs: SPECS as Specs,
      perms: PERMS as PermMap,
      roleKey: PermType.role as string,
      paths: flattenPaths(ROUTE_PATHS),
      apis: Object.values(APIS as Record<string, string>)
    }

    return { ctx, close: () => server.close() }
  } catch (error) {
    await server.close()
    throw error
  }
}

/** 校验某一类资源（paths / apis）是否被权限配置完整覆盖 */
function count(ctx: AppContext, key: PermField) {
  const rest = omitObject(ctx.specs, [ctx.roleKey]) as Record<string, PermBody>
  const json = { ...rest, ...ctx.perms }
  const list = Object.values(json).flatMap((perm) => perm[key])
  const universe = ctx[key]
  const size = new Set(list).size
  const total = universe.length
  const repts = list.filter((item, index) => list.indexOf(item) !== index)
  const lacks = universe.filter((item) => !list.includes(item))
  const name = { paths: 'Paths', apis: 'Apis' }[key]

  if (repts.length) console.info(`[${name}] Repeats:`, repts)
  if (lacks.length) console.info(`[${name}] Lacks:`, lacks)

  return {
    name,
    check: size === total,
    total,
    size,
    leng: list.length,
    repeat: repts.length,
    lack: lacks.length
  }
}

/** 只保留权限体的 paths / apis */
function toPerm(value: PermBody) {
  return { paths: value.paths, apis: value.apis }
}

/** 导出权限配置：role 层递归展开，其余直接输出权限体 */
function trans(confs: Specs | PermMap, roleKey: string): Record<string, unknown> {
  return Object.entries(confs).reduce<Record<string, unknown>>((res, [key, value]) => {
    res[key] = key === roleKey
      ? trans(value as PermMap, roleKey)
      : toPerm(value as PermBody)
    return res
  }, {})
}

async function main() {
  const { ctx, close } = await loadApp()

  try {
    const infos = [count(ctx, 'paths'), count(ctx, 'apis')]
    console.table(infos)

    if (infos.some((info) => !info.check)) {
      console.info(colors.bg.yellow, 'WARN', styles.reset, '权限配置不完整，请检查 paths / apis 覆盖情况。')
      process.exitCode = 1
      return
    }

    const name = 'perms.json'
    writeFile(name, JSON.stringify(trans(ctx.specs, ctx.roleKey), null, 2))

    console.info(`${colors.bg.green} DONE ${styles.reset}`, 'Write file:', `${colors.fg.green}${name}`)
    console.info(`${colors.bg.yellow} NOTE ${styles.reset}`, 'Please move it to:', `${colors.fg.green}Backend config`)
  } finally {
    await close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
