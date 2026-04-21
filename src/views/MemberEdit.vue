<template>
  <div class="register-overlay">
    <div class="register-panel">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100">
        <div class="flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight leading-tight">
              Editar Cliente
            </h1>
            <p class="text-xs text-gray-500 mt-0.5">
              Actualiza la información del cliente.
            </p>
          </div>
        </div>
        <router-link
          :to="{ name: 'Members' }"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </router-link>
      </div>

      <!-- Body scrollable -->
      <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
        <form id="edit-form" class="space-y-8" @submit.prevent="updateMember">
          <!-- ===== Información personal ===== -->
          <section>
            <div class="section-header">
              <span class="section-bar bg-primary-600" />
              <h2 class="section-title text-primary-700">Información Personal</h2>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <BaseInput
                v-model="form.name"
                label="Nombre Completo"
                type="text"
                placeholder="Ej. Juan Pérez"
                required
                :error="errors.name"
              />
              <BaseInput
                v-model="form.identification"
                label="Cédula / ID"
                type="text"
                placeholder="12345678"
                :error="errors.identification"
              />
              <BaseInput
                v-model="form.email"
                label="Email"
                type="email"
                placeholder="juan@ejemplo.com"
                :error="errors.email"
              />
              <BaseInput
                v-model="form.phone"
                label="Teléfono"
                type="tel"
                placeholder="+57 300 123 4567"
                :error="errors.phone"
              />
              <BaseInput
                v-model="form.birth_date"
                label="Fecha de Nacimiento"
                type="date"
                :error="errors.birth_date"
              />
              <BaseSelect
                v-model="form.sexo"
                label="Sexo"
                :options="sexoOptions"
                :error="errors.sexo"
              />
            </div>
          </section>

          <!-- ===== Biometría ===== -->
          <section class="p-5 sm:p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div class="section-header">
              <span class="section-bar bg-success-600" />
              <h2 class="section-title text-success-700">Biometría</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <BaseInput
                v-model.number="form.estatura"
                label="Estatura"
                type="number"
                step="0.01"
                min="0"
                placeholder="1.70"
                :error="errors.estatura"
              >
                <template #suffix>
                  <span class="text-xs font-semibold text-success-700">m</span>
                </template>
              </BaseInput>

              <BaseInput
                v-model.number="form.peso"
                label="Peso"
                type="number"
                step="0.1"
                min="0"
                placeholder="70.5"
                :error="errors.peso"
              >
                <template #suffix>
                  <span class="text-xs font-semibold text-success-700">kg</span>
                </template>
              </BaseInput>
            </div>
          </section>

          <!-- ===== Antecedentes médicos ===== -->
          <section>
            <div class="section-header">
              <span class="section-bar bg-danger-500" />
              <h2 class="section-title text-danger-600">Antecedentes Médicos</h2>
              <span class="ml-auto optional-tag">Opcional</span>
            </div>
            <textarea
              v-model="form.medical_history"
              rows="3"
              class="field-input resize-none"
              placeholder="Detalle alergias, lesiones previas o condiciones crónicas relevantes..."
            />
            <p v-if="errors.medical_history" class="text-xs text-red-600 mt-1">
              {{ errors.medical_history }}
            </p>
          </section>

          <!-- ===== Huella dactilar ===== -->
          <section class="pt-6 border-t border-gray-100">
            <div class="section-header">
              <span class="section-bar bg-primary-600" />
              <h2 class="section-title text-primary-700">Huella Dactilar</h2>
              <span class="ml-auto optional-tag">Opcional</span>
            </div>
            <div class="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4">
              <FingerprintEnroll
                :member-id="Number(memberId)"
                :has-fingerprint="memberHasFingerprint"
                @enrolled="memberHasFingerprint = true"
              />
            </div>
          </section>

          <div
            v-if="errorMessage"
            class="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {{ errorMessage }}
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="px-6 sm:px-8 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
        <BaseButton variant="secondary" @click="router.push({ name: 'Members' })">
          Cancelar
        </BaseButton>
        <BaseButton
          type="submit"
          form="edit-form"
          variant="primary"
          size="lg"
          :loading="loading"
          :disabled="loading"
        >
          Guardar Cambios
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/axios";
import Swal from "sweetalert2";
import FingerprintEnroll from "@/components/FingerprintEnroll.vue";
import { BaseInput, BaseSelect, BaseButton } from "@/components/ui";
import { SWAL_COLORS } from "@/lib/colors";

const route = useRoute();
const router = useRouter();
const memberId = route.params.id;

const sexoOptions = [
  { value: "masculino", label: "Masculino" },
  { value: "femenino", label: "Femenino" },
  { value: "no binario", label: "No binario" },
  { value: "otro", label: "Otro" },
];

const form = reactive({
  identification: "",
  name: "",
  birth_date: "",
  phone: "",
  email: "",
  peso: null,
  estatura: null,
  sexo: "masculino",
  medical_history: "",
});

const errors = ref({});
const errorMessage = ref("");
const loading = ref(false);
const memberHasFingerprint = ref(false);

const fetchMember = async () => {
  try {
    const { data } = await api.get(`/members/${memberId}`);
    Object.assign(form, {
      identification: data.identification ?? "",
      name: data.name ?? "",
      birth_date: data.birth_date ?? "",
      phone: data.phone ?? "",
      email: data.email ?? "",
      peso: data.peso ?? null,
      estatura: data.estatura ?? null,
      sexo: data.sexo || "masculino",
      medical_history: data.medical_history ?? "",
    });
    memberHasFingerprint.value = !!data.fingerprint_data;
  } catch {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo cargar la información del cliente.",
      confirmButtonColor: SWAL_COLORS.danger,
    }).then(() => router.push({ name: "Members" }));
  }
};

const updateMember = async () => {
  loading.value = true;
  errorMessage.value = "";
  errors.value = {};

  try {
    await api.put(`/members/${memberId}`, form);

    await Swal.fire({
      icon: "success",
      title: "¡Actualizado!",
      text: "Cliente actualizado correctamente.",
      timer: 1800,
      showConfirmButton: false,
      confirmButtonColor: SWAL_COLORS.success,
    });

    router.push({ name: "Members" });
  } catch (error) {
    if (error.response?.status === 422) {
      const backendErrors = error.response.data.errors || {};
      const mapped = {};
      for (const [field, msgs] of Object.entries(backendErrors)) {
        mapped[field] = Array.isArray(msgs) ? msgs[0] : String(msgs);
      }
      errors.value = mapped;
      errorMessage.value = "Verifica los datos resaltados e intenta nuevamente.";
    } else {
      errorMessage.value =
        error.response?.data?.message || "Error inesperado al actualizar el cliente.";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchMember);
</script>

<style scoped>
.register-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  overflow-y: auto;
}

.register-panel {
  width: 100%;
  max-width: 64rem;
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid rgb(229 231 235);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.section-bar {
  display: block;
  width: 4px;
  height: 1.25rem;
  border-radius: 9999px;
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.optional-tag {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgb(156 163 175);
}
</style>
