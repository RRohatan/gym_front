<template>
  <div class="page-layout">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-default tracking-tight">Clientes</h1>
          <p class="text-sm text-subtle mt-0.5">Gestión de clientes y membresías</p>
        </div>
        <div class="flex flex-wrap gap-2 w-full sm:w-auto">
          <router-link to="/Menu" class="btn btn-dark flex-1 sm:flex-none">Inicio</router-link>
          <button @click="showRegisterModal = true" class="btn btn-success flex-1 sm:flex-none">Nuevo cliente</button>
        </div>
      </div>

      <div class="mb-6">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          class="field-input"
        />
      </div>

    <div v-if="loading" class="text-subtle text-center mt-10">Cargando Clientes...</div>

    <div v-else>
      <div v-if="members.length === 0" class="text-subtle text-center mt-10">
        No hay Clientes registrados.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="member in miembrosPaginados"
          :key="member.id"
          class="relative rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg bg-[var(--color-surface)] text-default"
          :class="[
            'shadow-card',
            member.is_expired ? 'ring-2 ring-red-400/40' : 'ring-1 ring-[var(--color-border-soft)]',
          ]"
        >
          <!-- Barra de estado superior -->
          <div
            v-if="member.memberships?.[0]?.status === 'expired'"
            class="w-full text-center text-xs font-bold py-1 bg-red-400 text-white tracking-wide"
          >
            Membresía Vencida
          </div>
          <div
            v-else-if="member.memberships?.[0]?.status === 'inactive_unpaid'"
            class="w-full text-center text-xs font-bold py-1 bg-yellow-400 text-white tracking-wide"
          >
            Pendiente de Pago
          </div>

          <div class="p-4 flex justify-between items-center">
            <div>
              <h2 class="text-base font-bold text-default">{{ member.name }}</h2>
              <p class="text-sm text-muted mt-0.5">{{ member.phone || "Sin teléfono" }}</p>
              <p class="text-sm text-muted">{{ member.birth_date }}</p>
            </div>
            <button
              @click="toggleDetalle(member.id)"
              class="text-xs font-bold px-3 py-1 rounded-full border transition-all h-8 flex items-center select-none"
              :class="
                detallesAbiertos.includes(member.id)
                  ? 'detail-toggle-active'
                  : 'bg-[var(--color-overlay)] text-muted border-default-soft'
              "
            >
              {{ detallesAbiertos.includes(member.id) ? "Ocultar" : "Ver más" }}
            </button>
          </div>

          <div
            v-if="detallesAbiertos.includes(member.id)"
            class="px-4 pb-4 text-sm space-y-2 border-t border-default-soft pt-3 bg-[var(--color-surface-soft)]"
          >
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <p><span class="text-subtle">Cédula</span><br/><span class="font-medium">{{ member.identification || "—" }}</span></p>
              <p><span class="text-subtle">Email</span><br/><span class="font-medium">{{ member.email || "—" }}</span></p>
              <p><span class="text-subtle">Peso</span><br/><span class="font-medium">{{ member.peso ?? "—" }} kg</span></p>
              <p><span class="text-subtle">Altura</span><br/><span class="font-medium">{{ member.estatura ? (member.estatura > 3 ? (member.estatura/100).toFixed(2) : member.estatura) : "—" }} m</span></p>
              <p><span class="text-subtle">Sexo</span><br/><span class="font-medium">{{ member.sexo || "—" }}</span></p>
              <p><span class="text-subtle">Estado</span><br/>
                <span class="badge" :class="{
                  'badge-green':  member.memberships?.[0]?.status === 'active',
                  'badge-red':    member.memberships?.[0]?.status === 'expired',
                  'badge-yellow': member.memberships?.[0]?.status === 'pending',
                  'badge-gray':   !member.memberships?.length,
                }">{{ member.memberships?.length ? traducirEstado(member.memberships[0].status) : "Sin plan" }}</span>
              </p>
            </div>
            <p class="text-xs text-subtle italic mt-1">{{ member.medical_history || "Sin antecedentes médicos" }}</p>

            <div class="pt-3 flex flex-wrap items-center gap-1.5">
              <button
                class="action-btn action-primary"
                @click="abrirDetalle(member)"
              >
                
                Detalle
              </button>

              <a
                v-if="member.phone"
                :href="`https://wa.me/${formatearTelefono(member.phone)}`"
                target="_blank"
                class="action-btn action-success"
              >
                
                WhatsApp
              </a>

              <router-link
                :to="{ name: 'MemberEdit', params: { id: member.id } }"
                class="action-btn action-neutral"
              >
                
                Editar
              </router-link>

              <button
                class="action-btn"
                :class="member.memberships?.[0]?.status === 'expired' ? 'action-warning' : 'action-indigo'"
                @click="abrirAsignar(member)"
              >
                
                {{ member.memberships?.[0]?.status === "expired" ? "Renovar" : "Membresía" }}
              </button>

              <button class="action-btn action-success" @click="abrirPagar(member)">
                
                Pagar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalMiembrosPages > 1" class="flex items-center justify-between mt-6 text-sm text-muted">
        <span>Página {{ currentPageMiembros }} de {{ totalMiembrosPages }} ({{ miembrosFiltrados.length }} clientes)</span>
        <div class="flex gap-1">
          <button @click="currentPageMiembros--" :disabled="currentPageMiembros === 1"
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed">
            Anterior
          </button>
          <button @click="currentPageMiembros++" :disabled="currentPageMiembros === totalMiembrosPages"
            class="px-3 py-1 rounded border border-default-soft bg-[var(--color-surface)] hover:bg-[var(--color-surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed">
            Siguiente
          </button>
        </div>
      </div>
    </div>

    </div><!-- /max-w-7xl -->

    <MemberRegisterModal
      :show="showRegisterModal"
      :planes="planes"
      @close="showRegisterModal = false"
      @saved="handleMemberSaved"
    />

    <MemberAssignModal
      :show="showAssignModal"
      :member="selectedMember"
      :planes="planes"
      @close="showAssignModal = false"
      @assigned="handleMemberAssigned"
    />

    <MemberPaymentModal
      :show="showPaymentModal"
      :member="selectedMember"
      @close="showPaymentModal = false"
      @paid="cargarMiembros"
    />

    <MemberDetailModal
      :show="showDetailModal"
      :member-id="selectedDetailId"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

