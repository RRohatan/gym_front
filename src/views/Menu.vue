<template>
  <div class="page-layout-dark">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <!-- ═══════════ Bienvenida ═══════════ -->
      <div class="mb-10 animate-fade-in">
        <div class="flex items-center gap-2 mb-3">
          <span
            class="w-2 h-2 rounded-full bg-emerald-400"
            style="box-shadow:0 0 8px rgba(52,211,153,0.8);animation:pulse 2s infinite"
          />
          <span class="text-xs font-bold uppercase tracking-[0.2em]" style="color:var(--dash-badge)">
            Panel de Control
          </span>
        </div>
        <h1
          class="text-4xl sm:text-5xl font-black leading-none mb-2"
          style="letter-spacing:-0.025em;color:var(--dash-title)"
        >
          {{ user?.gimnasio?.nombre || 'Mi Gimnasio' }}
        </h1>
        <p class="text-sm" style="color:var(--dash-sub)">
          {{ greeting }}, <span class="font-semibold" style="color:var(--dash-title)">{{ user?.name }}</span> —
          {{ today }}
        </p>
      </div>

      <!-- ═══════════ Estadísticas ═══════════ -->
      <p class="section-label mb-4">Resumen</p>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">

        <div class="stat-card" style="background:linear-gradient(135deg,#059669 0%,#065f46 100%)">
          <div class="flex items-start justify-between mb-4">
            <p class="stat-tag" style="color:rgba(167,243,208,0.85)">Activos</p>
          </div>
          <p class="stat-num">{{ stats.active || 0 }}</p>
          <p class="stat-desc" style="color:rgba(167,243,208,0.6)">Membresías vigentes</p>
        </div>

        <router-link
          to="/Membership?filter=expired"
          class="stat-card cursor-pointer block"
          style="background:linear-gradient(135deg,#dc2626 0%,#991b1b 100%)"
        >
          <div class="flex items-start justify-between mb-4">
            <p class="stat-tag" style="color:rgba(254,202,202,0.85)">Vencidos</p>
          </div>
          <p class="stat-num">{{ stats.expired || 0 }}</p>
          <p class="stat-desc" style="color:rgba(254,202,202,0.6)">Requieren renovación</p>
        </router-link>

        <router-link
          to="/Membership?filter=inactive_unpaid"
          class="stat-card cursor-pointer block"
          style="background:linear-gradient(135deg,#d97706 0%,#92400e 100%)"
        >
          <div class="flex items-start justify-between mb-4">
            <p class="stat-tag" style="color:rgba(253,230,138,0.85)">Por Pagar</p>
          </div>
          <p class="stat-num">{{ stats.inactive_unpaid || 0 }}</p>
          <p class="stat-desc" style="color:rgba(253,230,138,0.6)">Pendientes de cobro</p>
        </router-link>

        <router-link
          to="/Membership?filter=expiring_soon"
          class="stat-card cursor-pointer block"
          style="background:linear-gradient(135deg,#2563eb 0%,#3730a3 100%)"
        >
          <div class="flex items-start justify-between mb-4">
            <p class="stat-tag" style="color:rgba(191,219,254,0.85)">Vencen Pronto</p>
          </div>
          <p class="stat-num">{{ stats.expiring_soon || 0 }}</p>
          <p class="stat-desc" style="color:rgba(191,219,254,0.6)">En los próximos días</p>
        </router-link>
      </div>

      <!-- ═══════════ Acceso rápido ═══════════ -->
      <p class="section-label mb-4">Acceso Rápido</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">

        <router-link to="/pos" class="quick-card group" style="--qc:#6366f1">
          <span class="quick-label">Punto de Venta</span>
        </router-link>

        <router-link to="/members" class="quick-card group" style="--qc:#34d399">
          <span class="quick-label">Clientes</span>
        </router-link>

        <router-link to="/Membership" class="quick-card group" style="--qc:#38bdf8">
          <span class="quick-label">Membresías</span>
        </router-link>

        <router-link to="/CashBox" class="quick-card group" style="--qc:#2dd4bf">
          <span class="quick-label">Caja</span>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import api from '@/axios'
import Swal from 'sweetalert2'

const auth  = useAuthStore()
const user  = auth.user
const stats = ref<Record<string, number>>({})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const today = computed(() =>
  new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
)

onMounted(async () => {
  try {
    const { data } = await api.get('/memberships/stats')
    stats.value = data
  } catch {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Error cargando estadísticas',
      showConfirmButton: false,
      timer: 3000,
    })
  }
})
</script>
