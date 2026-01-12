
import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'


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
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/login') {
        // Ya estamos en la página de login, no hacer nada
        return Promise.reject(error)
      }
      const auth = useAuthStore()
      auth.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
