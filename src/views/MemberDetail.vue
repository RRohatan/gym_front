<template>
  <div class="page-layout">
    <div class="max-w-3xl mx-auto">
      <BaseCard title="Detalle del cliente" class="space-y-6">
        <template #actions>
          <router-link to="/members" class="btn btn-secondary">
            Volver a Clientes
          </router-link>
        </template>

        <p v-if="loading" class="text-gray-500">Cargando datos del cliente...</p>

        <p v-else-if="!member" class="text-danger-600">Cliente no encontrado.</p>

        <template v-else>
          <section>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Información básica</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><span class="font-semibold">Nombre:</span> {{ member.name }}</p>
              <p><span class="font-semibold">Email:</span> {{ member.email || "—" }}</p>
              <p><span class="font-semibold">Teléfono:</span> {{ member.phone || "—" }}</p>
              <p>
                <span class="font-semibold">Fecha de nacimiento:</span>
                {{ member.birth_date || "—" }}
              </p>
            </div>
          </section>

          <section class="text-gray-700 space-y-1">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Información Física</h3>
            <p><span class="font-semibold">Edad:</span> {{ calcularEdad(member.birth_date) }} años</p>
            <p><span class="font-semibold">Sexo:</span> {{ member.sexo || "—" }}</p>
            <p>
              <span class="font-semibold">Estatura:</span>
              {{ formatEstatura(member.estatura) }}
            </p>
            <p>
              <span class="font-semibold">Peso:</span>
              {{ member.peso ? `${member.peso} kg` : "—" }}
            </p>
            <p>
              <span class="font-semibold">IMC:</span>
              {{ calcularIMC(member.peso, member.estatura) }}
            </p>
            <p>
              <span class="font-semibold">Clasificación según la OMS:</span>
              {{ clasificarIMC(calcularIMC(member.peso, member.estatura)) }}
            </p>
          </section>

          <section>
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Antecedentes médicos</h3>
            <div class="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
              {{ member.medical_history || "No hay antecedentes médicos registrados." }}
            </div>
          </section>

          <section v-if="member.memberships?.length">
            <h3 class="text-xl font-semibold text-gray-800 mb-2">Membresía Activa</h3>
            <div class="p-4 bg-primary-50 rounded-lg space-y-2 text-sm">
              <p>
                <span class="font-semibold">Plan:</span>
                {{ traducirFrecuencia(member.memberships[0].plan?.frequency) }}
              </p>
              <p class="flex items-center gap-2">
                <span class="font-semibold">Estado:</span>
                <BaseBadge :color="statusColor(member.memberships[0].status)">
                  {{ traducirEstado(member.memberships[0].status) }}
                </BaseBadge>
              </p>
              <p>
                <span class="font-semibold">Inicio:</span>
                {{ member.memberships[0].start_date }}
              </p>
              <p>
                <span class="font-semibold">Fin:</span>
                {{ member.memberships[0].end_date }}
              </p>
              <p>
                <span class="font-semibold">Precio:</span>
                {{ member.memberships[0].plan?.price }} COP
              </p>
            </div>
          </section>
        </template>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { BaseCard, BaseBadge } from "@/components/ui";

const route = useRoute();
const member = ref(null);
const loading = ref(true);

onMounted(async () => {
  const memberId = route.params.id;

  try {
    const response = await api.get(`/members/${memberId}`);
    member.value = response.data;
  } catch (error) {
    console.error("Error al obtener el detalle del miembro:", error);
    Swal.fire("Error", "No se pudo cargar el detalle del miembro.", "error");
  } finally {
    loading.value = false;
  }
});

const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return "—";
  return dayjs().diff(dayjs(fechaNacimiento), "year");
};

const formatEstatura = (estatura) => {
  if (!estatura) return "—";
  // Si viene en cm (>3) la convertimos a metros.
  const metros = estatura > 3 ? (estatura / 100).toFixed(2) : estatura;
  return `${metros} m`;
};

const statusColor = (status) => {
  const map = {
    active: "green",
    expired: "red",
    inactive_unpaid: "yellow",
    cancelled: "gray",
    inactive: "gray",
  };
  return map[status] || "gray";
};

const calcularIMC = (peso, estatura) => {
  // 1. Validamos que existan datos
  if (!peso || !estatura) return "—";

  // 2. Aseguramos que sean números (por si vienen como texto de la BD)
  const pesoKg = parseFloat(peso);
  let alturaMetros = parseFloat(estatura);

  // 3. DETECTOR DE ERRORES:
  // Si la altura es mayor a 3 (nadie mide 3 metros), asumimos que son CM y lo dividimos por 100
  if (alturaMetros > 3) {
    alturaMetros = alturaMetros / 100;
  }

  // 4. Calculamos ahora sí con metros
  const imc = pesoKg / (alturaMetros * alturaMetros);

  return imc.toFixed(2);
};

const clasificarIMC = (imc) => {
  if (!imc || isNaN(imc)) return "—";
  if (imc < 18.5) return "Bajo peso";
  if (imc < 25) return "Normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidad grado I";
  if (imc < 40) return "Obesidad grado II";
  return "Obesidad grado III (mórbida)";
};

const traducirFrecuencia = (f) => {
  switch (f) {
    case "daily":
      return "Diaria";
    case "weekly":
      return "Semanal";
    case "biweekly":
      return "Quincenal";
    case "monthly":
      return "Mensual";
    default:
      return f;
  }
};

const traducirEstado = (estado) => {
  switch (estado) {
    case "active":
      return "Activa";
    case "inactive":
      return "Inactiva";
    case "cancelled":
      return "Cancelada";
    case "expired":
      return "Expirada";
    default:
      return estado;
  }
};
</script>
