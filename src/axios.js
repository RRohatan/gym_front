
import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import router from '@/router' // Para redirección en errores

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// Agrega el token a cada request si existe
api.interceptors.request.use(config => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Maneja errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      router.push('/login') // Redirige al login automáticamente
    }
    return Promise.reject(error)
  }
)

export default api
