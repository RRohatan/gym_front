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

              <!-- Nuevo botón de Pagar (Solo si debe) -->
               <button
                @click="abrirModalPagoDirecto(member)"
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs"
              >
                💰 Pagar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Registro Cliente -->
    <div
      v-if="modalRegistro"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white text-black w-full max-w-lg p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]"
      >
        <h2 class="text-xl font-bold mb-4">Registrar nuevo cliente</h2>
        <form @submit.prevent="registrarMiembro">
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
          <div class="grid grid-cols-2 gap-2">
             <div>
                <label class="block mb-1 text-sm">Fecha nacimiento</label>
                <input
                    v-model="nuevoMiembro.birth_date"
                    type="date"
                    class="w-full mb-2 p-2 border rounded"
                />
             </div>
             <div>
                <label class="block mb-1 text-sm">Sexo</label>
                <select v-model="nuevoMiembro.sexo" class="w-full mb-2 p-2 border rounded">
                    <option disabled value="">Seleccione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="no binario">No binario</option>
                    <option value="otro">Otro</option>
                </select>
             </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block mb-1 text-sm">Estatura (m)</label>
                <input
                    v-model.number="nuevoMiembro.estatura"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej. 1.70"
                    class="w-full mb-2 p-2 border rounded"
                />
            </div>
            <div>
                <label class="block mb-1 text-sm">Peso (kg)</label>
                <input
                    v-model.number="nuevoMiembro.peso"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Ej. 70.5"
                    class="w-full mb-2 p-2 border rounded"
                />
            </div>
          </div>

          <label class="block mb-1 text-sm">Antecedentes médicos (Opcional)</label>
          <textarea
            v-model="nuevoMiembro.medical_history"
            rows="2"
            placeholder="Ej. Asma, diabetes..."
            class="w-full mb-4 p-2 border rounded"
          ></textarea>

          <!-- Asignación de Plan (Opcional) -->
          <div class="border-t pt-4 bg-gray-50 p-3 rounded mb-4">
            <label class="block mb-1 text-sm font-semibold text-blue-800">Asignar Plan Inicial (Opcional)</label>
            <p class="text-xs text-gray-500 mb-2">
              Se creará la membresía pendiente de pago.
            </p>
            <select v-model="nuevoMiembro.plan_id" class="w-full p-2 border rounded border-blue-200">
              <option value="">-- Solo registrar cliente --</option>
              <option v-for="plan in planes" :key="plan.id" :value="plan.id">
                {{ plan.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-3">
            <button type="button" @click="cerrarModalRegistro" class="text-gray-600 px-4 py-2">
              Cancelar
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Asignar Membresía (Existente) -->
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

    <!-- NUEVO: Modal de Pago Rápido -->
    <div
      v-if="modalPago"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white text-black w-full max-w-md p-6 rounded-lg shadow-2xl border-t-4 border-green-500">
        <h2 class="text-xl font-bold mb-2 text-gray-800">💰 Registrar Pago y Activar</h2>
        <p class="text-sm text-gray-600 mb-4">Cliente: <strong>{{ clientePago?.name }}</strong></p>

        <form @submit.prevent="procesarPago">
            <div class="mb-4 bg-gray-100 p-3 rounded">
                <p class="text-sm text-gray-500">Monto a pagar:</p>
                <p class="text-2xl font-bold text-green-700">
                    {{ formatCurrency(pagoForm.amount) }}
                </p>
            </div>

            <div class="mb-4">
                <label class="block mb-1 text-sm font-medium">Método de Pago</label>
                <select v-model="pagoForm.payment_method_id" class="w-full border rounded px-3 py-2" required>
                    <option value="" disabled>Seleccione...</option>
                    <option v-for="m in metodosPago" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
            </div>

            <div class="flex justify-end gap-3 mt-6">
                <button type="button" @click="cerrarModalPago" class="text-gray-600 px-4 py-2">
                    Cancelar
                </button>
                <button
                    type="submit"
                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-lg transform hover:scale-105 transition"
                    :disabled="procesandoPago"
                >
                    {{ procesandoPago ? 'Procesando...' : '✅ Confirmar Pago' }}
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
import Swal from 'sweetalert2';

const members = ref([]);
const planes = ref([]);
const metodosPago = ref([]); // Lista de métodos de pago
const loading = ref(true);
const busqueda = ref("");
const detallesAbiertos = ref([]);

// Modales
const modalRegistro = ref(false);
const modalMembresia = ref(false);
const modalPago = ref(false); // Nuevo modal

// Selecciones
const clienteSeleccionado = ref(null);
const clientePago = ref(null);

const procesandoPago = ref(false);

// Formularios
const nuevoMiembro = ref({
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
});

const nuevaMembresia = ref({ plan_id: "" });

const pagoForm = ref({
    member_id: "",
    amount: 0,
    payment_method_id: ""
});

// --- Métodos de Apertura/Cierre ---
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

// --- Lógica de Pago Rápido ---
const abrirModalPagoDirecto = async (cliente) => {
    // 1. Buscar si tiene deuda
    try {
        const {data: membership} = await api.get(`/memberships/by-member/${cliente.id}`);

        if (membership.outstanding_balance <= 0) {
            Swal.fire("Todo al día", "Este cliente no tiene pagos pendientes.", "info");
            return;
        }

        // 2. Preparar formulario
        clientePago.value = cliente;
        pagoForm.value = {
            member_id: cliente.id,
            amount: membership.outstanding_balance, // El monto exacto que debe
            payment_method_id: "" // Resetear método
        };

        // 3. Abrir modal
        modalPago.value = true;

    } catch (e) {
        if(e.response && e.response.status === 404){
             Swal.fire("Sin Membresía", "Este cliente no tiene una membresía asignada.", "warning");
        } else {
             Swal.fire("Error", "No se pudo consultar el saldo del cliente.", "error");
        }
    }
}

const cerrarModalPago = () => {
    modalPago.value = false;
    clientePago.value = null;
}

const procesarPago = async () => {
    procesandoPago.value = true;
    try {
        await api.post('/payments', {
            member_id: pagoForm.value.member_id,
            amount: pagoForm.value.amount,
            payment_method_id: pagoForm.value.payment_method_id
        });

        modalPago.value = false;

        // Recargar para actualizar estados
        await cargarMiembros();

        Swal.fire({
            title: '¡Pago Exitoso!',
            text: 'La membresía ha sido activada correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo registrar el pago.", "error");
    } finally {
        procesandoPago.value = false;
    }
}


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
    loading.value = true;
    const { data } = await api.get("/members");
    members.value = data;
  } catch (e) {
    console.error("Error al cargar miembros:", e);
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

const cargarMetodosPago = async () => {
    try {
        const { data } = await api.get('/payment_methods');
        metodosPago.value = data;
    } catch (e) {
        console.error("Error al cargar métodos de pago", e);
    }
}

// --- REGISTRO DE MIEMBRO MODIFICADO ---
const registrarMiembro = async () => {
  try {
    const { data: nuevoCliente } = await api.post("/members", nuevoMiembro.value);

    cerrarModalRegistro();
    await cargarMiembros();

    // Limpiar formulario
    const planSeleccionado = nuevoMiembro.value.plan_id; // Guardamos esto para saber si asignó plan
    nuevoMiembro.value = {
      name: "", identification: "", email: "", phone: "", birth_date: "",
      medical_history: "", sexo: "masculino", peso: null, estatura: null, plan_id: "",
    };

    // LÓGICA DE FLUJO: ¿Qué hacer ahora?
    if (planSeleccionado) {
        // Si asignó plan, preguntar si quiere pagar ya
        Swal.fire({
            title: 'Cliente Registrado',
            text: "Se creó la membresía pendiente. ¿Deseas registrar el pago ahora?",
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#10B981', // Verde
            cancelButtonColor: '#6B7280', // Gris
            confirmButtonText: 'Sí, Pagar y Activar',
            cancelButtonText: 'Luego'

            
        }).then((result) => {
            if (result.isConfirmed) {
                // Abrir modal de pago para este nuevo cliente
                abrirModalPagoDirecto(nuevoCliente);
            }
        });
    } else {
        // Registro simple
        Swal.fire('¡Listo!', 'Cliente registrado exitosamente.', 'success');
    }

  } catch (e) {
    console.error("Error al registrar miembro:", e);
    if (e.response && e.response.status === 422) {
      const errors = e.response.data.errors;
      let errorMsg = "Revise los campos: \n";
      if (errors.identification) errorMsg += "- ID ya registrada.\n";
      if (errors.email) errorMsg += "- Email ya registrado.\n";
      Swal.fire('Error de Validación', errorMsg, 'error');
    } else {
      Swal.fire('Error', 'No se pudo registrar el miembro.', 'error');
    }
  }
};

const guardarMembresia = async () => {
  try {
    const plan = planes.value.find((p) => p.id === nuevaMembresia.value.plan_id);
    if (!plan) return;

    // Payload solo con IDs, el backend maneja fechas y estado
    const payload = {
      member_id: clienteSeleccionado.value.id,
      plan_id: nuevaMembresia.value.plan_id,
    };

    await api.post("/memberships", payload);

    cerrarModalMembresia();
    await cargarMiembros();

    // Preguntar si quiere pagar
    Swal.fire({
        title: 'Membresía Asignada',
        text: "¿Deseas registrar el pago y activarla ahora?",
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, Pagar',
        cancelButtonText: 'Luego'
    }).then((result) => {
        if (result.isConfirmed) {
            abrirModalPagoDirecto(clienteSeleccionado.value);
        }
    });

  } catch (error) {
    console.error(error);
    Swal.fire('Error', error.response?.data?.error || "Error al asignar.", 'error');
  }
};

const traducirFrecuencia = (freq) => {
  const mapa = { daily: "Diario", weekly: "Semanal", biweekly: "Quincenal", monthly: "Mensual" };
  return mapa[freq] || freq;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val)
}

onMounted(() => {
  cargarMiembros();
  cargarPlanes();
  cargarMetodosPago(); // Importante cargar métodos de pago
});
</script>

