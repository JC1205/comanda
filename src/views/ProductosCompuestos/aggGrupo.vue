<template>
  <transition name="fade-slide">
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><FolderOpen :size="16" /></div>
          <span>Administrar grupos</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="15" /></button>
      </div>

      <div class="modal-body">
        <div class="split-layout">

          <!-- Tabla -->
          <div class="tabla-panel">
            <p class="panel-label">Grupos</p>
            <div class="tabla-wrapper">
              <table class="tabla">
                <thead><tr><th>Clave</th><th>Descripción</th></tr></thead>
                <tbody>
                  <tr
                    v-for="grupo in grupos" :key="grupo.idgrupo"
                    @click="seleccionarGrupo(grupo)"
                    :class="{ selected: clave === grupo.idgrupo }"
                  >
                    <td>{{ grupo.idgrupo }}</td>
                    <td>{{ grupo.nombre }}</td>
                  </tr>
                  <tr v-if="!grupos.length"><td colspan="2" class="tabla-empty">Sin grupos</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Formulario -->
          <div class="form-panel">
            <p class="panel-label">Datos del grupo</p>
            <div class="fields">
              <div class="field-group">
                <label class="field-label">Clave</label>
                <input v-model="clave" type="number" class="field-input field-input--readonly" readonly />
              </div>
              <div class="field-group">
                <label class="field-label">Descripción</label>
                <input v-model="nombre" type="text" class="field-input" placeholder="Nombre del grupo" />
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-secondary" @click="limpiarCampos">Limpiar</button>
              <button class="btn-danger" @click="delGrupo">Eliminar</button>
              <button class="btn-primary" @click="aggGrupo">Guardar</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted } from "vue";
import { FolderOpen, X } from "lucide-vue-next";
import { supabase } from "@/supabase/supabase";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar"]);

const clave  = ref(null);
const nombre = ref(null);
const grupos = ref([]);

const limpiarCampos = () => { clave.value = null; nombre.value = null; };

const cargarGrupos = async () => {
  const { data, error } = await supabase.from("grupos").select();
  if (error) { console.error("Error al consultar grupos"); return; }
  grupos.value = data;
};

const seleccionarGrupo = (grupo) => { clave.value = grupo.idgrupo; nombre.value = grupo.nombre; };

const aggGrupo = async () => {
  await cargarGrupos();
  const existe = grupos.value.find(u => u.idgrupo === clave.value);
  if (existe) {
    const { error } = await supabase.from("grupos").update({ nombre: nombre.value }).eq("idgrupo", clave.value);
    if (error) { console.error("Error al actualizar grupo", error); return; }
  } else {
    const { data, error } = await supabase.from("grupos").insert([{ nombre: nombre.value }]).select();
    if (error) { console.error("Error al agregar grupo", error); return; }
    clave.value = data[0].idgrupo;
  }
  await cargarGrupos();
};

const delGrupo = async () => {
  const { error } = await supabase.from("grupos").delete().eq("idgrupo", clave.value);
  if (error) { console.error("Error al eliminar grupo", error); return; }
  await cargarGrupos(); limpiarCampos();
};

onMounted(() => { cargarGrupos(); });
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center; z-index: 1100;
}
.modal-card {
  background: #fff; border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
  width: 560px; max-height: 85vh;
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
  background: #e6fff0; color: #2db760;
  display: flex; align-items: center; justify-content: center;
}
.close-btn {
  width: 28px; height: 28px; border: none; background: #f5f5f5;
  border-radius: 7px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: #888;
}
.close-btn:hover { background: #ffe5e5; color: #e53935; }
.modal-body { display: flex; flex: 1; overflow: hidden; 
padding: 10px 36px 32px 32px;}

.split-layout { display: flex; flex: 1; overflow: hidden; }
.tabla-panel {
  width: 220px; flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: flex; flex-direction: column;
  padding: 12px; overflow: hidden;
}
.panel-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #bbb; margin: 0 0 8px; flex-shrink: 0;
}
.tabla-wrapper { flex: 1; overflow-y: auto; }
.tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
.tabla th {
  text-align: left; padding: 7px 6px;
  font-size: 11px; font-weight: 600; color: #aaa;
  text-transform: uppercase; border-bottom: 1px solid #f0f0f0;
  position: sticky; top: 0; background: #fff;
}
.tabla td { padding: 7px 6px; color: #333; border-bottom: 1px solid #f8f8f8; cursor: pointer; }
.tabla tr:hover td { background: #f8f8f8; }
.tabla tr.selected td { background: #f0fdf5; }
.tabla-empty { text-align: center; color: #ccc; padding: 16px 0; font-size: 13px; }
.form-panel {
  flex: 1; display: flex; flex-direction: column;
  padding: 12px 16px; overflow-y: auto;
}
.fields { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: #bbb;
}
.field-input {
  padding: 9px 12px; border: 1.5px solid #e5e5e5; border-radius: 9px;
  font-size: 13px; color: #111; outline: none; transition: border-color 0.2s;
}
.field-input:focus { border-color: #2db760; }
.field-input--readonly { background: #fafafa; color: #999; cursor: default; }
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
  background: #2db760; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer;
}
.btn-primary:hover { background: #239e51; }

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
}

.fade-slide-enter-from .modal-card,
.fade-slide-leave-to .modal-card {
  transform: translateY(-20px);
  opacity: 0;
}

.fade-slide-enter-to .modal-card,
.fade-slide-leave-from .modal-card {
  transform: translateY(0);
  opacity: 1;
}

</style>