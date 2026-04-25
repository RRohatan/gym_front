<template>
  <div class="page-layout">
    <div class="max-w-7xl mx-auto">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Clientes</h1>
          <p class="text-sm text-slate-400 mt-0.5">Gestión de clientes y membresías</p>
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

    <div v-if="loading" class="text-gray-400 text-center mt-10">Cargando Clientes...</div>

    <div v-else>
      <div v-if="members.length === 0" class="text-gray-400 text-center mt-10">
        No hay Clientes registrados.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="member in miembrosPaginados"
          :key="member.id"
          class="relative rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg bg-white text-black"
          :class="[
            'shadow-card',
            member.is_expired ? 'ring-2 ring-red-200' : 'ring-1 ring-gray-100/80',
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
              <h2 class="text-base font-bold text-gray-900">{{ member.name }}</h2>
              <p class="text-sm text-gray-500 mt-0.5">{{ member.phone || "Sin teléfono" }}</p>
              <p class="text-sm text-gray-500">{{ member.birth_date }}</p>
            </div>
            <button
              @click="toggleDetalle(member.id)"
              class="text-xs font-bold px-3 py-1 rounded-full border transition-all h-8 flex items-center select-none"
              :class="
                detallesAbiertos.includes(member.id)
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-gray-100 text-gray-600'
              "
            >
              {{ detallesAbiertos.includes(member.id) ? "Ocultar" : "Ver más" }}
            </button>
          </div>

          <div
            v-if="detallesAbiertos.includes(member.id)"
            class="px-4 pb-4 text-sm space-y-2 border-t border-gray-200/50 pt-3 bg-gray-50/50"
          >
            <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <p><span class="text-gray-400">Cédula</span><br/><span class="font-medium">{{ member.identification || "—" }}</span></p>
              <p><span class="text-gray-400">Email</span><br/><span class="font-medium">{{ member.email || "—" }}</span></p>
              <p><span class="text-gray-400">Peso</span><br/><span class="font-medium">{{ member.peso ?? "—" }} kg</span></p>
              <p><span class="text-gray-400">Altura</span><br/><span class="font-medium">{{ member.estatura ? (member.estatura > 3 ? (member.estatura/100).toFixed(2) : member.estatura) : "—" }} m</span></p>
              <p><span class="text-gray-400">Sexo</span><br/><span class="font-medium">{{ member.sexo || "—" }}</span></p>
              <p><span class="text-gray-400">Estado</span><br/>
                <span class="badge" :class="{
                  'badge-green':  member.memberships?.[0]?.status === 'active',
                  'badge-red':    member.memberships?.[0]?.status === 'expired',
                  'badge-yellow': member.memberships?.[0]?.status === 'pending',
                  'badge-gray':   !member.memberships?.length,
                }">{{ member.memberships?.length ? traducirEstado(member.memberships[0].status) : "Sin plan" }}</span>
              </p>
            </div>
            <p class="text-xs text-gray-400 italic mt-1">{{ member.medical_history || "Sin antecedentes médicos" }}</p>

            <div class="pt-3 flex gap-2 flex-wrap">
              <router-link
                :to="{ name: 'MemberDetail', params: { id: member.id } }"
                class="btn btn-primary btn-sm"
              >
                Ver detalle
              </router-link>

              <a
                v-if="member.phone"
                :href="`https://wa.me/${formatearTelefono(member.phone)}`"
                target="_blank"
                class="btn btn-success btn-sm"
              >
                WhatsApp
              </a>

              <router-link
                :to="{ name: 'MemberEdit', params: { id: member.id } }"
                class="btn btn-indigo btn-sm"
              >
                Editar
              </router-link>

              <button
                @click="abrirAsignar(member)"
                class="btn btn-sm"
                :class="member.memberships?.[0]?.status === 'expired' ? 'btn-orange' : 'btn-indigo'"
              >
                {{ member.memberships?.[0]?.status === "expired" ? "Renovar" : "Membresía" }}
              </button>

              <button @click="abrirPagar(member)" class="btn btn-success btn-sm">
                Pagar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalMiembrosPages > 1" class="flex items-center justify-between mt-6 text-sm text-gray-600">
        <span>Página {{ currentPageMiembros }} de {{ totalMiembrosPages }} ({{ miembrosFiltrados.length }} clientes)</span>
        <div class="flex gap-1">
          <button @click="currentPageMiembros--" :disabled="currentPageMiembros === 1"
            class="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Anterior
          </button>
          <button @click="currentPageMiembros++" :disabled="currentPageMiembros === totalMiembrosPages"
            class="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
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
