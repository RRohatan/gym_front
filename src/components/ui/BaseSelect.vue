<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

type Option = { value: string | number; label: string } | string | number

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    placeholder?: string
    id?: string
    required?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    options?: Option[]
  }>(),
  {
    modelValue: '',
    required: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const attrs = useAttrs()

const rootClass = computed(() => attrs.class as unknown)
const selectAttrs = computed(() => {
  const { class: _c, ...rest } = attrs as Record<string, unknown>
  return rest
})

const selectId = computed(
  () => props.id ?? `select-${Math.random().toString(36).slice(2, 8)}`
)

const normalizedOptions = computed(() =>
  (props.options ?? []).map((opt) =>
    typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
  )
)

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="['flex flex-col gap-1.5', rootClass]">
    <label v-if="label" :for="selectId" class="field-label">
      {{ label }}
      <span v-if="required" class="text-red-500" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :class="[
          'field-input appearance-none pr-10 cursor-pointer',
          error && 'border-red-400 focus:border-red-500',
          disabled && 'opacity-60 cursor-not-allowed',
        ]"
        v-bind="selectAttrs"
        @change="onChange"
      >
        <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
        <option
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
        <slot />
      </select>

      <ChevronDown
        class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle pointer-events-none"
        aria-hidden="true"
      />
    </div>

    <p v-if="error" class="text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-subtle">{{ hint }}</p>
  </div>
</template>
