import vue from '@vitejs/plugin-vue'

import createAutoImport from './auto-import'
import createSvgIcon from './svg-icon'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import { PluginOption } from 'vite'
import tailwindcss from '@tailwindcss/vite'


export default function createVitePlugins(viteEnv: Record<string, string>, isBuild = false) {
  const vitePlugins: PluginOption[] = [vue()]
  vitePlugins.push(createAutoImport())
  vitePlugins.push(createSetupExtend())
  vitePlugins.push(createSvgIcon(isBuild))
  vitePlugins.push(tailwindcss())
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}
