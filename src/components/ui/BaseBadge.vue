<script setup lang="ts">
type BadgeColor = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'orange'

withDefaults(
  defineProps<{
    color?: BadgeColor
    dot?: boolean
  }>(),
  { color: 'gray', dot: false }
)

const dotColorMap: Record<BadgeColor, string> = {
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
  orange: 'bg-orange-500',
  violet: 'bg-violet-500',
}
</script>

<template>
  <span :class="['badge', `badge-${color}`, dot && 'gap-1.5']">
    <span
      v-if="dot"
      :class="['w-1.5 h-1.5 rounded-full', dotColorMap[color]]"
      aria-hidden="true"
    />
    <slot />
  </span>
</template>
