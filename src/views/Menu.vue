<template>
  <div class="page-layout-dark">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <!-- ===== Header ===== -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-12 animate-fade-in"
      >
        <div>
          <div class="flex items-center gap-2 mb-3">
            <span
              class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />
            <span
              class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/70"
            >
              Panel de Control
            </span>
          </div>
          <h1
            class="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight flex items-center gap-3 pb-1"
          >
            <!-- Icono mancuerna (Lucide dumbbell) -->
            <svg
              class="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="m6.5 6.5 11 11" />
              <path d="m21 21-1-1" />
              <path d="m3 3 1 1" />
              <path d="m18 22 4-4" />
              <path d="m2 6 4-4" />
              <path d="m3 10 7-7" />
              <path d="m14 21 7-7" />
            </svg>
            <span class="truncate">{{ user?.gimnasio?.nombre || "Mi Gimnasio" }}</span>
          </h1>
        </div>

        <div
          class="flex items-center gap-3 self-start sm:self-auto rounded-2xl px-4 py-2.5 bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/50"
          >
            <!-- Avatar tipo muñequito -->
            <span class="text-2xl leading-none" aria-label="Avatar de usuario">👤</span>
          </div>
          <div class="min-w-0">
            <p class="text-base font-bold text-white truncate max-w-[160px] leading-tight">
              {{ user?.name || "Usuario" }}
            </p>
            <p
              class="text-[10px] font-semibold uppercase tracking-widest text-indigo-300/80 mt-0.5"
            >
              Administrador
            </p>
          </div>
          <!-- Icono lateral decorativo -->
          <svg
            class="w-5 h-5 text-indigo-300/50 ml-1 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <!-- ===== Stat Cards ===== -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
        <component
          :is="card.to ? 'router-link' : 'div'"
          v-for="card in statCards"
          :key="card.statKey"
          :to="card.to"
          :class="[
            'stat-card bg-gradient-to-br',
            card.gradient,
            card.to && 'cursor-pointer block',
          ]"
        >
          <div class="flex items-start justify-between mb-4">
            <p
              :class="[
                'text-[11px] font-semibold uppercase tracking-widest',
                card.labelClass,
              ]"
            >
              {{ card.label }}
            </p>
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/20"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :d="card.iconPath"
                />
              </svg>
            </div>
          </div>
          <p class="text-5xl sm:text-6xl font-black tracking-tight leading-none mb-2">
            {{ stats[card.statKey] || 0 }}
          </p>
          <p :class="['text-xs font-medium', card.descClass]">{{ card.desc }}</p>
        </component>
      </div>

      <!-- ===== Section divider ===== -->
      <div class="flex items-center gap-4 mb-6">
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.2em] shrink-0 text-slate-500/70"
        >
          Módulos
        </p>
        <div class="h-px flex-1 bg-white/5" />
      </div>

      <!-- ===== Menu Grid ===== -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <component
          :is="item.to ? 'router-link' : 'button'"
          v-for="item in menuItems"
          :key="item.label"
          :to="item.to"
          :type="item.to ? undefined : 'button'"
          class="menu-card group"
          @click="item.action ? item.action() : null"
        >
          <div
            :class="[
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105 border',
              item.iconWrapClass,
            ]"
          >
            <svg
              :class="['w-6 h-6', item.iconColorClass]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="1.75"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                :d="item.iconPath"
              />
            </svg>
          </div>
          <span :class="['text-sm font-semibold', item.labelClass]">
            {{ item.label }}
          </span>
        </component>
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

