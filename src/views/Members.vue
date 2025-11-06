<template>
  <div
    class="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
  >
    <Sidebar />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold mb-4 ml-12 sm:mb-0">👥 Clientes</h1>
      <div class="flex flex-wrap ml-24 gap-3">
        <router-link
          to="/Menu"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm"
        >
          🏠 Inicio
        </router-link>
        <button
          @click="abrirModalRegistro"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow text-sm"
        >
          ➕ Agregar Cliente
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="mb-6">
      <input
        v-model="busqueda"
        type="text"
        placeholder="🔍 Buscar por nombre o teléfono"
        class="w-full border px-4 py-2 rounded shadow-sm text-black"
      />
    </div>

    <!-- Lista de clientes -->
    <div v-if="loading" class="text-gray-300">Cargando Clientes...</div>
    <div v-else>
      <div v-if="members.length === 0" class="text-gray-400">No hay Clientes registrados.</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="member in miembrosFiltrados"
          :key="member.id"
          class="rounded-xl shadow-lg overflow-hidden transition hover:scale-[1.01] duration-150"
          :class="member.is_expired ? 'bg-red-500 text-white' : 'bg-white text-black'"
        >
          <div class="p-4 flex justify-between items-center">
            <div>
              <h2 class="text-lg font-bold">🧍 {{ member.name }}</h2>
              <p class="text-sm text-gray-600">📞 {{ member.phone }}</p>
              <p class="text-sm text-gray-600">🎂 {{ member.birth_date }}</p>
            </div>
            <button @click="toggleDetalle(member.id)" class="text-blue-600 hover:underline text-sm">
              {{ detallesAbiertos.includes(member.id) ? "Ocultar" : "Ver más" }}
            </button>
          </div>

          <!-- Detalle Expandible -->
          <div
            v-if="detallesAbiertos.includes(member.id)"
            class="px-4 pb-4 text-sm text-gray-700 space-y-2"
          >
            <p>🆔 {{ member.identification || "Sin cédula" }}</p>
            <p>📧 {{ member.email || "Sin email registrado" }}</p>
            <p>⚖️ Peso: {{ member.peso ?? "N/D" }} kg</p>
            <p>📏 Estatura: {{ member.estatura ?? "N/D" }} m</p>
            <p>🧬 Sexo: {{ member.sexo || "N/D" }}</p>
            <p>🩺 Antecedentes: {{ member.medical_history || "Ninguno" }}</p>

            <!-- Acciones -->
            <div class="pt-2 flex gap-3 flex-wrap">
              <router-link
                :to="{ name: 'MemberDetail', params: { id: member.id } }"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
              >
                Ver detalle
              </router-link>
              <a
                :href="`https://wa.me/${formatearTelefono(member.phone)}`"
                target="_blank"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                v-if="member.phone"
              >
                WhatsApp
              </a>
              <router-link
                :to="{ name: 'MemberEdit', params: { id: member.id } }"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
              >
                Editar
              </router-link>
              <button
                @click="abrirModalMembresia(member)"
                class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
              >
                Asignar membresía
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Registro Cliente (MODIFICADO) -->
    <div
      v-if="modalRegistro"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]"
      >
        <h2 class="text-xl font-bold mb-4">Registrar nuevo cliente</h2>
        <form @submit.prevent="registrarMiembro">

          <!-- Datos Personales -->
          <input
            v-model="nuevoMiembro.name"
            type="text"
            required
            placeholder="Nombre"
            class="w-full mb-2 p-2 border rounded"
          />
          <input
            v-model="nuevoMiembro.identification"
            type="text"
            required
            placeholder="Identificación (Cédula)"
            class="w-full mb-2 p-2 border rounded"
          />
          <input
            v-model="nuevoMiembro.email"
            type="email"
            placeholder="Email (Opcional)"
            class="w-full mb-2 p-2 border rounded"
          />
          <input
            v-model="nuevoMiembro.phone"
            type="text"
            placeholder="Teléfono (Opcional)"
            class="w-full mb-2 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Fecha de nacimiento</label>
          <input
            v-model="nuevoMiembro.birth_date"
            type="date"
            class="w-full mb-4 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Sexo</label>
          <select v-model="nuevoMiembro.sexo" class="w-full mb-2 p-2 border rounded">
            <option disabled value="">Seleccione una opción</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="no binario">No binario</option>
            <option value="prefiere no decirlo">Prefiere no decirlo</option>
            <option value="otro">Otro</option>
          </select>

          <!-- Datos Físicos -->
          <label class="block mb-1 text-sm">Estatura (m) (Opcional)</label>
          <input
            v-model.number="nuevoMiembro.estatura"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej. 1.70"
            class="w-full mb-2 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Peso (kg) (Opcional)</label>
          <input
            v-model.number="nuevoMiembro.peso"
            type="number"
            step="0.1"
            min="0"
            placeholder="Ej. 70.5"
            class="w-full mb-2 p-2 border rounded"
          />
          <label class="block mb-1 text-sm">Antecedentes médicos (Opcional)</label>
          <textarea
            v-model="nuevoMiembro.medical_history"
            rows="3"
            placeholder="Ej. Asma, diabetes..."
            class="w-full mb-4 p-2 border rounded"
          ></textarea>

          <!-- ===== INICIO DE CAMBIO ===== -->
          <!-- Asignación de Plan (Opcional) -->
          <div class="border-t pt-4">
            <label class="block mb-1 text-sm font-semibold">Asignar Plan (Opcional)</label>
            <p class="text-xs text-gray-500 mb-2">
              Si seleccionas un plan, se creará una membresía inactiva.
              Deberás registrar el pago en la sección de Pagos para activarla.
            </p>
            <select v-model="nuevoMiembro.plan_id" class="w-full mb-4 p-2 border rounded">
              <option value="">-- No asignar plan por ahora --</option>
              <option v-for="plan in planes" :key="plan.id" :value="plan.id">
                {{ plan.name }}
              </option>
            </select>
          </div>
          <!-- ===== FIN DE CAMBIO ===== -->

          <div class="flex justify-end gap-3">
            <button type="button" @click="cerrarModalRegistro" class="text-gray-600 px-4 py-2">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Asignar Membresía (SIN CAMBIOS) -->
    <div
      v-if="modalMembresia"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white text-black w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-bold mb-4">Asignar membresía a {{ clienteSeleccionado?.name }}</h2>
        <form @submit.prevent="guardarMembresia">
          <label class="block mb-1 text-sm">Plan</label>
          <select v-model="nuevaMembresia.plan_id" class="w-full border rounded px-3 py-2" required>
            <option disabled value="">Seleccione un plan</option>
            <option v-for="plan in planes" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>

          <div class="flex justify-end gap-3 mt-4">
            <button type="button" @click="cerrarModalMembresia" class="text-gray-600 px-4 py-2">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Asignar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/axios";
