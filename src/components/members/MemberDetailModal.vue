<template>
  <Transition name="modal-fade">
    <div v-if="show" class="detail-overlay" @click.self="close">
      <div class="detail-panel">
        <!-- Hero card -->
        <div class="relative">
          <div class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-700 px-6 sm:px-10 pt-7 pb-20">
            <div class="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
              <div class="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl" />
              <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/30 rounded-full blur-3xl" />
            </div>

            <div class="relative flex items-start justify-between gap-3">
              <div class="flex items-center gap-2 text-white/70 text-[11px] font-semibold uppercase tracking-widest">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ficha del cliente
              </div>
              <div class="flex items-center gap-2">
                <router-link
                  v-if="member"
                  :to="{ name: 'MemberEdit', params: { id: member.id } }"
                  class="btn-ghost-white"
                  @click="close"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </router-link>
                <a v-if="member?.phone" :href="`https://wa.me/${formatearTelefono(member.phone)}`" target="_blank" class="btn-ghost-white">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.52 3.48A11.8 11.8 0 0012.04 0C5.52 0 .17 5.35.14 11.87a11.82 11.82 0 001.58 5.94L0 24l6.35-1.67a11.83 11.83 0 005.68 1.45h.01c6.52 0 11.87-5.35 11.9-11.87a11.78 11.78 0 00-3.42-8.43z" />
                  </svg>
                  WhatsApp
                </a>
                <button type="button" class="btn-icon-white" aria-label="Cerrar" @click="close">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Avatar overlap -->
          <div class="relative px-6 sm:px-10 -mt-14 pb-5">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4">
              <div class="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg shrink-0">
                <div class="w-full h-full rounded-xl flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-primary-500 to-indigo-600">
                  {{ (member?.name || "?").charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="flex-1 min-w-0 pb-1">
                <h1 class="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                  {{ member?.name || "—" }}
                </h1>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-10 divide-chips">
                  <BaseBadge v-if="member?.memberships?.length" :color="statusColor(member.memberships[0].status)">
                    {{ traducirEstado(member.memberships[0].status) }}
                  </BaseBadge>
                  <BaseBadge v-else-if="member" color="gray">Sin plan</BaseBadge>

                  <span v-if="member?.identification" class="meta-chip">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0" />
                    </svg>
                    {{ member.identification }}
                  </span>
                  <span v-if="member?.phone" class="meta-chip">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {{ member.phone }}
                  </span>
                  <span v-if="member?.email" class="meta-chip">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {{ member.email }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Body scrollable -->
        <div class="detail-body">
          <div v-if="loading" class="py-16 text-center">
            <div class="inline-flex items-center gap-3 text-gray-500">
              <svg class="w-5 h-5 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Cargando detalle...
            </div>
          </div>

          <div v-else-if="!member" class="py-16 text-center text-danger-600 font-semibold">
            Cliente no encontrado.
          </div>

          <template v-else>
            <!-- Stats strip -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div class="stat-card">
                <div class="stat-icon bg-primary-100 text-primary-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Edad</p>
                  <p class="stat-value">{{ edad !== "—" ? `${edad} años` : "—" }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-success-100 text-success-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h8M4 14h8M4 18h16" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Estatura</p>
                  <p class="stat-value">{{ formatEstatura(member.estatura) }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon bg-success-100 text-success-700">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 3v3M18 3v3M3 9h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Peso</p>
                  <p class="stat-value">{{ member.peso ? `${member.peso} kg` : "—" }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" :class="imcIconCls">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">IMC</p>
                  <p class="stat-value">{{ imc }}</p>
                  <p v-if="imc !== '—'" class="text-[10px] font-semibold uppercase tracking-wider mt-0.5" :class="imcTextCls">
                    {{ clasificacionIMC }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Dos columnas -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div class="lg:col-span-2 space-y-5">
                <div class="detail-card">
                  <div class="section-header">
                    <span class="section-bar bg-primary-600" />
                    <h2 class="section-title text-primary-700">Información Personal</h2>
                  </div>
                  <dl class="info-grid">
                    <div class="info-item">
                      <dt class="info-label">Nombre</dt>
                      <dd class="info-val">{{ member.name }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Cédula / ID</dt>
                      <dd class="info-val">{{ member.identification || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Email</dt>
                      <dd class="info-val break-all">{{ member.email || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Teléfono</dt>
                      <dd class="info-val">{{ member.phone || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Fecha de nacimiento</dt>
                      <dd class="info-val">{{ member.birth_date || "—" }}</dd>
                    </div>
                    <div class="info-item">
                      <dt class="info-label">Sexo</dt>
                      <dd class="info-val capitalize">{{ member.sexo || "—" }}</dd>
                    </div>
                  </dl>
                </div>

                <div class="detail-card">
                  <div class="section-header">
                    <span class="section-bar bg-danger-500" />
                    <h2 class="section-title text-danger-600">Antecedentes Médicos</h2>
                  </div>
                  <div
                    v-if="member.medical_history"
                    class="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                  >
                    {{ member.medical_history }}
                  </div>
                  <p v-else class="text-sm italic text-gray-400">
                    No hay antecedentes médicos registrados.
                  </p>
                </div>
              </div>

              <div class="space-y-5">
                <div v-if="member.memberships?.length" class="detail-card">
                  <div class="section-header">
                    <span class="section-bar bg-primary-600" />
                    <h2 class="section-title text-primary-700">Membresía</h2>
                  </div>
                  <div class="bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100 rounded-xl p-4 mb-4">
                    <p class="text-[10px] font-semibold uppercase tracking-widest text-primary-700/70 mb-1">
                      Plan Actual
                    </p>
                    <p class="text-lg font-bold text-gray-900 capitalize">
                      {{ traducirFrecuencia(member.memberships[0].plan?.frequency) }}
                    </p>
                    <p class="text-2xl font-black text-primary-700 mt-1">
                      {{ formatPrice(member.memberships[0].plan?.price) }}
                    </p>
                  </div>
                  <div class="text-sm divide-y divide-gray-200">
                    <div class="flex items-center justify-between py-2.5">
                      <span class="info-label !mb-0">Estado</span>
                      <BaseBadge :color="statusColor(member.memberships[0].status)">
                        {{ traducirEstado(member.memberships[0].status) }}
                      </BaseBadge>
                    </div>
                    <div class="flex items-center justify-between py-2.5">
                      <span class="info-label !mb-0">Inicio</span>
                      <span class="info-val">{{ member.memberships[0].start_date }}</span>
                    </div>
                    <div class="flex items-center justify-between py-2.5">
                      <span class="info-label !mb-0">Fin</span>
                      <span class="info-val">{{ member.memberships[0].end_date }}</span>
                    </div>
                    <div v-if="diasRestantes !== null" class="flex items-center justify-between py-2.5">
                      <span class="info-label !mb-0">Días restantes</span>
                      <span class="font-bold text-sm" :class="diasRestantesCls">
                        {{ diasRestantes < 0 ? `Vencida hace ${Math.abs(diasRestantes)}d` : `${diasRestantes} días` }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-else class="detail-card text-center">
                  <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <p class="text-sm text-gray-500">Sin membresía asignada</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { BaseBadge } from "@/components/ui";

const props = defineProps({
  show: Boolean,
  memberId: { type: [Number, String], default: null },
});

const emit = defineEmits(["close"]);

const member = ref(null);
const loading = ref(false);

watch(
  () => [props.show, props.memberId],
  async ([show, id]) => {
    if (!show || !id) return;
    loading.value = true;
    member.value = null;
    try {
      const { data } = await api.get(`/members/${id}`);
      member.value = data;
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar el detalle del cliente.", "error");
      emit("close");
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

function close() {
  emit("close");
}

// ===== Computeds =====
const edad = computed(() => {
  if (!member.value?.birth_date) return "—";
  return dayjs().diff(dayjs(member.value.birth_date), "year");
});

const imc = computed(() => {
  const p = member.value?.peso;
  const e = member.value?.estatura;
  if (!p || !e) return "—";
  const pesoKg = parseFloat(p);
  let alturaMetros = parseFloat(e);
  if (alturaMetros > 3) alturaMetros /= 100;
  return (pesoKg / (alturaMetros * alturaMetros)).toFixed(2);
});

const clasificacionIMC = computed(() => clasificarIMC(imc.value));

const diasRestantes = computed(() => {
  const end = member.value?.memberships?.[0]?.end_date;
  if (!end) return null;
  return dayjs(end).diff(dayjs(), "day");
});

const diasRestantesCls = computed(() => {
  if (diasRestantes.value === null) return "";
  if (diasRestantes.value < 0) return "text-danger-600";
  if (diasRestantes.value <= 7) return "text-amber-600";
  return "text-success-700";
});

const imcIconCls = computed(() => {
  const cls = clasificacionIMC.value;
  if (cls === "Normal") return "bg-success-100 text-success-700";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "bg-amber-100 text-amber-700";
  if (cls.startsWith("Obesidad")) return "bg-danger-100 text-danger-600";
  return "bg-gray-100 text-gray-500";
});

const imcTextCls = computed(() => {
  const cls = clasificacionIMC.value;
  if (cls === "Normal") return "text-success-700";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "text-amber-700";
  if (cls.startsWith("Obesidad")) return "text-danger-600";
  return "text-gray-500";
});

// ===== Helpers =====
function formatEstatura(estatura) {
  if (!estatura) return "—";
  const metros = estatura > 3 ? (estatura / 100).toFixed(2) : estatura;
  return `${metros} m`;
}

function formatPrice(price) {
  if (price == null) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatearTelefono(numero) {
  if (!numero) return "";
  let limpio = numero.toString().replace(/\D/g, "");
  if (!limpio.startsWith("57")) limpio = "57" + limpio;
  return limpio;
}

function statusColor(status) {
  const map = {
    active: "green", expired: "red", inactive_unpaid: "yellow",
    cancelled: "gray", inactive: "gray", pending: "yellow",
  };
  return map[status] || "gray";
}

function clasificarIMC(v) {
  if (!v || v === "—" || isNaN(v)) return "—";
  const n = parseFloat(v);
  if (n < 18.5) return "Bajo peso";
  if (n < 25) return "Normal";
  if (n < 30) return "Sobrepeso";
  if (n < 35) return "Obesidad grado I";
  if (n < 40) return "Obesidad grado II";
  return "Obesidad grado III";
}

function traducirFrecuencia(f) {
  const map = { daily: "Diaria", weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual", quarterly: "Trimestral", yearly: "Anual" };
  return map[f] || f || "—";
}

function traducirEstado(estado) {
  const map = { active: "Activa", inactive: "Inactiva", cancelled: "Cancelada", expired: "Expirada", inactive_unpaid: "Sin pago", pending: "Pendiente" };
  return map[estado] || estado;
}
</script>

<style scoped>
.detail-overlay {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  overflow-y: auto;
}

.detail-panel {
  position: relative;
  width: 100%;
  max-width: 72rem;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid rgb(209 213 219);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3), 0 10px 20px -5px rgba(0,0,0,0.1);
  overflow: hidden;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.75rem;
}
@media (min-width: 640px) { .detail-body { padding: 0 2.5rem 2rem; } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-active .detail-panel, .modal-fade-leave-active .detail-panel { transition: transform 0.25s ease, opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .detail-panel, .modal-fade-leave-to .detail-panel { transform: translateY(8px) scale(0.98); opacity: 0; }

.btn-ghost-white {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.5rem 0.875rem; border-radius: 0.5rem;
  background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
  color: white; font-size: 0.75rem; font-weight: 700;
  border: 1px solid rgba(255,255,255,0.2); transition: all 0.15s;
}
.btn-ghost-white:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.35); }

.btn-icon-white {
  width: 2.25rem; height: 2.25rem; border-radius: 0.5rem;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.1); color: white;
  border: 1px solid rgba(255,255,255,0.15); transition: all 0.15s; cursor: pointer;
}
.btn-icon-white:hover { background: rgba(255,255,255,0.2); }

.meta-chip {
  display: inline-flex; align-items: center; gap: 0.25rem;
  font-size: 0.75rem; color: rgb(107 114 128);
}

.section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.section-bar { display: block; width: 4px; height: 1.25rem; border-radius: 9999px; }
.section-title { font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

.stat-card {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: white; border: 1px solid rgb(229 231 235);
  border-radius: 0.875rem; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.stat-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-label { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgb(107 114 128); }
.stat-value { font-size: 1.125rem; font-weight: 800; color: rgb(17 24 39); line-height: 1.2; }

.detail-card {
  background: white; border: 1px solid rgb(229 231 235);
  border-radius: 1rem; padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.info-label {
  display: block; font-size: 0.625rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: rgb(107 114 128); margin-bottom: 0.25rem;
}
.info-val { font-size: 0.875rem; font-weight: 600; color: rgb(17 24 39); }

/* Grid con líneas divisoras */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .info-grid { grid-template-columns: 1fr 1fr; column-gap: 1.5rem; }
}

.info-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgb(229 231 235);
}
.info-item:first-child { padding-top: 0.25rem; }

/* En desktop (2 cols): última fila completa sin borde */
@media (min-width: 640px) {
  .info-item:nth-last-child(1),
  .info-item:nth-last-child(2) { border-bottom: none; padding-bottom: 0.25rem; }
}
/* En móvil (1 col): sólo el último sin borde */
@media (max-width: 639px) {
  .info-item:last-child { border-bottom: none; padding-bottom: 0.25rem; }
}

/* Separadores entre chips del hero */
.divide-chips > * + *::before {
  content: "";
  display: inline-block;
  width: 1px;
  height: 0.75rem;
  background: rgb(209 213 219);
  margin-right: 0.75rem;
  vertical-align: middle;
}
</style>