import api from "@/axios";
import Sidebar from "@/views/Sidebar.vue";
import Swal from "sweetalert2";

// Importar Componentes Hijos
import MemberRegisterModal from "@/components/members/MemberRegisterModal.vue";
import MemberAssignModal from "@/components/members/MemberAssignModal.vue";
import MemberPaymentModal from "@/components/members/MemberPaymentModal.vue";
import MemberDetailModal from "@/components/members/MemberDetailModal.vue";

// Estado Global
const members = ref([]);
const planes = ref([]);
const loading = ref(true);
const busqueda = ref("");
const detallesAbiertos = ref([]);
const selectedMember = ref(null);

// Estado de Modales
const showRegisterModal = ref(false);
const showAssignModal = ref(false);
const showPaymentModal = ref(false);
const showDetailModal = ref(false);
const selectedDetailId = ref(null);

onMounted(() => {
  cargarMiembros();
  cargarPlanes();
});

const cargarMiembros = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/members");
    members.value = data;
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los clientes.", "error");
  } finally {
    loading.value = false;
  }
};

const cargarPlanes = async () => {
  try {
    const { data } = await api.get("/membershipPlan");

    // Mapa de traducción
    const traduccion = {
      daily: "Diario",
      weekly: "Semanal",
      biweekly: "Quincenal",
      monthly: "Mensual",
    };

    planes.value = data.map((plan) => ({
      ...plan,
      // Creamos el nombre compuesto EN ESPAÑOL
      name: `${plan.membership_type?.name || "Plan"} - ${traduccion[plan.frequency] || plan.frequency} ($${parseInt(plan.price).toLocaleString()})`,
    }));
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudieron cargar los planes.", "error");
  }
};

// --- Manejadores de Eventos ---
const handleMemberSaved = async ({ client, hasPlan }) => {
  showRegisterModal.value = false;
  await cargarMiembros();
  if (hasPlan) {
    Swal.fire({
      title: "Cliente Creado",
      text: "¿Deseas registrar el pago ahora?",
      icon: "success",
      showCancelButton: true,
      confirmButtonText: "Sí, Pagar",
      cancelButtonText: "Luego",
    }).then((result) => {
      if (result.isConfirmed) {
        selectedMember.value = client;
        showPaymentModal.value = true;
      }
    });
  } else {
    Swal.fire("Éxito", "Cliente registrado correctamente", "success");
  }
};

