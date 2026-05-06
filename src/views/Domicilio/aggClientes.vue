<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><UserPlus :size="18" /></div>
          <span>Agregar cliente</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar'); limpiarCampos()"><X :size="16" /></button>
      </div>

      <div class="modal-body">
        <!-- Buscador -->
        <div class="search-row">
          <div class="input-wrap search-wrap">
            <Search :size="14" class="search-icon" />
            <input v-model="buscar" type="text" class="search-input" placeholder="# Tel o Nombre" />
          </div>
          <button class="btn-secondary" @click="searchCliente">Buscar</button>
          <button class="btn-secondary btn-add" @click="aggCliente">Guardar</button>
        </div>

        <!-- Formulario -->
        <div class="form-grid">
          <div class="field-group field-group--full">
            <label class="field-label">Contacto</label>
            <input v-model="nombre" type="text" class="field-input" placeholder="Nombre completo" />
          </div>
          <div class="field-group">
            <label class="field-label">Teléfono</label>
            <input v-model="telefono" type="number" class="field-input" placeholder="10 dígitos" />
          </div>
          <div class="field-group">
            <label class="field-label">Número de casa</label>
            <input v-model="numCasa" type="number" class="field-input" />
          </div>
          <div class="field-group field-group--full">
            <label class="field-label">Calle</label>
            <input v-model="calle" type="text" class="field-input" />
          </div>
          <div class="field-group field-group--full">
            <label class="field-label">Colonia</label>
            <input v-model="colonia" type="text" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">Entre calle 1</label>
            <input v-model="cruzamiento1" type="text" class="field-input" />
          </div>
          <div class="field-group">
            <label class="field-label">Entre calle 2</label>
            <input v-model="cruzamiento2" type="text" class="field-input" />
          </div>
          <div class="field-group field-group--full">
            <label class="field-label">Referencias</label>
            <input v-model="referencias" type="text" class="field-input" placeholder="Ej. Casa azul con rejas" />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('cerrar'); limpiarCampos()">Cancelar</button>
        <button class="btn-confirm" @click="abrirCuenta(); limpiarCampos(); emit('cerrar')">Aceptar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
import { supabase } from "@/supabase/supabase";
import { idCliente, idDireccion, idPedido, numPedidos, idTurno } from "@/store/auth.js";
import { UserPlus, X, Search } from "lucide-vue-next";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizado"]);

const buscar       = ref(null);
const nombre       = ref(null);
const telefono     = ref(null);
const calle        = ref(null);
const colonia      = ref(null);
const numCasa      = ref(null);
const cruzamiento1 = ref(null);
const cruzamiento2 = ref(null);
const referencias  = ref(null);
const clientes     = ref([]);
const direccion    = ref([]);

const now  = new Date();
const hora = ref(now.toTimeString().split(" ")[0]);

const limpiarCampos = () => {
  nombre.value = null; telefono.value = null;
  calle.value = null; colonia.value = null; numCasa.value = null;
  cruzamiento1.value = null; cruzamiento2.value = null;
  referencias.value = null; buscar.value = null;
};

const consultarDireccion = async (id) => {
  const { data, error } = await supabase.from("direcciones").select().eq("idcliente", id);
  if (error) { console.error("Error al obtener direcciones", error); return; }
  if (!data || data.length === 0) { direccion.value = {}; idDireccion.value = null; return; }
  direccion.value   = data[0];
  idDireccion.value = data[0].iddireccion;
};

const consultarCliente = async () => {
  const { data, error } = await supabase.from("clientes").select();
  if (error) { console.error("Error al obtener clientes"); return; }
  clientes.value = data[0];
};

async function searchCliente() {
  if (!buscar.value) { clientes.value = []; return; }

  const { data, error } = await supabase
    .from("clientes").select("*")
    .or(`numero.eq.${buscar.value},nombre.eq.${buscar.value}`);

  if (error) { console.error("Error al buscar clientes:", error); clientes.value = []; return; }

  if (!data || data.length === 0) {
    telefono.value = buscar.value;
    buscar.value   = null;
    clientes.value = [];
    return;
  }

  const primero = data[0];
  await consultarDireccion(primero.idcliente);

  buscar.value       = null;
  nombre.value       = primero.nombre;
  telefono.value     = primero.numero;
  calle.value        = direccion.value.calle;
  colonia.value      = direccion.value.colonia;
  numCasa.value      = direccion.value.numcasa;
  cruzamiento1.value = direccion.value.interseccion1;
  cruzamiento2.value = direccion.value.interseccion2;
  referencias.value  = direccion.value.referencias;
  idCliente.value    = primero.idcliente;
  idDireccion.value  = direccion.value.iddireccion;
}

