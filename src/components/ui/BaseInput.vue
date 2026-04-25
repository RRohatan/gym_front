<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    type?: string
    placeholder?: string
    id?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    error?: string
    hint?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
    required: false,
    disabled: false,
    readonly: false,
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const attrs = useAttrs()

// Separamos class/style (van al wrapper) del resto de attrs (van al <input>).
const rootClass = computed(() => attrs.class as unknown)
const rootStyle = computed(() => attrs.style as unknown)
const inputAttrs = computed(() => {
  const { class: _c, style: _s, ...rest } = attrs as Record<string, unknown>
  return rest
})

const inputId = computed(
  () => props.id ?? `input-${Math.random().toString(36).slice(2, 8)}`
)

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    emit('update:modelValue', target.value === '' ? '' : target.valueAsNumber)
  } else {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div :class="['flex flex-col gap-1.5', rootClass]">
    <label v-if="label" :for="inputId" class="field-label">
      {{ label }}
      <span v-if="required" class="text-red-500" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <span
        v-if="$slots.prefix"
        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      >
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'field-input',
          $slots.prefix && 'pl-10',
          $slots.suffix && 'pr-10',
          error && 'border-red-400 focus:border-red-500',
        ]"
        v-bind="inputAttrs"
        @input="onInput"
      />

      <span
        v-if="$slots.suffix"
        class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      >
        <slot name="suffix" />
      </span>
    </div>

    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>
