<template>
  <div class="auth-layout">

    <!-- Panel izquierdo: imagen + branding -->
    <div class="auth-brand-panel">
      <div class="auth-brand-overlay" />
      <div class="auth-brand-content">
        <div class="auth-brand-badge">
          <span class="auth-brand-badge-dot" />
          Sistema de Gestión
        </div>
        <h1 class="auth-brand-logo">COSMO<span>GYM</span></h1>
        <p class="auth-brand-tagline">Transforma tu cuerpo,<br />transforma tu vida.</p>
        <div class="auth-brand-stats">
          <div>
            <span class="auth-stat-num">500+</span>
            <span class="auth-stat-label">Miembros</span>
          </div>
          <div class="auth-stat-divider" />
          <div>
            <span class="auth-stat-num">10+</span>
            <span class="auth-stat-label">Planes</span>
          </div>
          <div class="auth-stat-divider" />
          <div>
            <span class="auth-stat-num">24/7</span>
            <span class="auth-stat-label">Soporte</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel derecho: formulario -->
    <div class="auth-form-panel">
      <div class="auth-form-card">

        <div class="auth-mobile-logo">COSMO<span>GYM</span></div>
        <h2 class="auth-form-title">Bienvenido de nuevo</h2>
        <p class="auth-form-subtitle">Ingresa tus credenciales para continuar</p>

        <form @submit.prevent="handleLogin" class="space-y-4">

          <div class="auth-field">
            <label class="auth-label">Correo electrónico</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <input v-model="email" type="email" class="auth-input" placeholder="tu@correo.com" required />
            </div>
          </div>

          <div class="auth-field">
            <label class="auth-label">Contraseña</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <input v-model="password" :type="showPassword ? 'text' : 'password'" class="auth-input pr-11" placeholder="••••••••" required />
              <button type="button" class="auth-eye-btn" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" :disabled="loading" class="auth-submit-btn">
              <svg v-if="loading" class="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
            </button>
          </div>
        </form>

        <p class="auth-footer-text">
          ¿No tienes cuenta?
          <router-link to="/register" class="auth-footer-link">Regístrate aquí</router-link>
        </p>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import api from '@/axios'
import Swal from 'sweetalert2'
import { SWAL_COLORS } from '@/lib/colors'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value,
    })
    const { access_token, user } = response.data
    auth.setToken(access_token)
    auth.setUser(user)
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/Menu')
  } catch {
    password.value = ''
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'El correo o la contraseña son incorrectos.',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: SWAL_COLORS.danger,
      heightAuto: false,
    })
  } finally {
    loading.value = false
  }
}
</script>