const aggCliente = async () => {
  await consultarCliente();

  if (idCliente.value) {
    const { error: errorUp } = await supabase
      .from("clientes")
      .update({ nombre: nombre.value, numero: telefono.value })
      .eq("idcliente", idCliente.value);
    if (errorUp) { console.error("Error al actualizar Cliente", errorUp); return; }

    await consultarDireccion(idCliente.value);
    const { error: errorDirUp } = await supabase
      .from("direcciones")
      .update({
        calle: calle.value, numcasa: numCasa.value, colonia: colonia.value,
        interseccion1: cruzamiento1.value, interseccion2: cruzamiento2.value,
        referencias: referencias.value,
      })
      .eq("iddireccion", idDireccion.value);
    if (errorDirUp) { console.error("Error al actualizar dirección", errorDirUp); return; }

  } else {
    const { data: dataAgg, error: errorAgg } = await supabase
      .from("clientes")
      .insert([{ nombre: nombre.value, numero: telefono.value }])
      .select();
    if (errorAgg) { console.error("Error al agregar cliente", errorAgg); return; }

    idCliente.value = dataAgg[0].idcliente;

    const { data: direccAgg, error: errorDirAgg } = await supabase
      .from("direcciones")
      .insert([{
        idcliente:     idCliente.value,
        calle:         calle.value,
        numcasa:       numCasa.value,
        colonia:       colonia.value,
        interseccion1: cruzamiento1.value,
        interseccion2: cruzamiento2.value,
        referencias:   referencias.value,
      }])
      .select();
    if (errorDirAgg) { console.error("Error al agregar dirección", errorDirAgg); return; }
    idDireccion.value = direccAgg[0].iddireccion;
  }
};

const abrirCuenta = async () => {
  const { data: dataPedidos, error: errorPedidos } = await supabase
    .from("pedidos").select().eq("abierto", true).eq("tipo", "Domicilio");
  if (errorPedidos) { console.error("Error al obtener pedidos", errorPedidos); return; }

  const existe = dataPedidos.find(u => u.idcliente === idCliente.value);
  if (existe) { console.log("Ya existe una cuenta con ese cliente"); return; }

  if (!idTurno.value || !hora.value || !idCliente.value) {
    console.error("Campos obligatorios faltantes"); return;
  }

  const { data, error } = await supabase
    .from("pedidos")
    .insert([{
      nombre:       "",
      idturno:      idTurno.value,
      tipo:         "Domicilio",
      horaapertura: hora.value,
      impreso:      false,
      abierto:      true,
      eliminado:    false,
      numeropedido: numPedidos.value + 1,
      idcliente:    idCliente.value,
    }])
    .select();
  if (error) { console.error("❌ Error al crear pedido", error); return; }

  idPedido.value = data[0].idpedido;

  const { data: result, error: error2 } = await supabase.rpc("incrementar_total_notas", {
    turno_id: idTurno.value,
  });
  if (error2) { console.error("❌ Error al aumentar pedidos", error2); return; }
  numPedidos.value = result;

  emit("actualizado");
  emit("cerrar");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.14);
  width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #111;
}

.modal-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #fff3e0;
  color: #e07c00;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  width: 30px;
  height: 30px;
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
.close-btn:hover { background: #ffe5e5; color: #e53935; }

.modal-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-row { display: flex; gap: 8px; align-items: center; }

.input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  overflow: hidden;
  padding: 0 12px;
  gap: 8px;
  transition: border-color 0.2s;
}
.input-wrap:focus-within { border-color: #e07c00; }

.search-icon { color: #bbb; flex-shrink: 0; }

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 9px 0;
  font-size: 13px;
  color: #111;
  background: transparent;
}

.btn-secondary {
  padding: 9px 14px;
  border: 1.5px solid #e5e5e5;
  border-radius: 9px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-secondary:hover { background: #f5f5f5; }
.btn-add { border-color: #e07c00; color: #e07c00; }
.btn-add:hover { background: #fff8f0; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-group--full { grid-column: 1 / -1; }

.field-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #bbb;
}

.field-input {
  padding: 9px 12px;
  border: 1.5px solid #e5e5e5;
  border-radius: 9px;
  font-size: 13px;
  color: #111;
  outline: none;
  transition: border-color 0.2s;
}
.field-input:focus { border-color: #e07c00; }

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel  { background: #f5f5f5; color: #555; }
.btn-cancel:hover  { background: #eee; }
.btn-confirm { background: #e07c00; color: #fff; }
.btn-confirm:hover { background: #c47a00; }
</style>