<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top" v-if="search">
        <el-button circle icon="Search" @click="toggleSearch()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button circle icon="Refresh" @click="refresh()" />
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="显隐列" placement="top" v-if="Object.keys(columns).length > 0">
        <el-button circle icon="Menu" @click="showColumn()" v-if="showColumnsType == 'transfer'"/>
        <el-dropdown trigger="click" :hide-on-click="false" style="padding-left: 12px" v-if="showColumnsType == 'checkbox'">
          <el-button circle icon="Menu" />
          <template #dropdown>
            <el-dropdown-menu>
              <!-- 全选/反选 按钮 -->
              <el-dropdown-item>
                <el-checkbox :indeterminate="isIndeterminate" v-model="isChecked" @change="toggleCheckAll"> 列展示 </el-checkbox>
              </el-dropdown-item>
              <div class="check-line"></div>
              <template v-for="(item, key) in columns" :key="item.key">
                <el-dropdown-item>
                  <el-checkbox v-model="item.visible" @change="checkboxChange($event, key)" :label="item.label" />
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-tooltip>
    </el-row>
    <el-dialog :title="title" v-model="open" append-to-body>
      <el-transfer
        :titles="['显示', '隐藏']"
        v-model="value"
        :data="transferData"
        @change="dataChange"
      ></el-transfer>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import cache from '@/plugins/cache'
import type { CheckboxValueType, TransferKey } from 'element-plus'
import type { TableShowColumns } from '@/types/api/common'

/** 显隐列数组模式下的列元素（运行时数组元素可能携带 key） */
type TableColumn = TableShowColumns & { key?: string | number }

const props = defineProps({
  /* 是否显示检索条件 */
  showSearch: {
    type: Boolean,
    default: true
  },
  /* 显隐列信息（数组格式、对象格式） */
  columns: {
    type: [Array, Object],
    default: () => ({})
  },
  /* 是否显示检索图标 */
  search: {
    type: Boolean,
    default: true
  },
  /* 显隐列类型（transfer穿梭框、checkbox复选框） */
  showColumnsType: {
    type: String,
    default: "checkbox"
  },
  /* 右外边距 */
  gutter: {
    type: Number,
    default: 10
  },
  /* 列显隐状态记忆的 localStorage key（传入则启用记忆，不传则不记忆） */
  storageKey: {
    type: String,
    default: ""
  }
})

const emits = defineEmits(['update:showSearch', 'queryTable'])

/** props.columns 的运行时声明只能是 Array | Object，这里按实际结构断言为具体类型 */
function getColumnList(): TableColumn[] {
  return props.columns as TableColumn[]
}
function getColumnMap(): Record<string, TableColumn> {
  return props.columns as Record<string, TableColumn>
}

// 显隐数据
const value = ref<number[]>([])
// 弹出层标题
const title = ref("显示/隐藏")
// 是否显示弹出层
const open = ref(false)