import Sidebar from "@/views/Sidebar.vue";
import dayjs from 'dayjs'
import Swal from 'sweetalert2'; // Importar SweetAlert

const members = ref([]);
const planes = ref([]);
const loading = ref(true);
const busqueda = ref("");
const detallesAbiertos = ref([]);

const modalRegistro = ref(false);
const modalMembresia = ref(false);
const clienteSeleccionado = ref(null);

// Objeto para el formulario de nuevo miembro (MODIFICADO)
const nuevoMiembro = ref({
  name: "",
  identification: "",
  email: "",
  phone: "",
  birth_date: "",
  medical_history: "",
  sexo: "masculino", // Valor por defecto
  peso: null,
  estatura: null,
  plan_id: "", // <-- CAMPO AÑADIDO para el plan opcional
});

// Objeto para el modal de asignar membresía
const nuevaMembresia = ref({
  plan_id: "",
});

const abrirModalRegistro = () => (modalRegistro.value = true);
const cerrarModalRegistro = () => (modalRegistro.value = false);

const abrirModalMembresia = (cliente) => {
  clienteSeleccionado.value = cliente;
  modalMembresia.value = true;
};

const cerrarModalMembresia = () => {
  modalMembresia.value = false;
  nuevaMembresia.value = { plan_id: "" };
};

const toggleDetalle = (id) => {
  if (detallesAbiertos.value.includes(id)) {
    detallesAbiertos.value = detallesAbiertos.value.filter((i) => i !== id);
  } else {
    detallesAbiertos.value.push(id);
  }
};

