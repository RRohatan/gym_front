<template>
  <div class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
    <Sidebar />

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold mb-4 ml-12 sm:mb-0">👥 Clientes</h1>
      <div class="flex flex-wrap ml-24 gap-3">
        <router-link to="/Menu" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm">
          🏠 Inicio
        </router-link>
        <button @click="showRegisterModal = true" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm">
          ➕ Agregar Cliente
        </button>
      </div>
    </div>

    <div class="mb-6">
      <input v-model="busqueda" type="text" placeholder="🔍 Buscar por nombre o teléfono" class="w-full border px-4 py-2 rounded shadow-sm text-black" />
    </div>

    <div v-if="loading" class="text-gray-300">Cargando Clientes...</div>
    <div v-else>
      <div v-if="members.length === 0" class="text-gray-400">No hay Clientes registrados.</div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="member in miembrosFiltrados" :key="member.id"
     class="rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.01] duration-150"
     :class="member.is_expired ? 'bg-red-300 text-red-900 border border-red-200' : 'bg-white text-black'">
          <div class="p-4 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold">🧍 {{ member.name }}</h2>
              <p class="text-sm opacity-80">📞 {{ member.phone }}</p>
              <p class="text-sm opacity-80">🎂 {{ member.birth_date }}</p>
            </div>
            <button @click="toggleDetalle(member.id)" class="text-blue-600 hover:underline text-sm font-semibold bg-white/20 px-2 py-1 rounded">
              {{ detallesAbiertos.includes(member.id) ? "Ocultar" : "Ver más" }}
            </button>
          </div>

          <div v-if="detallesAbiertos.includes(member.id)" class="px-4 pb-4 text-sm space-y-2 border-t border-gray-200/20 pt-2">
            <p>🆔 {{ member.identification || "Sin cédula" }}</p>
            <p>📧 {{ member.email || "Sin email registrado" }}</p>
            <p>⚖️ Peso: {{ member.peso ?? "N/D" }} kg</p>
            <p>📏 Estatura: {{ member.estatura ?? "N/D" }} m</p>
            <p>🧬 Sexo: {{ member.sexo || "N/D" }}</p>
            <p>🩺 Antecedentes: {{ member.medical_history || "Ninguno" }}</p>

            <div class="pt-2 flex gap-2 flex-wrap">
              <router-link :to="{ name: 'MemberDetail', params: { id: member.id } }" class="btn-action bg-blue-600">
                Ver detalle
              </router-link>

              <a v-if="member.phone" :href="`https://wa.me/${formatearTelefono(member.phone)}`" target="_blank" class="btn-action bg-green-500">
                WhatsApp
              </a>

              <router-link :to="{ name: 'MemberEdit', params: { id: member.id } }" class="btn-action bg-yellow-500">
                Editar
              </router-link>

              <button @click="abrirAsignar(member)" class="btn-action bg-purple-600">
                Membresía
              </button>

              <button @click="abrirPagar(member)" class="btn-action bg-emerald-600">
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
import Swal from 'sweetalert2';

// Importar Componentes Hijos
import MemberRegisterModal from "@/components/members/MemberRegisterModal.vue"
import MemberAssignModal from "@/components/members/MemberAssignModal.vue"
import MemberPaymentModal from "@/components/members/MemberPaymentModal.vue"

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

// --- Lógica Principal ---
onMounted(() => {
  cargarMiembros();
  cargarPlanes();
});

const cargarMiembros = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/members");
    members.value = data;
  } catch (e) { console.error(e) }
  finally { loading.value = false }
};

const cargarPlanes = async () => {
  try {
    const { data } = await api.get("/membershipPlan");
    planes.value = data.map(plan => ({
      ...plan,
      name: `${plan.membership_type?.name || 'Plan'} - ${plan.frequency} ($${plan.price})`
    }));
  } catch (e) { console.error(e) }
};

// --- Manejadores de Eventos de Hijos ---

// Cuando se crea un cliente nuevo
const handleMemberSaved = async ({ client, hasPlan }) => {
  showRegisterModal.value = false;
  await cargarMiembros(); // Recargar lista

  if (hasPlan) {
    // Si asignó plan al registrar, preguntar por pago inmediato
    Swal.fire({
      title: 'Cliente Creado',
      text: "¿Deseas registrar el pago ahora?",
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Sí, Pagar',
      cancelButtonText: 'Luego'
    }).then((result) => {
      if (result.isConfirmed) {
        selectedMember.value = client;
        showPaymentModal.value = true;
      }
    });
  } else {
    Swal.fire('Éxito', 'Cliente registrado correctamente', 'success');
  }
}

// Cuando se asigna una membresía a un cliente existente
const handleMemberAssigned = (member) => {
  showAssignModal.value = false;
  Swal.fire({
      title: 'Membresía Asignada',
      text: "¿Deseas registrar el pago ahora?",
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Sí, Pagar',
      cancelButtonText: 'Luego'
  }).then((result) => {
    if (result.isConfirmed) {
      selectedMember.value = member;
      showPaymentModal.value = true;
    }
  });
}

// --- Utilidades ---
const toggleDetalle = (id) => {
  if (detallesAbiertos.value.includes(id)) detallesAbiertos.value = detallesAbiertos.value.filter(i => i !== id);
  else detallesAbiertos.value.push(id);
};

const abrirAsignar = (member) => {
  selectedMember.value = member;
  showAssignModal.value = true;
}

const abrirPagar = (member) => {
  selectedMember.value = member;
  showPaymentModal.value = true;
}

const miembrosFiltrados = computed(() => {
  const term = busqueda.value.toLowerCase();
  return members.value.filter(m =>
    m.name.toLowerCase().includes(term) || (m.phone || '').includes(term)
  );
});

function formatearTelefono(numero) {
  if (!numero) return "";
  let limpio = numero.toString().replace(/\D/g, "");
  if (!limpio.startsWith("57")) limpio = "57" + limpio;
  return limpio;
}
</script>

<style scoped>
.btn-action {
  @apply hover:opacity-90 text-white px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors;
}
</style>