// Stat cards — gradientes y colores ya no viven como rgba inline.
const statCards = [
  {
    statKey: "active",
    label: "Activos",
    desc: "Membresías vigentes",
    gradient: "from-emerald-600 to-emerald-800",
    labelClass: "text-emerald-200/85",
    descClass: "text-emerald-200/60",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    statKey: "expired",
    label: "Vencidos",
    desc: "Requieren renovación",
    to: "/Membership?filter=expired",
    gradient: "from-red-600 to-red-800",
    labelClass: "text-red-200/85",
    descClass: "text-red-200/60",
    iconPath: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    statKey: "inactive_unpaid",
    label: "Por Pagar",
    desc: "Pendientes de cobro",
    to: "/Membership?filter=inactive_unpaid",
    gradient: "from-amber-600 to-amber-800",
    labelClass: "text-amber-200/85",
    descClass: "text-amber-200/60",
    iconPath:
      "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    statKey: "expiring_soon",
    label: "Vencen Pronto",
    desc: "En los próximos días",
    to: "/Membership?filter=expiring_soon",
    gradient: "from-blue-600 to-indigo-800",
    labelClass: "text-blue-200/85",
    descClass: "text-blue-200/60",
    iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

// Menu grid — cada ítem define su color (para que Tailwind JIT lo detecte
// se listan clases completas, no concatenaciones dinámicas).
const menuItems = [
  {
    to: "/pos",
    label: "Punto de Venta",
    iconWrapClass: "bg-indigo-500/20 border-indigo-500/30",
    iconColorClass: "text-indigo-300",
    iconPath:
      "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    to: "/members",
    label: "Clientes",
    iconWrapClass: "bg-emerald-500/20 border-emerald-500/30",
    iconColorClass: "text-emerald-300",
    iconPath:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    to: "/Payments",
    label: "Pagos",
    iconWrapClass: "bg-amber-500/20 border-amber-500/30",
    iconColorClass: "text-amber-300",
    iconPath:
      "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    to: "/Products",
    label: "Inventario",
    iconWrapClass: "bg-blue-500/20 border-blue-500/30",
    iconColorClass: "text-blue-300",
    iconPath:
      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    to: "/MembershipPlans",
    label: "Planes",
    iconWrapClass: "bg-violet-500/20 border-violet-500/30",
    iconColorClass: "text-violet-300",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    to: "/Membership",
    label: "Membresías",
    iconWrapClass: "bg-sky-500/20 border-sky-500/30",
    iconColorClass: "text-sky-300",
    iconPath:
      "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    to: "/CashBox",
    label: "Caja",
    iconWrapClass: "bg-teal-500/20 border-teal-500/30",
    iconColorClass: "text-teal-300",
    iconPath:
      "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    to: "/statistics",
    label: "Estadísticas",
    iconWrapClass: "bg-orange-500/20 border-orange-500/30",
    iconColorClass: "text-orange-300",
    iconPath:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    to: "/subscription",
    label: "Suscripción",
    iconWrapClass: "bg-emerald-500/20 border-emerald-500/30",
    iconColorClass: "text-emerald-300",
    iconPath:
      "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
  {
    to: "/configuracion",
    label: "Ajustes",
    iconWrapClass: "bg-slate-400/15 border-slate-400/25",
    iconColorClass: "text-slate-300",
    iconPath:
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    to: "/access-logs",
    label: "Ingresos",
    iconWrapClass: "bg-indigo-500/20 border-indigo-500/30",
    iconColorClass: "text-indigo-300",
    iconPath:
      "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  },
  {
    action: () => goToKiosk(),
    label: "Kiosco",
    labelClass: "text-emerald-300",
    iconWrapClass: "bg-emerald-400/20 border-emerald-400/30",
    iconColorClass: "text-emerald-300",
    iconPath:
      "M12 11c0-1.1.9-2 2-2s2 .9 2 2v2M5 12a7 7 0 0 1 14 0M5 12v4a7 7 0 0 0 12 3M8 12v5M12 12v6",
  },
  {
    action: () => logout(),
    label: "Salir",
    labelClass: "text-red-400",
    iconWrapClass: "bg-red-500/15 border-red-500/25",
    iconColorClass: "text-red-400",
    iconPath:
      "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  },
];

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