const miembrosFiltrados = computed(() => {
  return members.value.filter(
    (member) =>
      member.name.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      (member.phone || '').toLowerCase().includes(busqueda.value.toLowerCase())
  );
});

function formatearTelefono(numero) {
  if (!numero) return "";
  let limpio = numero.toString().replace(/\D/g, "");
  if (!limpio.startsWith("57")) limpio = "57" + limpio;
  return limpio;
}

const cargarMiembros = async () => {
  try {
    loading.value = true; // Poner loading al inicio
    const { data } = await api.get("/members");
    members.value = data;
  } catch (e) {
    console.error("Error al cargar miembros:", e);
    Swal.fire('Error', 'No se pudieron cargar los miembros.', 'error');
  } finally {
    loading.value = false;
  }
};

const cargarPlanes = async () => {
  try {
    const { data } = await api.get("/membershipPlan");
    planes.value = data.map(plan => ({
      ...plan,
      name: `${plan.membership_type?.name || 'Plan'} - ${traducirFrecuencia(plan.frequency)} (${formatCurrency(plan.price)})`
    }));
  } catch (e) {
    console.error("Error al cargar planes:", e);
  }
};

// --- FUNCIÓN DE REGISTRO MODIFICADA ---
const registrarMiembro = async () => {
  try {
    // El objeto 'nuevoMiembro' ahora incluye 'plan_id' (puede estar vacío)
    await api.post("/members", nuevoMiembro.value);

    cerrarModalRegistro();
    await cargarMiembros(); // Recarga la lista de miembros

    // Limpiar formulario
    nuevoMiembro.value = {
      name: "",
      identification: "",
      email: "",
      phone: "",
      birth_date: "",
      medical_history: "",
      sexo: "masculino",
      peso: null,
      estatura: null,
      plan_id: "",
    };

    // Notificar al admin que el pago está pendiente (si asignó plan)
    if (nuevoMiembro.value.plan_id) {
      Swal.fire(
        '¡Cliente Registrado!',
        'La membresía se creó como "Inactiva". Por favor, registre el pago para activarla.',
        'success'
      );
    } else {
      Swal.fire(
        '¡Cliente Registrado!',
        'El cliente se guardó correctamente.',
        'success'
      );
    }

  } catch (e) {
    console.error("Error al registrar miembro:", e);
    if (e.response && e.response.status === 422) {
      // Manejo de errores de validación
      const errors = e.response.data.errors;
      let errorMsg = "Por favor revise los campos: \n";
      if (errors.identification) errorMsg += "- La identificación ya está registrada.\n";
      if (errors.email) errorMsg += "- El email ya está registrado.\n";
      Swal.fire('Error de Validación', errorMsg, 'error');
    } else {
      Swal.fire('Error', 'No se pudo registrar el miembro.', 'error');
    }
  }
};

// --- FUNCIÓN PARA ASIGNAR MEMBRESÍA (Modal separado) ---
const guardarMembresia = async () => {
  try {
    const plan = planes.value.find((p) => p.id === nuevaMembresia.value.plan_id);
    if (!plan) {
      Swal.fire("Error", "Plan no encontrado", "error");
      return;
    }

    // El backend (MembershipController@store) se encarga de las fechas
    // y de poner el estado 'inactive_unpaid'
    const payload = {
      member_id: clienteSeleccionado.value.id,
      plan_id: nuevaMembresia.value.plan_id,
    };

    await api.post("/memberships", payload);

    cerrarModalMembresia();
    await cargarMiembros(); // Recargar miembros para actualizar estado 'is_expired'

    Swal.fire(
      'Membresía Asignada',
      'La membresía se creó como "Inactiva". Registre el pago para activarla.',
      'success'
    );

  } catch (error) {
    console.error("Error al asignar membresía:", error);
    Swal.fire(
      'Error',
      error.response?.data?.error || "Error al asignar la membresía.",
      'error'
    );
  }
};

// --- Funciones Auxiliares (Traducción y Formato) ---
const traducirFrecuencia = (freq) => {
  const mapa = {
    daily: "Diario",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
  };
  return mapa[freq] || freq;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}

onMounted(() => {
  cargarMiembros();
  cargarPlanes();
});
</script>

<style>
@keyframes blink {
  50% {
    opacity: 0.8;
  }
}
</style>
