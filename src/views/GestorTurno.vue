<template>
  <Teleport to="body">
    <div v-if="alertaVisible" role="alert" class="alert" :class="alertaTipo === 'error' ? 'alert-error' : 'alert-success'">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path v-if="alertaTipo === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ alertaMensaje }}</span>
    </div>
  </Teleport>

  <div v-if="mostrar" class="gestor-wrapper">

    <!-- ABRIR TURNO -->
    <transition name="panel-fade" mode="out-in">
      <div v-if="!turno" key="abrir" class="turno-card">

        <div class="card-icon-header">
          <div class="icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
          </svg>
          </div>
          <div>
            <h2 class="card-title">Control de Turno</h2>
            <p class="card-subtitle">Sin turno abierto</p>
          </div>
          
          <button class="close-tab-btn" @click="$emit('cerrar')">
            <X :size="15" />
          </button>
        </div>

        <div class="divider" />

        <div class="field-group">
          <label class="field-label">Efectivo Inicial</label>
          <div class="input-wrap">
            <span class="input-prefix">$</span>
            <input
              v-model="montoInicial"
              type="number"
              placeholder="0.00"
              class="field-input"
              @keydown="bloquearTeclas"
            />
          </div>
        </div>

        <div class="btn-group">
          <button class="btn-confirmar" @click="confirmar">
            Abrir Turno
          </button>
        </div>

      </div>

      <!-- CERRAR TURNO -->
      <div v-else key="cerrar" class="turno-card">

        <div class="card-icon-header">
          <div class="icon-wrap icon-wrap--active">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <h2 class="card-title">Cierre de Turno</h2>
            <p class="card-subtitle">Ingresa los importes declarados</p>
          </div>

          <button class="close-tab-btn" @click="$emit('cerrar')">
            <X :size="15" />
          </button>
        </div>

        <div class="divider" />

        <div class="field-row" v-for="(item, index) in caja" :key="index">
          <label class="field-label-row">{{ item.descripcion }}</label>
          <div class="input-wrap">
            <span class="input-prefix">$</span>
            <input
              type="number"
              v-model.number="item.importe"
              placeholder="0.00"
              class="field-input"
              @keydown="bloquearTeclas"
            />
          </div>
        </div>

        <div class="btn-group">
          <button class="btn-cerrar" @click="confirmarCierre">
            Cerrar Turno
          </button>
        </div>

      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "@/supabase/supabase";
import { userLogin, turno, obtenerTurno, idTurno, numPedidos } from "@/store/auth.js";
import { X } from "lucide-vue-next";

// ── Props & emits ──────────────────────────────────────────────
const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "turnoAbierto", "turnoCerrado"]);

// ── Alerta ─────────────────────────────────────────────────────
const alertaVisible = ref(false);
const alertaTipo    = ref("error");
const alertaMensaje = ref("");

const mostrarAlerta = (mensaje, tipo = "error") => {
  alertaMensaje.value = mensaje;
  alertaTipo.value    = tipo;
  alertaVisible.value = true;
  setTimeout(() => { alertaVisible.value = false; }, 3000);
};

// ── Bloquear teclas inválidas ──────────────────────────────────
function bloquearTeclas(event) {
  if (["e", "E", "+", "-"].includes(event.key)) {
    event.preventDefault();
  }
}

// ── Estado abrir turno ─────────────────────────────────────────
const montoInicial = ref(null);

const now   = new Date();
const fecha = ref(now.toISOString().split("T")[0]);
const hora  = ref(now.toTimeString().split(" ")[0]);

const confirmar = async () => {
  await obtenerTurno();
  if (turno.value) return;

  if (montoInicial.value === null || montoInicial.value === '') {
    mostrarAlerta("Ingresa el efectivo inicial");
    return;
  }

  const { error } = await supabase.from("turnos").insert([{
    idusuario:    userLogin.value,
    fecha:        fecha.value,
    horaapertura: hora.value,
    montoinicial: montoInicial.value,
  }]);

  if (error) {
    console.error("Error:", error.message);
    mostrarAlerta("Error al abrir el turno, intenta de nuevo");
    return;
  }

  await obtenerTurno();
  turno.value      = true;
  numPedidos.value = 1;
  mostrarAlerta("¡Turno abierto correctamente!", "success");
  setTimeout(() => {
    emit("turnoAbierto");
    emit("cerrar");
  }, 1000);
};

