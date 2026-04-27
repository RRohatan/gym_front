import { ref } from 'vue'

const isDark = ref(localStorage.getItem('theme') !== 'light')

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

applyTheme()

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    applyTheme()
  }

  return { isDark, toggleTheme }
}
