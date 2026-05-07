<template>
<div v-if="mostrar">

  <Teleport to="body">
    <div v-if="alertaVisible" role="alert" class="alert" :class="alertaTipo === 'error' ? 'alert-error' : 'alert-success'">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path v-if="alertaTipo === 'error'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ alertaMensaje }}</span>
    </div>
  </Teleport>

  <vue-draggable-resizable :w="271" :h="193" :x="window.innerWidth / 2 - 270" :y="window.innerHeight / 2 - 230" :resizable="false" class="custom-draggable">
    <div class="internal-frame">
      <div class="header">Cerrar turno
        <button class="close-btn" @click="$emit('cerrar')">X</button>
      </div>
      <div class="content">
        <p>Ingresa los importes declarados para el cierre de caja</p>

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
              <td>{{ item.clave }}</td>
              <td>{{ item.descripcion }}</td>
              <td>
                <input
                  type="text"
                  inputmode="decimal"
                  v-model="item.importe"
                  @input="(e) => actualizarImporte(e, index)"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="button-group">
          <button @click="confirmar" class="button">Confirmar</button>
          <button @click="$emit('cerrar')" class="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  </vue-draggable-resizable>

</div>
</template>

<script setup>
import { obtenerTurno, turno, userLogin, idTurno } from "@/store/auth.js";
import { supabase } from "@/supabase/supabase";
import { defineEmits, defineProps, ref } from "vue";
import VueDraggableResizable from "vue-draggable-resizable";
import "vue-draggable-resizable/style.css";

// Props y eventos
const props = defineProps(["mostrar"]);
const emit = defineEmits(["cerrar", "turnoCerrado"]); // ✅ turnoCerrado declarado

// Variables
const alertaVisible = ref(false);
const alertaTipo    = ref("error");
const alertaMensaje = ref("");
const window = ref(globalThis.window);

// Fecha y Hora
const now = new Date();
const fecha = ref(now.toISOString().split("T")[0]);
const hora  = ref(now.toTimeString().split(" ")[0]);

// ── Alerta ────────────────────────────────────────────────────
const mostrarAlerta = (mensaje, tipo = "error") => {
  alertaMensaje.value = mensaje;
  alertaTipo.value    = tipo;
  alertaVisible.value = true;
  setTimeout(() => { alertaVisible.value = false; }, 3000);
};

// ── Tabla ─────────────────────────────────────────────────────
const caja = ref([
  { clave: "EF", descripcion: "Efectivo",       importe: null },
  { clave: "TJ", descripcion: "Tarjeta",         importe: null },
  { clave: "TR", descripcion: "Transferencia",   importe: null },
]);

const actualizarImporte = (e, index) => {
  let valor = e.target.value
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1');

  caja.value[index].importe = valor === '' ? null : Number(valor);
  e.target.value = valor;
};

// ── Confirmar cierre ─────────────────────────────────────────
const confirmar = async () => {
  // Validación
  const camposVacios = caja.value.some(item => item.importe === null || item.importe === '');
  if (camposVacios) {
    mostrarAlerta("Rellena todos los campos");
    return;
  }

  const now2 = new Date();
  hora.value  = now2.toTimeString().split(" ")[0];

  const { error } = await supabase
    .from('turnos')
    .update({
      horacierre:    hora.value,
      efectivoFinal: caja.value[0].importe,
      tarjetasFinal: caja.value[1].importe,
      transferFinal: caja.value[2].importe,
    })
    .eq('idturno', idTurno.value);

  if (error) {
    console.error('Error al guardar cierre de turno:', error);
    mostrarAlerta("Error al cerrar el turno, intenta de nuevo");
    return;
  }

  // ✅ Solo se ejecuta si no hubo error
  turno.value    = false;
  idTurno.value  = null; // ✅ sin ref()
  mostrarAlerta("¡Turno cerrado correctamente!", "success");
  
  setTimeout(() => {
    emit("turnoCerrado");
    emit("cerrar");
  }, 1000); // pequeña pausa para que se vea la alerta antes de cerrar
};
</script>

<style scoped>
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}

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

.custom-draggable {
  outline: none !important;
  border: none !important;
}
.custom-draggable > div {
  outline: none !important;
  border: none !important;
}
.vue-draggable-resizable .handle,
.vue-draggable-resizable .handle-tl,
.vue-draggable-resizable .handle-tr,
.vue-draggable-resizable .handle-bl,
.vue-draggable-resizable .handle-br {
  display: none !important;
}

.tabla-cierre {
  width: 500px;
  border-collapse: collapse;
  margin-top: 20px;
}
.tabla-cierre th, .tabla-cierre td {
  padding: 3px;
  padding-left: 8px;
  text-align: left;
  border: 1px solid #ccc;
  font-weight: normal;
  color: #3e3e3e;
}
.tabla-cierre th:nth-child(1),
.tabla-cierre td:nth-child(1) { width: 80px; }
.tabla-cierre th:nth-child(2),
.tabla-cierre td:nth-child(2) { width: 270px; }
.tabla-cierre th { background-color: #e7e7e7; }

.internal-frame {
  outline: none;
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 200%;
  height: 175%;
  display: flex;
  flex-direction: column;
}

.header {
  background: rgb(247, 219, 75);
  color: white;
  padding: 5px 20px;
  font-weight: bold;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  position: relative;
  text-align: left;
}

.close-btn {
  padding: 0 !important;
  width: 21px;
  height: 21px;
  position: absolute;
  right: 2px;
  top: 2px;
  bottom: 2px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 4px;
  margin-right: 4px;
  font-size: 13px;
}
.close-btn:hover { background-color: rgb(209, 0, 0); }

.content {
  padding: 20px;
  text-align: left;
  padding-left: 20px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  margin-left: 110px;
  margin-right: 110px;
}

button {
  width: 130px;
  padding: 5px 15px;
  border: none;
  background-color: rgb(130, 165, 243);
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.button:hover  { background-color: rgb(105, 133, 194); }
.cancel-btn    { background-color: rgb(126, 126, 126); }
.cancel-btn:hover { background-color: rgb(92, 92, 92); }
</style>