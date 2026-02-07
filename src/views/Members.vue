<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <Sidebar />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 class="text-2xl sm:text-3xl font-bold ml-12 sm:ml-0">👥 Clientes</h1>
      <div class="flex flex-wrap gap-3 ml-12 sm:ml-0">
        <router-link to="/Menu" class="btn btn-dark"> 🏠 Inicio </router-link>
        <button @click="showRegisterModal = true" class="btn btn-success">
          ➕ Agregar Cliente
        </button>
      </div>
    </div>

    <div class="mb-6">
      <input
        v-model="busqueda"
        type="text"
        placeholder="🔍 Buscar por nombre o teléfono..."
        class="w-full border px-4 py-3 rounded-xl shadow-sm text-black focus:ring-2 focus:ring-blue-500 outline-none text-base"
      />
    </div>

    <div v-if="loading" class="text-gray-300 text-center mt-10">Cargando Clientes...</div>

    <div v-else>
      <div v-if="members.length === 0" class="text-gray-400 text-center mt-10">
        No hay Clientes registrados.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="member in miembrosFiltrados"
          :key="member.id"
          class="rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.01] duration-150 bg-white text-black"
          :class="member.is_expired ? 'border-l-4 border-red-500 bg-red-50' : ''"
        >
          <div class="p-4 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold">🧍 {{ member.name }}</h2>
              <p class="text-sm opacity-80 text-gray-600">
                📞 {{ member.phone || "Sin teléfono" }}
              </p>
              <p class="text-sm opacity-80 text-gray-600">🎂 {{ member.birth_date }}</p>
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
            <p>
              <span class="font-bold">🆔 Cédula:</span> {{ member.identification || "Sin cédula" }}
            </p>
            <p><span class="font-bold">📧 Email:</span> {{ member.email || "Sin email" }}</p>
            <div class="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <p>⚖️ Peso: {{ member.peso ?? "--" }} kg</p>

              <p>
                📏 Altura:
                {{
                  member.estatura
                    ? member.estatura > 3
                      ? (member.estatura / 100).toFixed(2)
                      : member.estatura
                    : "--"
                }}
                m
              </p>

              <p>🧬 Sexo: {{ member.sexo || "--" }}</p>

              <p>
                📊 Estado:
                <span
                  :class="{
                    'text-green-600 font-bold': member.memberships?.[0]?.status === 'active',
                    'text-red-600 font-bold': member.memberships?.[0]?.status === 'expired',
                    'text-orange-500 font-bold': member.memberships?.[0]?.status === 'pending',
                    'text-gray-400': !member.memberships?.length,
                  }"
                >
                  {{
                    member.memberships?.length
                      ? traducirEstado(member.memberships[0].status)
                      : "Sin plan"
                  }}
                </span>
              </p>
            </div>
            <p class="text-xs text-gray-500 italic mt-1">
              🩺 {{ member.medical_history || "Sin antecedentes" }}
            </p>

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
                :class="
                  member.memberships?.[0]?.status === 'expired'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'btn-secondary text-purple-700 border-purple-200'
                "
              >
                {{ member.memberships?.[0]?.status === "expired" ? "🔄 Renovar" : "Membresía" }}
              </button>

              <button
                @click="abrirPagar(member)"
                class="btn btn-success btn-sm bg-emerald-600 border-emerald-600"
              >
                💰 Pagar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted } from "vue";
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
