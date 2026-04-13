<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><FolderTree :size="16" /></div>
          <span>Administrar subgrupos</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="15" /></button>
      </div>

      <div class="modal-body">
        <div class="split-layout">

          <!-- Tabla -->
          <div class="tabla-panel">
            <p class="panel-label">Subgrupos</p>
            <div class="tabla-wrapper">
              <table class="tabla">
                <thead><tr><th>Clave</th><th>Descripción</th><th>Grupo</th></tr></thead>
                <tbody>
                  <tr
                    v-for="sub in subGrupos" :key="sub.idsubgrupo"
                    @click="seleccionarSubGrupo(sub)"
                    :class="{ selected: clave === sub.idsubgrupo }"
                  >
                    <td>{{ sub.idsubgrupo }}</td>
                    <td>{{ sub.nombre }}</td>
                    <td>{{ obtenerNombreGrupo(sub.idgrupo) }}</td>
                  </tr>
                  <tr v-if="!subGrupos.length"><td colspan="3" class="tabla-empty">Sin subgrupos</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Formulario -->
          <div class="form-panel">
            <p class="panel-label">Datos del subgrupo</p>
            <div class="fields">
              <div class="field-group">
                <label class="field-label">Clave</label>
                <input v-model="clave" type="number" class="field-input field-input--readonly" readonly />
              </div>
              <div class="field-group">
                <label class="field-label">Descripción</label>
                <input v-model="nombre" type="text" class="field-input" placeholder="Nombre del subgrupo" />
              </div>
              <div class="field-group">
                <label class="field-label">Grupo</label>
                <select v-model="tipo" class="field-input field-select">
                  <option v-for="grupo in grupos" :key="grupo.idgrupo">{{ grupo.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-secondary" @click="limpiarCampos">Limpiar</button>
              <button class="btn-danger" @click="delSubGrupo">Eliminar</button>
              <button class="btn-primary" @click="aggSubGrupo">Guardar</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from "vue";
import { FolderTree, X } from "lucide-vue-next";
import { supabase } from "@/supabase/supabase";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar"]);

const clave     = ref(null);
const nombre    = ref(null);
const tipo      = ref(null);
const subGrupos = ref([]);
const grupos    = ref([]);

const limpiarCampos = () => { clave.value = null; nombre.value = null; tipo.value = null; };

const cargarSubGrupos = async () => {
  const { data, error } = await supabase.from("subgrupos").select();
  if (error) { console.error("Error al cargar subgrupos", error); return; }
  subGrupos.value = data;
};

const cargarGrupos = async () => {
  const { data, error } = await supabase.from("grupos").select();
  if (error) { console.error("Error al cargar grupos", error); return; }
  grupos.value = data;
};

const obtenerNombreGrupo = (idgrupo) => {
  const g = grupos.value.find(g => g.idgrupo === idgrupo);
  return g ? g.nombre : "Sin grupo";
};

const seleccionarSubGrupo = (sub) => {
  clave.value  = sub.idsubgrupo;
  nombre.value = sub.nombre;
  tipo.value   = obtenerNombreGrupo(sub.idgrupo);
};

const aggSubGrupo = async () => {
  await cargarSubGrupos(); await cargarGrupos();
  const existe = subGrupos.value.find(u => u.idsubgrupo === clave.value);
  const grupo  = grupos.value.find(u => u.nombre === tipo.value);
  if (existe) {
    const { error } = await supabase.from("subgrupos")
      .update({ nombre: nombre.value, idgrupo: grupo.idgrupo }).eq("idsubgrupo", clave.value);
    if (error) { console.error("Error al actualizar subgrupo", error); return; }
  } else {
    const { data, error } = await supabase.from("subgrupos")
      .insert([{ nombre: nombre.value, idgrupo: grupo.idgrupo }]).select();
    if (error) { console.error("Error al agregar subgrupo", error); return; }
    clave.value = data[0].idsubgrupo;
  }
  await cargarSubGrupos();
};

const delSubGrupo = async () => {
  const { error } = await supabase.from("subgrupos").delete().eq("idsubgrupo", clave.value);
  if (error) { console.error("Error al eliminar subgrupo", error); return; }
  await cargarSubGrupos(); limpiarCampos();
};

onMounted(() => { cargarGrupos(); cargarSubGrupos(); });
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center; z-index: 1100;
}
.modal-card {
  background: #fff; border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
  width: 620px; max-height: 85vh;
  display: flex; flex-direction: column; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 25px 36px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}
.modal-header-left {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 700; color: #111;
}
.modal-icon {
  width: 30px; height: 30px; border-radius: 9px;
  background: #e0f2fe; color: #0284c7;
  display: flex; align-items: center; justify-content: center;
}
.close-btn {
  width: 28px; height: 28px; border: none; background: #f5f5f5;
  border-radius: 7px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: #888;
}
.close-btn:hover { background: #ffe5e5; color: #e53935; }
.modal-body { display: flex; flex: 1; overflow: hidden; padding: 10px 36px 32px 32px;}
.split-layout { display: flex; flex: 1; overflow: hidden; }
.tabla-panel {
  width: 260px; flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: flex; flex-direction: column; padding: 12px; overflow: hidden;
}
.panel-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #bbb; margin: 0 0 8px; flex-shrink: 0;
}
.tabla-wrapper { flex: 1; overflow-y: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
.tabla th {
  text-align: left; padding: 7px 6px; font-size: 11px; font-weight: 600; color: #aaa;
  text-transform: uppercase; border-bottom: 1px solid #f0f0f0;
  position: sticky; top: 0; background: #fff;
}
.tabla td { padding: 7px 6px; color: #333; border-bottom: 1px solid #f8f8f8; cursor: pointer; }
.tabla tr:hover td { background: #f8f8f8; }
.tabla tr.selected td { background: #e0f7ff; }
.tabla-empty { text-align: center; color: #ccc; padding: 16px 0; font-size: 13px; }
.form-panel { flex: 1; display: flex; flex-direction: column; padding: 12px 16px; overflow-y: auto; }
.fields { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: #bbb;
}
.field-input {
  padding: 9px 12px; border: 1.5px solid #e5e5e5; border-radius: 9px;
  font-size: 13px; color: #111; outline: none; transition: border-color 0.2s;
}
.field-input:focus { border-color: #0284c7; }
.field-input--readonly { background: #fafafa; color: #999; cursor: default; }
.field-select { cursor: pointer; background: #fff; }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.form-actions {
  display: flex; gap: 8px; padding-top: 12px; margin-top: 8px;
  border-top: 1px solid #f0f0f0; flex-shrink: 0;
}
.btn-secondary {
  padding: 8px 14px; border: 1.5px solid #e5e5e5; border-radius: 9px;
  background: #fff; font-size: 13px; font-weight: 600; color: #555; cursor: pointer;
}
.btn-secondary:hover { background: #f5f5f5; }
.btn-danger {
  padding: 8px 14px; border: 1.5px solid #fecaca; border-radius: 9px;
  background: #fff; font-size: 13px; font-weight: 600; color: #e53935; cursor: pointer;
}
.btn-danger:hover { background: #fff0f0; }
.btn-primary {
  flex: 1; padding: 8px 14px; border: none; border-radius: 9px;
  background: #0284c7; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
}
.btn-primary:hover { background: #0369a1; }
</style>