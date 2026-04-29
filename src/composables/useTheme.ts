import { computed, ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const DARK_CLASS = 'dark'

const hasWindow = typeof window !== 'undefined'

const mediaQuery =
  hasWindow && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

function readStoredTheme(): Theme | null {
  if (!hasWindow) return null
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : null
}

function getInitialTheme(): Theme {
  return readStoredTheme() ?? (mediaQuery?.matches ? 'dark' : 'light')
}

const theme = ref<Theme>(getInitialTheme())
const isDark = computed(() => theme.value === 'dark')

function applyTheme(value: Theme) {
  if (!hasWindow) return
  document.documentElement.classList.toggle(DARK_CLASS, value === 'dark')
  document.documentElement.style.colorScheme = value
}

watch(theme, applyTheme, { immediate: true })

if (mediaQuery) {
  mediaQuery.addEventListener('change', (event) => {
    if (readStoredTheme() !== null) return
    theme.value = event.matches ? 'dark' : 'light'
  })
}

function setTheme(value: Theme) {
  theme.value = value
  if (hasWindow) window.localStorage.setItem(STORAGE_KEY, value)
}

function toggleTheme() {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  return { theme, isDark, setTheme, toggleTheme }
}
