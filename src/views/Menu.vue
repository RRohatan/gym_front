<template>
  <div class="page-layout-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <!-- ===== Header ===== -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-12 animate-fade-in">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="dash-panel-label">Panel de Control</span>
          </div>
          <h1 class="dash-title">{{ user?.gimnasio?.nombre || "Mi Gimnasio" }}</h1>
        </div>

        <div class="dash-user-card">
          <div class="dash-avatar">{{ (user?.name || "A").charAt(0).toUpperCase() }}</div>
          <div class="min-w-0">
            <p class="dash-user-role">Administrador</p>
            <p class="text-sm font-bold text-white truncate max-w-[150px]">{{ user?.name }}</p>
          </div>
        </div>
      </div>

      <!-- ===== Stat Cards ===== -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">

        <div class="stat-card stat-card-green">
          <div class="flex items-start justify-between mb-4">
            <p class="text-[11px] font-bold uppercase tracking-widest stat-tint-green">Activos</p>
            <div class="stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-2">{{ stats.active || 0 }}</p>
          <p class="text-xs font-medium stat-sub-green">Membresías vigentes</p>
        </div>

        <router-link to="/Membership?filter=expired" class="stat-card stat-card-red cursor-pointer block">
          <div class="flex items-start justify-between mb-4">
            <p class="text-[11px] font-bold uppercase tracking-widest stat-tint-red">Vencidos</p>
            <div class="stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-2">{{ stats.expired || 0 }}</p>
          <p class="text-xs font-medium stat-sub-red">Requieren renovación</p>
        </router-link>

        <router-link to="/Membership?filter=inactive_unpaid" class="stat-card stat-card-orange cursor-pointer block">
          <div class="flex items-start justify-between mb-4">
            <p class="text-[11px] font-bold uppercase tracking-widest stat-tint-orange">Por Pagar</p>
            <div class="stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
          </div>
          <p class="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-2">{{ stats.inactive_unpaid || 0 }}</p>
          <p class="text-xs font-medium stat-sub-orange">Pendientes de cobro</p>
        </router-link>

        <router-link to="/Membership?filter=expiring_soon" class="stat-card stat-card-blue cursor-pointer block">
          <div class="flex items-start justify-between mb-4">
            <p class="text-[11px] font-bold uppercase tracking-widest stat-tint-blue">Vencen Pronto</p>
            <div class="stat-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-2">{{ stats.expiring_soon || 0 }}</p>
          <p class="text-xs font-medium stat-sub-blue">En los próximos días</p>
        </router-link>
      </div>

      <!-- ===== Section divider ===== -->
      <div class="dash-divider">
        <p class="dash-divider-label">Módulos</p>
        <div class="dash-divider-line"></div>
      </div>

      <!-- ===== Menu Grid ===== -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">

        <router-link to="/pos" class="menu-card group">
          <div class="menu-icon menu-icon-indigo">
            <svg class="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Punto de Venta</span>
        </router-link>

        <router-link to="/members" class="menu-card group">
          <div class="menu-icon menu-icon-green">
            <svg class="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Clientes</span>
        </router-link>

        <router-link to="/Payments" class="menu-card group">
          <div class="menu-icon menu-icon-amber">
            <svg class="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Pagos</span>
        </router-link>

        <router-link to="/Products" class="menu-card group">
          <div class="menu-icon menu-icon-blue">
            <svg class="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Inventario</span>
        </router-link>

        <router-link to="/membershipPlans" class="menu-card group">
          <div class="menu-icon menu-icon-violet">
            <svg class="w-6 h-6 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Planes</span>
        </router-link>

        <router-link to="/Membership" class="menu-card group">
          <div class="menu-icon menu-icon-sky">
            <svg class="w-6 h-6 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Membresías</span>
        </router-link>

        <router-link to="/CashBox" class="menu-card group">
          <div class="menu-icon menu-icon-teal">
            <svg class="w-6 h-6 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Caja</span>
        </router-link>

        <router-link to="/statistics" class="menu-card group">
          <div class="menu-icon menu-icon-orange">
            <svg class="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Estadísticas</span>
        </router-link>

        <router-link to="/subscription" class="menu-card group">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105"
            style="background: rgba(16,185,129,0.18); border: 1px solid rgba(16,185,129,0.28);">
            <svg class="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Suscripción</span>
        </router-link>

        <router-link to="/configuracion" class="menu-card group">
          <div class="menu-icon menu-icon-slate">
            <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Ajustes</span>
        </router-link>

        <router-link to="/access-logs" class="menu-card group">
          <div class="menu-icon menu-icon-indigo">
            <svg class="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
            </svg>
          </div>
          <span class="text-sm font-semibold">Ingresos</span>
        </router-link>

        <button @click="goToKiosk" class="menu-card group">
          <div class="menu-icon menu-icon-emerald">
            <svg class="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2M5 12a7 7 0 0 1 14 0M5 12v4a7 7 0 0 0 12 3M8 12v5M12 12v6"/>
            </svg>
          </div>
          <span class="text-sm font-semibold text-emerald-300">Kiosco</span>
        </button>

        <button @click="logout" class="menu-card group">
          <div class="menu-icon menu-icon-red">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </div>
          <span class="text-sm font-semibold text-red-400">Salir</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "vue-router";
import api from "@/axios";
import Swal from "sweetalert2";

const auth = useAuthStore();
const router = useRouter();
const user = auth.user;

const stats = ref({});

onMounted(async () => {
  try {
    const { data } = await api.get("/memberships/stats");
    stats.value = data;
  } catch (error) {
    console.error("Error cargando stats:", error);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "Error cargando estadísticas",
      showConfirmButton: false,
      timer: 3000,
    });
  }
});

const logout = () => {
  auth.logout();
  router.push("/");
};

const goToKiosk = () => {
  const gimnasioId = user?.gimnasio_id;
  router.push({ name: "FingerprintKiosk", query: { gym: gimnasioId } });
};
</script>