const handleMemberAssigned = async (member) => {
  showAssignModal.value = false;
  await cargarMiembros(); // Recargar para actualizar el estado del cliente
  Swal.fire({
    title: "Membresía Asignada",
    text: "¿Deseas registrar el pago ahora?",
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "Sí, Pagar",
    cancelButtonText: "Luego",
  }).then((result) => {
    if (result.isConfirmed) {
      selectedMember.value = member;
      showPaymentModal.value = true;
    }
  });
};

// --- Utilidades ---
// Corregido con if/else para evitar el error de ESLint
const toggleDetalle = (id) => {
  if (detallesAbiertos.value.includes(id)) {
    detallesAbiertos.value = detallesAbiertos.value.filter((i) => i !== id);
  } else {
    detallesAbiertos.value.push(id);
  }
};

const abrirAsignar = (member) => {
  selectedMember.value = member;
  showAssignModal.value = true;
};

const abrirDetalle = (member) => {
  selectedDetailId.value = member.id;
  showDetailModal.value = true;
};

const abrirPagar = (member) => {
  selectedMember.value = member;
  showPaymentModal.value = true;
};

const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  return members.value.filter(
    (m) => m.name.toLowerCase().includes(term) || (m.phone || "").includes(term),
  );
});
const currentPageMiembros = ref(1);
const PER_PAGE = 10;
const totalMiembrosPages = computed(() => Math.ceil(miembrosFiltrados.value.length / PER_PAGE));
const miembrosPaginados = computed(() => {
  const start = (currentPageMiembros.value - 1) * PER_PAGE;
  return miembrosFiltrados.value.slice(start, start + PER_PAGE);
});
watch(busqueda, () => { currentPageMiembros.value = 1; });

function formatearTelefono(numero) {
  if (!numero) return "";
  let limpio = numero.toString().replace(/\D/g, "");
  if (!limpio.startsWith("57")) limpio = "57" + limpio;
  return limpio;
}

// ... código existente ...

const traducirEstado = (estado) => {
  const diccionario = {
    active: "Activa",
    expired: "Vencida",
    pending: "Pendiente",
    cancelled: "Cancelada",
  };
  // Si no encuentra la traducción, devuelve el estado original
  return diccionario[estado] || estado;
};
</script>

<style scoped>
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: all 0.15s;
  cursor: pointer;
  flex-shrink: 0;
}

.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.action-primary {
  background: rgb(37 99 235); color: white;
}
.action-primary:hover { background: rgb(29 78 216); }
.action-success {
  background: rgb(22 163 74); color: white;
}
.action-success:hover { background: rgb(21 128 61); }

/* Claro */
.action-neutral {
  background: rgb(243 244 246); color: rgb(55 65 81);
  border-color: rgb(229 231 235);
}
.action-neutral:hover { background: rgb(229 231 235); }

.action-indigo {
  background: rgb(238 242 255); color: rgb(67 56 202);
  border-color: rgb(199 210 254);
}
.action-indigo:hover { background: rgb(224 231 255); }

.action-warning {
  background: rgb(255 237 213); color: rgb(154 52 18);
  border-color: rgb(254 215 170);
}
.action-warning:hover { background: rgb(254 215 170); }

/* Modo oscuro */
:global(.dark) .action-neutral {
  background: rgba(255,255,255,0.07);
  color: rgba(148,163,184,0.9);
  border-color: rgba(255,255,255,0.12);
}
:global(.dark) .action-neutral:hover {
  background: rgba(255,255,255,0.12);
  color: #f1f5f9;
}

:global(.dark) .action-indigo {
  background: rgba(99,102,241,0.15);
  color: #c7d2fe;
  border-color: rgba(99,102,241,0.35);
}
:global(.dark) .action-indigo:hover {
  background: rgba(99,102,241,0.25);
  border-color: rgba(99,102,241,0.5);
}

:global(.dark) .action-warning {
  background: rgba(249,115,22,0.15);
  color: #fdba74;
  border-color: rgba(249,115,22,0.35);
}
:global(.dark) .action-warning:hover {
  background: rgba(249,115,22,0.25);
  border-color: rgba(249,115,22,0.5);
}

.detail-toggle-active {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.25);
}
:global(.dark) .detail-toggle-active {
  background: rgba(96, 165, 250, 0.15);
  color: #93c5fd;
  border-color: rgba(96, 165, 250, 0.30);
}
</style>
