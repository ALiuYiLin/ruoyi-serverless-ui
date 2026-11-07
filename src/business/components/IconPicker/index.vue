<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, Search, X } from '@lucide/vue'

import SvgIcon from '@/components/SvgIcon/index.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}>(), {
  placeholder: '请选择图标',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const iconModules = import.meta.glob('@/assets/icons/svg/*.svg')
const iconNames = Object.keys(iconModules)
  .map(path => path.split('/').pop()?.replace('.svg', '') ?? '')
  .filter(Boolean)
  .sort()

const open = ref(false)
const keyword = ref('')
const filteredIcons = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  return value ? iconNames.filter(name => name.toLowerCase().includes(value)) : iconNames
})

function selectIcon(name: string) {
  emit('update:modelValue', name)
  open.value = false
}

function clearIcon() {
  emit('update:modelValue', undefined)
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" radius="md" type="button" class="w-full justify-between font-normal" :disabled="disabled">
        <span class="flex items-center gap-2 overflow-hidden">
          <SvgIcon v-if="modelValue" :icon-class="modelValue" class="size-4 shrink-0" />
          <span :class="['truncate', modelValue ? '' : 'text-muted-foreground']">
            {{ modelValue || placeholder }}
          </span>
        </span>
        <ChevronDown class="size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[320px] p-2" align="start">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="keyword" placeholder="搜索图标" class="h-8 pl-7" />
        </div>
        <Button variant="ghost" size="icon-xs" title="清空" @click="clearIcon">
          <X />
        </Button>
      </div>
      <div class="mt-2 grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
        <button
          v-for="icon in filteredIcons"
          :key="icon"
          type="button"
          class="flex flex-col items-center gap-1 rounded-md p-1.5 hover:bg-muted"
          :class="icon === modelValue ? 'bg-muted' : ''"
          @click="selectIcon(icon)"
        >
          <SvgIcon :icon-class="icon" class="size-4" />
          <span class="w-full truncate text-[10px] text-muted-foreground">{{ icon }}</span>
        </button>
      </div>
      <div v-if="!filteredIcons.length" class="py-4 text-center text-sm text-muted-foreground">
        无匹配图标
      </div>
    </PopoverContent>
  </Popover>
</template>
