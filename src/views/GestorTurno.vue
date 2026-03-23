<template>
  <div v-if="mostrar" class="gestor-wrapper">

    <!-- ABRIR TURNO -->
    <transition name="panel-fade" mode="out-in">
      <div v-if="!turno" key="abrir" class="turno-card">

        <div class="card-icon-header">
          <div class="icon-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <h2 class="card-title">Control de Turno</h2>
            <p class="card-subtitle">Sin turno abierto</p>
          </div>
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
            />
          </div>
        </div>

        <div class="btn-group">
          <button class="btn-confirmar" @click="confirmar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
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
        </div>

        <div class="divider" />

        <table class="tabla-cierre">
          <thead>
            <tr>
              <th>Clave</th>
              <th>Descripción</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in caja" :key="index">
              <td class="td-clave">{{ item.clave }}</td>
              <td>{{ item.descripcion }}</td>
              <td>
                <div class="input-wrap input-wrap--sm">
                  <span class="input-prefix">$</span>
                  <input
                    type="number"
                    v-model.number="item.importe"
                    placeholder="0.00"
                    class="field-input"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="btn-group">
          <button class="btn-cerrar" @click="confirmarCierre">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
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

// ── Props & emits ──────────────────────────────────────────────
const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "turnoAbierto", "turnoCerrado"]);

// ── Estado abrir turno ─────────────────────────────────────────
const montoInicial = ref(null);

const now   = new Date();
const fecha = ref(now.toISOString().split("T")[0]);
const hora  = ref(now.toTimeString().split(" ")[0]);

const confirmar = async () => {
  await obtenerTurno();
  if (turno.value) return;
  if (montoInicial.value === null) return;

  const { error } = await supabase.from("turnos").insert([{
    idusuario:    userLogin.value,
    fecha:        fecha.value,
    horaapertura: hora.value,
    montoinicial: montoInicial.value,
  }]);

  if (error) { console.error("Error:", error.message); return; }

  await obtenerTurno();
  turno.value   = true;
  numPedidos.value = 1;
  emit("turnoAbierto");
  emit("cerrar");
};

// ── Estado cerrar turno ────────────────────────────────────────
const caja = ref([
  { clave: "EF", descripcion: "Efectivo",      importe: null },
  { clave: "TJ", descripcion: "Tarjeta",        importe: null },
  { clave: "TR", descripcion: "Transferencia",  importe: null },
]);

const confirmarCierre = async () => {
  if (caja.value.some(i => i.importe === null)) return;

  const horaIso = new Date().toISOString().split("T")[1].split(".")[0];

  const { error } = await supabase
    .from("turnos")
    .update({
      horacierre:      horaIso,
      efectivoFinal:   caja.value[0].importe,
      tarjetasFinal:   caja.value[1].importe,
      transferFinal:   caja.value[2].importe,
    })
    .eq("idturno", idTurno.value);

  if (error) { console.error("Error al guardar cierre:", error); return; }

  turno.value   = false;
  idTurno.value = null;
  emit("turnoCerrado");
  emit("cerrar");
};
</script>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────── */
.gestor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

/* ── Card principal ────────────────────────────────────────── */
.turno-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 32px 36px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Header ────────────────────────────────────────────────── */
.card-icon-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  flex-shrink: 0;
}

.icon-wrap--active {
  background: #e6f9ee;
  color: #22c55e;
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

/* ── Divider ───────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 -4px;
}

/* ── Fields ────────────────────────────────────────────────── */
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
  border-color: #22c55e;
}

.input-wrap--sm {
  border-radius: 8px;
}

.input-prefix {
  padding: 0 12px;
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

/* quitar flechas spinner */
.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* ── Tabla cierre ──────────────────────────────────────────── */
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

/* ── Botones ───────────────────────────────────────────────── */
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
  background: #22c55e;
  color: #fff;
}

.btn-confirmar:hover {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35);
}

.btn-cerrar {
  flex: 1;
  background: #ef4444;
  color: #fff;
}

.btn-cerrar:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
}

/* ── Transición entre vistas ───────────────────────────────── */
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
</style>