// src/services/api.js
import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import router from '@/router' // 👈 Aquí se importa el router

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const auth = useAuthStore()
      auth.logout()
      router.push('/login') // 👈 Redirección automática
    }
    return Promise.reject(error)
  }
)

export default api

