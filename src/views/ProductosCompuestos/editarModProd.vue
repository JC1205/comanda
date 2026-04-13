<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Pencil :size="15" /></div>
          <span>Editar modificadores de productos</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar'); limpiarCampos()"><X :size="14" /></button>
      </div>
      <div class="modal-body">
        <div class="split-layout">
          <div class="tabla-panel">
            <p class="panel-label">Modificadores</p>
            <div class="tabla-wrapper">
              <table class="tabla">
                <thead><tr><th>Clave</th><th>Descripción</th><th>Precio</th><th>Grupo</th></tr></thead>
                <tbody>
                  <tr v-for="m in modificadores" :key="m.idmodificador" @click="editarModificadores(m)" :class="{ selected: clave === m.idmodificador }">
                    <td>{{ m.idmodificador }}</td><td>{{ m.nombre }}</td>
                    <td>${{ m.precio }}</td><td>{{ obtenerNombreGrupoMod(m.idgrupomod) }}</td>
                  </tr>
                  <tr v-if="!modificadores.length"><td colspan="4" class="tabla-empty">Sin modificadores</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="form-panel">
            <p class="panel-label">Datos</p>
            <div class="fields">
              <div class="field-group">
                <label class="field-label">Clave</label>
                <input v-model="clave" type="number" class="field-input field-input--readonly" readonly />
              </div>
              <div class="field-group">
                <label class="field-label">Descripción</label>
                <input v-model="descripcion" type="text" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Precio</label>
                <input v-model="precio" type="number" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Grupo Modificador</label>
                <select v-model="tipo" class="field-input field-select">
                  <option v-for="g in gruposMod" :key="g.idgrupomod">{{ g.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-secondary" @click="limpiarCampos">Limpiar</button>
              <button class="btn-danger" @click="delModificador">Eliminar</button>
              <button class="btn-primary" @click="aggModificador">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from "@/supabase/supabase";
import { defineEmits, defineProps, ref, onMounted } from "vue";
import { Pencil, X } from "lucide-vue-next";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizado"]);

const clave       = ref(null);
const descripcion = ref(null);
const precio      = ref(null);
const tipo        = ref(null);
const gruposMod   = ref([]);
const modificadores = ref([]);

const limpiarCampos = () => { clave.value = null; descripcion.value = null; precio.value = null; tipo.value = null; };

const editarModificadores = (m) => {
  clave.value = m.idmodificador; descripcion.value = m.nombre;
  precio.value = m.precio; tipo.value = obtenerNombreGrupoMod(m.idgrupomod);
};

const obtenergruposMod = async () => {
  const { data, error } = await supabase.from("grupomodificador").select();
  if (error) { console.error("Error al obtener grupos modificadores"); return; }
  gruposMod.value = data;
};

const obtenerNombreGrupoMod = (idgrupomod) => {
  const g = gruposMod.value.find(g => g.idgrupomod === idgrupomod);
  return g ? g.nombre : "Sin grupo modificador";
};

const obtenerModificadores = async () => {
  const { data, error } = await supabase.from("modificadores").select();
  if (error) { console.error("Error al obtener modificadores", error); return; }
  modificadores.value = data;
};

const aggModificador = async () => {
  await obtenerModificadores(); await obtenergruposMod();
  const existe    = modificadores.value.find(u => u.idmodificador === clave.value);
  const grupoModi = gruposMod.value.find(u => u.nombre === tipo.value);
  if (existe) {
    const { error } = await supabase.from("modificadores")
      .update({ nombre: descripcion.value, precio: precio.value, idgrupomod: grupoModi.idgrupomod })
      .eq("idmodificador", clave.value);
    if (error) { console.error("Error al actualizar modificador", error); return; }
    emit("actualizado");
  } else {
    const { data, error } = await supabase.from("modificadores")
      .insert([{ nombre: descripcion.value, precio: precio.value, idgrupomod: grupoModi.idgrupomod }]).select();
    if (error) { console.error("Error al agregar modificador", error); return; }
    clave.value = data[0].idmodificador;
    emit("actualizado");
  }
  await obtenerModificadores();
};

const delModificador = async () => {
  const { error } = await supabase.from("modificadores").delete().eq("idmodificador", clave.value);
  if (error) { console.error("Error al eliminar modificador", error); return; }
  await obtenerModificadores(); limpiarCampos();
};

onMounted(() => { obtenergruposMod(); obtenerModificadores(); });
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1200; }
.modal-card { background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.14); width: 680px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 25px 36px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.modal-header-left { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 700; color: #111; }
.modal-icon { width: 28px; height: 28px; border-radius: 8px; background: #e6fff0; color: #2db760; display: flex; align-items: center; justify-content: center; }
.close-btn { width: 26px; height: 26px; border: none; background: #f5f5f5; border-radius: 7px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #888; }
.close-btn:hover { background: #ffe5e5; color: #e53935; }
.modal-body { display: flex; flex: 1; overflow: hidden; padding: 10px 36px 32px 32px;}
.split-layout { display: flex; flex: 1; overflow: hidden; }
.tabla-panel { width: 320px; flex-shrink: 0; border-right: 1px solid #f0f0f0; display: flex; flex-direction: column; padding: 12px; overflow: hidden; }
.panel-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #bbb; margin: 0 0 8px; flex-shrink: 0; }
.tabla-wrapper { flex: 1; overflow-y: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 12px; }
.tabla th { text-align: left; padding: 6px 5px; font-size: 10px; font-weight: 600; color: #aaa; text-transform: uppercase; border-bottom: 1px solid #f0f0f0; position: sticky; top: 0; background: #fff; }
.tabla td { padding: 6px 5px; color: #333; border-bottom: 1px solid #f8f8f8; cursor: pointer; }
.tabla tr:hover td { background: #f8f8f8; }
.tabla tr.selected td { background: #f0fdf5; }
.tabla-empty { text-align: center; color: #ccc; padding: 14px 0; font-size: 12px; }
.form-panel { flex: 1; display: flex; flex-direction: column; padding: 12px 14px; overflow-y: auto; }
.fields { display: flex; flex-direction: column; gap: 9px; flex: 1; }
.field-group { display: flex; flex-direction: column; gap: 3px; }
.field-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #bbb; }
.field-input { padding: 8px 11px; border: 1.5px solid #e5e5e5; border-radius: 8px; font-size: 13px; color: #111; outline: none; transition: border-color 0.2s; }
.field-input:focus { border-color: #2db760; }
.field-input--readonly { background: #fafafa; color: #999; cursor: default; }
.field-select { cursor: pointer; background: #fff; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.form-actions { display: flex; gap: 6px; padding-top: 10px; margin-top: 6px; border-top: 1px solid #f0f0f0; flex-shrink: 0; }
.btn-secondary { padding: 7px 12px; border: 1.5px solid #e5e5e5; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; color: #555; cursor: pointer; }
.btn-secondary:hover { background: #f5f5f5; }
.btn-danger { padding: 7px 12px; border: 1.5px solid #fecaca; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; color: #e53935; cursor: pointer; }
.btn-danger:hover { background: #fff0f0; }
.btn-primary { flex: 1; padding: 7px 12px; border: none; border-radius: 8px; background: #2db760; font-size: 12px; font-weight: 600; color: #fff; cursor: pointer; }
.btn-primary:hover { background: #239e51; }
</style>