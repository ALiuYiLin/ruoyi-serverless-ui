<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MultiSelectOption {
  value: number
  label: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue?: number[]
  options: MultiSelectOption[]
  placeholder?: string
  disabled?: boolean
}>(), {
  modelValue: () => [],
  placeholder: '请选择',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const selectedLabels = computed(() =>
  props.options.filter(option => props.modelValue.includes(option.value)).map(option => option.label)
)

function toggle(value: number, checked: boolean | 'indeterminate') {
  const current = props.modelValue ?? []
  if (checked === true) {
    if (!current.includes(value)) {
      emit('update:modelValue', [...current, value])
    }
  } else {
    emit('update:modelValue', current.filter(item => item !== value))
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button type="button" variant="outline" radius="md" class="w-full justify-between font-normal" :disabled="disabled">
        <span :class="selectedLabels.length ? 'truncate' : 'text-muted-foreground'">
          {{ selectedLabels.length ? selectedLabels.join('、') : placeholder }}
        </span>
        <ChevronDown class="size-4 shrink-0 opacity-50" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="max-h-64 overflow-y-auto" align="start">
      <DropdownMenuCheckboxItem
        v-for="option in options"
        :key="option.value"
        :model-value="modelValue.includes(option.value)"
        :disabled="option.disabled || disabled"
        @select.prevent
        @update:model-value="checked => toggle(option.value, checked)"
        class="rounded-sm"
      >
        {{ option.label }}
      </DropdownMenuCheckboxItem>
      <div v-if="!options.length" class="px-2 py-1.5 text-sm text-muted-foreground">暂无数据</div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
