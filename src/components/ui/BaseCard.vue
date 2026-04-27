<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    padding?: boolean
  }>(),
  { padding: true }
)
</script>

<template>
  <section :class="padding ? 'page-card space-y-4' : 'bg-white rounded-2xl space-y-4'">
    <header
      v-if="title || subtitle || $slots.header || $slots.actions"
      class="page-header"
    >
      <div v-if="title || subtitle || $slots.header">
        <slot name="header">
          <h2 v-if="title" class="page-title">{{ title }}</h2>
          <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </slot>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap gap-2 w-full sm:w-auto">
        <slot name="actions" />
      </div>
    </header>

    <slot />

    <footer v-if="$slots.footer" class="pt-3 border-t border-gray-100">
      <slot name="footer" />
    </footer>
  </section>
</template>