// ── Estado cerrar turno ────────────────────────────────────────
const caja = ref([
  { clave: "EF", descripcion: "Efectivo",     importe: null },
  { clave: "TJ", descripcion: "Tarjeta",       importe: null },
  { clave: "TR", descripcion: "Transferencia", importe: null },
]);

const confirmarCierre = async () => {
  if (caja.value.some(i => i.importe === null || i.importe === '')) {
    mostrarAlerta("Rellena todos los campos");
    return;
  }

    const { data: notasAbiertas, error: errorNotas } = await supabase
      .from("pedidos")
      .select("idpedido")
      .eq("idturno", idTurno.value)
      .eq("abierto", true)
      .eq("eliminado", false);

    if (errorNotas) {
      console.error("Error al verificar notas abiertas", errorNotas);
      mostrarAlerta("Error al verificar notas pendientes");
      return;
    }

    if (notasAbiertas.length > 0) {
      mostrarAlerta(`Hay ${notasAbiertas.length} nota(s) sin cerrar`);
      return;
    }

  const horaIso = new Date().toISOString().split("T")[1].split(".")[0];

  const { error } = await supabase
    .from("turnos")
    .update({
      horacierre:    horaIso,
      efectivoFinal: caja.value[0].importe,
      tarjetasFinal: caja.value[1].importe,
      transferFinal: caja.value[2].importe,
    })
    .eq("idturno", idTurno.value);

  if (error) {
    console.error("Error al guardar cierre:", error);
    mostrarAlerta("Error al cerrar el turno, intenta de nuevo");
    return;
  }

  turno.value   = false;
  idTurno.value = null;
  mostrarAlerta("¡Turno cerrado correctamente!", "success");
  setTimeout(() => {
    emit("turnoCerrado");
    emit("cerrar");
  }, 1000);
};
</script>

<style scoped>
.alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  animation: fadeIn 0.3s ease;
}
.alert-error   { background: #ffe5e5; color: #c0392b; border: 1px solid #e74c3c; }
.alert-success { background: #e6fff0; color: #1e8449;  border: 1px solid #2ecc71; }
@keyframes fadeIn {
  from { opacity: 0; top: 10px; }
  to   { opacity: 1; top: 20px; }
}

.gestor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.turno-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 36px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-icon-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #63e490;
  background-color: #cfffe0;
  flex-shrink: 0;
}

.icon-wrap--active {
  background: #ffdcdc;
  color: #c56a6a;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.card-subtitle {
  font-size: 13px;
  color: #999;
  margin: 2px 0 0;
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 -4px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e2e2;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.input-wrap:focus-within {
  border-color: #3cd677;
}

.input-prefix {
  padding: 12px;
  font-size: 15px;
  color: #aaa;
  background: #fafafa;
  border-right: 1.5px solid #e2e2e2;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
}

.field-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 14px;
  font-size: 15px;
  color: #1a1a1a;
  background: transparent;
}

.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.tabla-cierre {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.tabla-cierre th {
  text-align: left;
  padding: 8px 10px;
  background: #f7f7f7;
  color: #888;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.tabla-cierre td {
  padding: 8px 10px;
  border-bottom: 1px solid #f2f2f2;
  color: #333;
}

.td-clave {
  font-weight: 600;
  color: #666;
  width: 60px;
}

.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.btn-confirmar,
.btn-cerrar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-confirmar {
  flex: 1;
  background: #48e180;
  color: #fff;
}

.btn-confirmar:hover {
  background: #31b05f;
  transform: translateY(-1px);
}

.btn-cerrar {
  flex: 1;
  background: #ed6c6c;
  color: #fff;
}

.btn-cerrar:hover {
  background: #df4848;
  transform: translateY(-1px);
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.3s ease;
}

.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.field-label-row {
  font-size: 14px;
  color: #555;
  min-width: 140px;
}

.field-row .input-wrap {
  flex: 1;
  max-width: 200px;
}

.close-tab-btn {
  margin-left: auto;
  margin-bottom: 6px;
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  transition: background 0.15s;
}
.close-tab-btn:hover { background: #ffe5e5; color: #e53935; }
</style>