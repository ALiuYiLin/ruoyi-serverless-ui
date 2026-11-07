<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  readOnly?: boolean
  minHeight?: number
}>(), {
  modelValue: '',
  placeholder: '请输入内容',
  readOnly: false,
  minHeight: 192,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorRef = ref<HTMLDivElement>()
let quill: Quill | null = null
let internalChange = false

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
]

onMounted(() => {
  if (!editorRef.value) {
    return
  }
  quill = new Quill(editorRef.value, {
    theme: 'snow',
    readOnly: props.readOnly,
    placeholder: props.placeholder,
    modules: { toolbar: toolbarOptions },
  })
  if (props.modelValue) {
    quill.root.innerHTML = props.modelValue
  }
  quill.on('text-change', () => {
    internalChange = true
    emit('update:modelValue', quill?.root.innerHTML ?? '')
    internalChange = false
  })
})

watch(() => props.modelValue, value => {
  if (!quill || internalChange) {
    return
  }
  if (quill.root.innerHTML !== (value ?? '')) {
    quill.root.innerHTML = value ?? ''
  }
})

watch(() => props.readOnly, value => {
  quill?.enable(!value)
})

onBeforeUnmount(() => {
  quill = null
})
</script>

<template>
  <div class="rich-text-editor rounded-md border border-input bg-background">
    <div ref="editorRef" :style="{ minHeight: `${minHeight}px` }" />
  </div>
</template>

<style scoped>
.rich-text-editor :deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  border-top-left-radius: 0.375rem;
  border-top-right-radius: 0.375rem;
}
.rich-text-editor :deep(.ql-container) {
  border: none;
  font-size: 14px;
}
.rich-text-editor :deep(.ql-editor) {
  min-height: inherit;
}
</style>