const style = computed(() => {
  const ret: Record<string, string> = {}
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`
  }
  return ret
})

// 是否全选/半选 状态
const isChecked = computed({
  get: () => {
    if (Array.isArray(props.columns)) {
      return getColumnList().every((col) => col.visible)
    }
    return Object.values(getColumnMap()).every((col) => col.visible)
  },
  set: () => {}
})
const isIndeterminate = computed(() => {
  if (Array.isArray(props.columns)) {
    return getColumnList().some((col) => col.visible) && !isChecked.value
  }
  return Object.values(getColumnMap()).some((col) => col.visible) && !isChecked.value
})
const transferData = computed(() => {
  if (Array.isArray(props.columns)) {
    return getColumnList().map((item, index) => ({ key: index, label: item.label }))
  }
  const columnMap = getColumnMap()
  return Object.keys(columnMap).map((key, index) => ({ key: index, label: columnMap[key].label }))
})

// 搜索
const proxy = getCurrentInstance()!.proxy!
function toggleSearch(): void {
  let el: HTMLElement | null = proxy!.$el
  let formEl: HTMLElement | null = null
  while ((el = el!.parentElement) && el !== document.body) {
    if ((formEl = el.querySelector('.el-form'))) break
  }
  if (!formEl) return emits('update:showSearch', !props.showSearch)
  animateSearch(formEl, props.showSearch)
}
function animateSearch(el: HTMLElement, isHide: boolean): void {
  const DURATION = 260
  const TRANSITION = 'max-height 0.25s ease, opacity 0.2s ease'
  const clear = () => Object.assign(el.style, { transition: '', maxHeight: '', opacity: '', overflow: '' })
  Object.assign(el.style, { overflow: 'hidden', transition: '' })
  if (isHide) {
    Object.assign(el.style, { maxHeight: el.scrollHeight + 'px', opacity: '1', transition: TRANSITION })
    requestAnimationFrame(() => Object.assign(el.style, { maxHeight: '0', opacity: '0' }))
    setTimeout(() => { emits('update:showSearch', false); clear() }, DURATION)
  } else {
    emits('update:showSearch', true)
    nextTick(() => {
      Object.assign(el.style, { maxHeight: '0', opacity: '0' })
      requestAnimationFrame(() => requestAnimationFrame(() => {
        Object.assign(el.style, { transition: TRANSITION, maxHeight: el.scrollHeight + 'px', opacity: '1' })
      }))
      setTimeout(clear, DURATION)
    })
  }
}

// 刷新
function refresh(): void {
  emits("queryTable")
}

// 右侧列表元素变化
function dataChange(data: TransferKey[]): void {
  if (Array.isArray(props.columns)) {
    const columnList = getColumnList()
    for (const item in columnList) {
      const key = columnList[item].key
      columnList[item].visible = !data.includes(parseInt(String(key)))
    }
  } else {
    const columnMap = getColumnMap()
    Object.keys(columnMap).forEach((key, index) => {
      columnMap[key].visible = !data.includes(index)
    })
  }
  saveStorage()
}

// 打开显隐列dialog
function showColumn(): void {
  open.value = true
}

// 如果传入了 storageKey，从 localStorage 恢复列显隐状态
if (props.storageKey) {
  try {
    const saved = cache.local.getJSON(props.storageKey)
    if (saved && typeof saved === 'object') {
      if (Array.isArray(props.columns)) {
        getColumnList().forEach((col, index) => {
          if (saved[index] !== undefined) col.visible = saved[index]
        })
      } else {
        const columnMap = getColumnMap()
        Object.keys(columnMap).forEach(key => {
          if (saved[key] !== undefined) columnMap[key].visible = saved[key]
        })
      }
    }
  } catch (e) {}
}
if (props.showColumnsType == "transfer") {
  // transfer穿梭显隐列初始默认隐藏列
  if (Array.isArray(props.columns)) {
    const columnList = getColumnList()
    for (const item in columnList) {
      if (columnList[item].visible === false) {
        value.value.push(parseInt(item))
      }
    }
  } else {
    const columnMap = getColumnMap()
    Object.keys(columnMap).forEach((key, index) => {
      if (columnMap[key].visible === false) {
        value.value.push(index)
      }
    })
  }
}

// 单勾选（el-checkbox 绑定 boolean 时 change 的实际值恒为 boolean）
function checkboxChange(event: CheckboxValueType, key: string | number): void {
  if (Array.isArray(props.columns)) {
    const col = getColumnList().filter((item) => item.key == key)[0]
    if (col) {
      col.visible = event as boolean
    }
  } else {
    getColumnMap()[String(key)].visible = event as boolean
  }
  saveStorage()
}

// 切换全选/反选
function toggleCheckAll(): void {
  const newValue = !isChecked.value
  if (Array.isArray(props.columns)) {
    getColumnList().forEach((col) => (col.visible = newValue))
  } else {
    Object.values(getColumnMap()).forEach((col) => (col.visible = newValue))
  }
  saveStorage()
}

// 将当前列显隐状态持久化到 localStorage
function saveStorage(): void {
  if (!props.storageKey) return
  try {
    let state: { [key: string]: boolean } = {}
    if (Array.isArray(props.columns)) {
      getColumnList().forEach((col, index) => { state[index] = col.visible })
    } else {
      const columnMap = getColumnMap()
      Object.keys(columnMap).forEach(key => { state[key] = columnMap[key].visible })
    }
    cache.local.setJSON(props.storageKey, state)
  } catch (e) {}
}
</script>

<style lang='scss' scoped>
:deep(.el-transfer__button) {
  border-radius: 50%;
  display: block;
  margin-left: 0px;
}
:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}
:deep(.el-dropdown-menu__item) {
  line-height: 30px;
  padding: 0 17px;
}
.check-line {
  width: 90%;
  height: 1px;
  background-color: #ccc;
  margin: 3px auto;
}
</style>
