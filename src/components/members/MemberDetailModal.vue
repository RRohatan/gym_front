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
                
                Ficha del cliente
              </div>
              <div class="flex items-center gap-2">
                <router-link
                  v-if="member"
                  :to="{ name: 'MemberEdit', params: { id: member.id } }"
                  class="btn-ghost-white"
                  @click="close"
                >
                  
                  Editar
                </router-link>
                <a v-if="member?.phone" :href="`https://wa.me/${formatearTelefono(member.phone)}`" target="_blank" class="btn-ghost-white">
                  
                  WhatsApp
                </a>
                <button type="button" class="btn-icon-white" aria-label="Cerrar" @click="close">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <!-- Avatar overlap -->
          <div class="relative px-6 sm:px-10 -mt-14 pb-5">
            <div class="flex flex-col sm:flex-row sm:items-end gap-4">
              <div class="w-20 h-20 rounded-2xl bg-[var(--color-surface)] p-1 shadow-lg shrink-0">
                <div class="w-full h-full rounded-xl flex items-center justify-center text-2xl font-black text-white bg-gradient-to-br from-primary-500 to-indigo-600">
                  {{ (member?.name || "?").charAt(0).toUpperCase() }}
                </div>
              </div>
              <div class="flex-1 min-w-0 pb-1">
                <h1 class="text-xl sm:text-2xl font-bold text-default tracking-tight truncate">
                  {{ member?.name || "—" }}
                </h1>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-10 divide-chips">
                  <BaseBadge v-if="member?.memberships?.length" :color="statusColor(member.memberships[0].status)">
                    {{ traducirEstado(member.memberships[0].status) }}
                  </BaseBadge>
                  <BaseBadge v-else-if="member" color="gray">Sin plan</BaseBadge>

                  <span v-if="member?.identification" class="meta-chip">
                    
                    {{ member.identification }}
                  </span>
                  <span v-if="member?.phone" class="meta-chip">
                    
                    {{ member.phone }}
                  </span>
                  <span v-if="member?.email" class="meta-chip">
                    
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
            <div class="inline-flex items-center gap-3 text-muted">
              
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
                <div class="stat-icon stat-icon-primary">
                  
                </div>
                <div>
                  <p class="stat-label">Edad</p>
                  <p class="stat-value">{{ edad !== "—" ? `${edad} años` : "—" }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon-success">
                  
                </div>
                <div>
                  <p class="stat-label">Estatura</p>
                  <p class="stat-value">{{ formatEstatura(member.estatura) }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon stat-icon-success">
                  
                </div>
                <div>
                  <p class="stat-label">Peso</p>
                  <p class="stat-value">{{ member.peso ? `${member.peso} kg` : "—" }}</p>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon" :class="imcIconCls">
                  
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
                    <h2 class="section-title" style="color: var(--color-text-muted);">Información Personal</h2>
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
                    <h2 class="section-title" style="color: var(--color-text-muted);">Antecedentes Médicos</h2>
                  </div>
                  <div
                    v-if="member.medical_history"
                    class="bg-[var(--color-surface-soft)] border border-default-soft rounded-xl p-4 text-sm text-default whitespace-pre-wrap leading-relaxed"
                  >
                    {{ member.medical_history }}
                  </div>
                  <p v-else class="text-sm italic text-subtle">
                    No hay antecedentes médicos registrados.
                  </p>
                </div>
              </div>

              <div class="space-y-5">
                <div v-if="member.memberships?.length" class="detail-card">
                  <div class="section-header">
                    <span class="section-bar bg-primary-600" />
                    <h2 class="section-title" style="color: var(--color-text-muted);">Membresía</h2>
                  </div>
                  <div class="membership-plan-card">
                    <p class="text-[10px] font-semibold uppercase tracking-widest mb-1" style="color: var(--color-text-subtle);">
                      Plan Actual
                    </p>
                    <p class="text-lg font-bold capitalize" style="color: var(--color-text);">
                      {{ traducirFrecuencia(member.memberships[0].plan?.frequency) }}
                    </p>
                    <p class="text-2xl font-black mt-1" style="color: #60a5fa;">
                      {{ formatPrice(member.memberships[0].plan?.price) }}
                    </p>
                  </div>
                  <div class="text-sm divide-y" style="--tw-divide-opacity:1; border-color: var(--color-border);">
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
                  <div class="w-12 h-12 rounded-full bg-[var(--color-overlay)] flex items-center justify-center mx-auto mb-3">
                    
                  </div>
                  <p class="text-sm text-muted">Sin membresía asignada</p>
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
  if (cls === "Normal") return "stat-icon-success";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "stat-icon-warning";
  if (cls.startsWith("Obesidad")) return "stat-icon-danger";
  return "stat-icon-neutral";
});

const imcTextCls = computed(() => {
  const cls = clasificacionIMC.value;
  if (cls === "Normal") return "imc-text-success";
  if (cls === "Bajo peso" || cls === "Sobrepeso") return "imc-text-warning";
  if (cls.startsWith("Obesidad")) return "imc-text-danger";
  return "text-muted";
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
  background: var(--modal-backdrop);
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
  background: var(--modal-panel-bg);
  border: 1px solid var(--modal-panel-border);
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
  font-size: 0.75rem; color: var(--color-text-muted);
}

.section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
.section-bar { display: block; width: 4px; height: 1.25rem; border-radius: 9999px; }
.section-title { font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

.stat-card {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.875rem; box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.stat-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon-primary { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
.stat-icon-success { background: rgba(16, 185, 129, 0.12); color: #10b981; }
:global(.dark) .stat-icon-primary { background: rgba(99, 102, 241, 0.18); color: #a5b4fc; }
:global(.dark) .stat-icon-success { background: rgba(16, 185, 129, 0.18); color: #6ee7b7; }

.stat-label { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-subtle); }
.stat-value { font-size: 1.125rem; font-weight: 800; color: var(--color-text); line-height: 1.2; }

.detail-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem; padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
:global(.dark) .detail-card {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.10);
}
:global(.dark) .stat-card {
  background: var(--color-surface-muted);
  border-color: rgba(255, 255, 255, 0.10);
}

.membership-plan-card {
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.15);
}
:global(.dark) .membership-plan-card {
  background: rgba(99, 102, 241, 0.10);
  border-color: rgba(99, 102, 241, 0.25);
}

.info-label {
  display: block; font-size: 0.625rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--color-text-subtle); margin-bottom: 0.25rem;
}
.info-val { font-size: 0.875rem; font-weight: 600; color: var(--color-text); }

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
  border-bottom: 1px solid var(--color-border);
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
  background: var(--color-border);
  margin-right: 0.75rem;
  vertical-align: middle;
}

/* Additional stat-icon variants */
.stat-icon-warning { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.stat-icon-danger { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.stat-icon-neutral { background: var(--color-overlay); color: var(--color-text-muted); }
:global(.dark) .stat-icon-warning { background: rgba(245, 158, 11, 0.18); color: #fbbf24; }
:global(.dark) .stat-icon-danger { background: rgba(239, 68, 68, 0.18); color: #fca5a5; }

/* IMC text colors */
.imc-text-success { color: #10b981; }
.imc-text-warning { color: #f59e0b; }
.imc-text-danger { color: #ef4444; }
:global(.dark) .imc-text-success { color: #6ee7b7; }
:global(.dark) .imc-text-warning { color: #fbbf24; }
:global(.dark) .imc-text-danger { color: #fca5a5; }
</style>
