<template>
  <div class="layout-root">

    <!-- Overlay móvil -->
    <Transition name="sb-fade">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false" />
    </Transition>

    <!-- ══════════════════ SIDEBAR ══════════════════ -->
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">

      <div class="sidebar-logo">
        <span class="sidebar-logo-text font-black">COSMO<span class="text-red-500">GYM</span></span>
        <button class="lg:hidden sidebar-close-btn" @click="sidebarOpen = false" aria-label="Cerrar menú">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :id="navTargetId(item.to)"
          :to="item.to"
          class="sidebar-item"
          :class="{ 'sidebar-item--active': isActive(item.to) }"
          :style="{ '--accent': item.color }"
          @click="sidebarOpen = false; adminOpen = false"
        >
          <div class="sidebar-icon-wrap">
            <lord-icon
              :src="item.icon"
              trigger="loop-on-hover"
              :target="`#${navTargetId(item.to)}`"
              :colors="`primary:${item.color},secondary:${item.color}`"
              style="width:20px;height:20px;display:block"
            />
          </div>
          <span class="sidebar-item-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-admin">
        <Transition name="sb-slide">
          <div v-if="adminOpen" class="admin-dropdown">
            <!-- Toggle tema (sol/luna) -->
            <button
              class="sidebar-item theme-toggle-item w-full text-left"
              :style="{ '--accent': isDark ? '#fbbf24' : '#6366f1' }"
              @click="toggleTheme"
              :aria-label="isDark ? 'Activar modo claro' : 'Activar modo oscuro'"
            >
              <div class="sidebar-icon-wrap theme-icon-wrap" :class="{ 'is-dark': isDark }">
                <Transition name="icon-swap" mode="out-in">
                  <svg
                    v-if="isDark"
                    key="sun"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                    class="theme-svg sun"
                  >
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
                  </svg>
                  <svg
                    v-else
                    key="moon"
                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"
                    class="theme-svg moon"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </Transition>
              </div>
              <span class="sidebar-item-label">
                {{ isDark ? 'Modo claro' : 'Modo oscuro' }}
              </span>
              <span class="theme-switch" :class="{ 'on': isDark }" aria-hidden="true">
                <span class="theme-switch-knob" />
              </span>
            </button>

            <router-link
              id="admin-settings-item"
              to="/configuracion"
              class="sidebar-item"
              :style="{ '--accent': '#94a3b8' }"
              @click="sidebarOpen = false; adminOpen = false"
            >
              <div class="sidebar-icon-wrap">
                <lord-icon
                  src="https://cdn.lordicon.com/hwuyudkm.json"
                  trigger="loop-on-hover"
                  target="#admin-settings-item"
                  colors="primary:#94a3b8,secondary:#94a3b8"
                  style="width:20px;height:20px;display:block"
                />
              </div>
              <span class="sidebar-item-label">Ajustes</span>
            </router-link>

            <button
              id="admin-logout-item"
              class="sidebar-item sidebar-item--danger w-full text-left"
              @click="confirmLogout"
            >
              <div class="sidebar-icon-wrap" style="--accent:#ef4444">
                <lord-icon
                  src="https://cdn.lordicon.com/vduvxizq.json"
                  trigger="loop-on-hover"
                  target="#admin-logout-item"
                  colors="primary:#ef4444,secondary:#ef4444"
                  style="width:20px;height:20px;display:block"
                />
              </div>
              <span class="sidebar-item-label text-red-400">Salir</span>
            </button>
          </div>
        </Transition>

        <button class="admin-btn" @click="adminOpen = !adminOpen">
          <div class="admin-avatar">{{ userInitial }}</div>
          <div class="admin-info">
            <p class="admin-role">Administrador</p>
            <p class="admin-name">{{ userName }}</p>
          </div>
          <svg
            class="admin-chevron"
            :class="{ 'rotate-180': adminOpen }"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="2.5" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- ══════════════════ MAIN ══════════════════ -->
    <div class="layout-main">

      <!-- ── Topbar (solo móvil) ── -->
      <div class="app-topbar lg:hidden">
        <!-- Hamburger solo en móvil -->
        <button class="lg:hidden topbar-ham" @click="sidebarOpen = true" aria-label="Abrir menú">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <!-- Logo solo en móvil -->
        <span class="lg:hidden topbar-logo">COSMO<span class="text-red-500">GYM</span></span>

        <!-- Spacer -->
        <div class="flex-1" />
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useTheme } from '@/composables/useTheme'
import Swal from 'sweetalert2'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const { isDark, toggleTheme } = useTheme()

const sidebarOpen = ref(false)
const adminOpen   = ref(false)

const user        = auth.user
const userName    = computed(() => user?.name || 'Usuario')
const userInitial = computed(() => (user?.name || 'A').charAt(0).toUpperCase())

const iconColors = computed(() =>
  isDark.value
    ? 'primary:#ffffff,secondary:#ffffff'
    : 'primary:#374151,secondary:#374151'
)

const navTargetId = (to: string) =>
  `sb-item-${to.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

const isActive = (to: string) =>
  route.path.toLowerCase() === to.toLowerCase()

const navItems = [
  { to: '/menu',            label: 'Dashboard',      icon: 'https://cdn.lordicon.com/jdgfsfzr.json', color: '#6366f1' },
  { to: '/pos',             label: 'Punto de Venta', icon: 'https://cdn.lordicon.com/nqtddedc.json', color: '#a78bfa' },
  { to: '/members',         label: 'Clientes',       icon: 'https://cdn.lordicon.com/dqxvvqzi.json', color: '#34d399' },
  { to: '/Payments',        label: 'Pagos',          icon: 'https://cdn.lordicon.com/qjuicwkz.json', color: '#fbbf24' },
  { to: '/Products',        label: 'Inventario',     icon: 'https://cdn.lordicon.com/xcrjfuzb.json', color: '#60a5fa' },
  { to: '/membershipPlans', label: 'Planes',         icon: 'https://cdn.lordicon.com/tfdnfjtj.json', color: '#c084fc' },
  { to: '/Membership',      label: 'Membresías',     icon: 'https://cdn.lordicon.com/ihhacbjz.json', color: '#38bdf8' },
  { to: '/CashBox',         label: 'Caja',           icon: 'https://cdn.lordicon.com/hbvgknxo.json', color: '#2dd4bf' },
  { to: '/statistics',      label: 'Estadísticas',   icon: 'https://cdn.lordicon.com/dxjqoygy.json', color: '#fb923c' },
  { to: '/access-logs',     label: 'Ingresos',       icon: 'https://cdn.lordicon.com/bpsvmaul.json', color: '#818cf8' },
  { to: '/kiosko',          label: 'Kiosco',         icon: 'https://cdn.lordicon.com/msetysan.json', color: '#4ade80' },
  { to: '/subscription',    label: 'Suscripción',    icon: 'https://cdn.lordicon.com/oqdmuxru.json', color: '#34d399' },
]

const confirmLogout = async () => {
  adminOpen.value   = false
  sidebarOpen.value = false
  const result = await Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Deseas salir del sistema?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#374151',
    heightAuto: false,
  })
  if (result.isConfirmed) {
    auth.logout()
    router.push('/')
  }
}
</script>
