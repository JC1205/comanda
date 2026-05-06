<template>
    <transition name="fade-slide">
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Link2 :size="15" /></div>
          <span>Asignar modificador</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar'); limpiarCampos()"><X :size="14" /></button>
      </div>
      <div class="modal-body">
        <div class="split-layout">

          <!-- Tabla grupos asignados -->
          <div class="tabla-panel">
            <p class="panel-label">Asignados</p>
            <div class="tabla-wrapper">
              <table class="tabla">
                <thead><tr><th>IdAsig</th><th>Clave</th><th>Descripción</th><th>Máx.</th></tr></thead>
                <tbody>
                  <tr v-for="g in gruposAnadidos" :key="g.idgrupomod" @click="seleccionarModProd(g)" :class="{ selected: claveMod === g.idasignacion }">
                    <td>{{ g.idasignacion }}</td><td>{{ g.idgrupomod }}</td>
                    <td>{{ g.nombre }}</td><td>{{ g.modificadoresmax }}</td>
                  </tr>
                  <tr v-if="!gruposAnadidos.length"><td colspan="4" class="tabla-empty">Sin asignaciones</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Formulario -->
          <div class="form-panel">
            <p class="panel-label">Asignar grupo</p>
            <div class="fields">
              <div class="field-group">
                <label class="field-label">Clave asignación</label>
                <input v-model="claveMod" type="number" class="field-input field-input--readonly" readonly />
              </div>
              <div class="field-group">
                <label class="field-label">Grupo modificador</label>
                <select v-model="tipo" class="field-input field-select">
                  <option v-for="g in gruposModificadores" :key="g.idgrupomod">{{ g.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-secondary" @click="limpiarCampos">Limpiar</button>
              <button class="btn-danger" @click="delGrupoModProd">Eliminar</button>
              <button class="btn-primary" @click="addGrupoModProd">Guardar</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, watch } from "vue";
import { Link2, X } from "lucide-vue-next";
import { supabase } from "@/supabase/supabase";
import { claveProducto, gruposModificadores, cargarGruposModif } from "@/store/auth.js";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizado"]);

const claveMod      = ref(null);
const tipo          = ref(null);
const gruposAnadidos = ref([]);

const seleccionarModProd = (g) => { claveMod.value = g.idasignacion; };
const limpiarCampos      = () => { claveMod.value = null; tipo.value = null; };

const cargarGruposAsignados = async () => {
  try {
    const { data, error } = await supabase
      .from("prodgrupmodificador")
      .select(`idprodgrupmod, idgrupomod, grupomodificador!inner(nombre, modificadoresmax)`)
      .eq("idproducto", claveProducto.value);
    if (error) throw new Error(error.message);
    gruposAnadidos.value = data.map(item => ({
      idasignacion:   item.idprodgrupmod,
      idgrupomod:     item.idgrupomod,
      nombre:         item.grupomodificador.nombre,
      modificadoresmax: item.grupomodificador.modificadoresmax,
    }));
  } catch (e) {
    console.error("Error al cargar grupos asignados:", e);
    gruposAnadidos.value = [];
  }
};

const arraySelecGrupoMod = ref(null);
const selecGrupoMod = async () => {
  const { data, error } = await supabase.from("grupomodificador").select();
  if (error) { console.error("Error al obtener grupos modificadores", error); return; }
  arraySelecGrupoMod.value = data;
};

const addGrupoModProd = async () => {
  await selecGrupoMod();
  const grupoModi = arraySelecGrupoMod.value.find(u => u.nombre === tipo.value);

  const { data: existing, error: errExist } = await supabase.from("prodgrupmodificador").select();
  if (errExist) { console.error("Error al obtener uniones", errExist); return; }

  const existe = existing.find(u => u.idprodgrupmod === claveMod.value);
  if (existe) {
    const { error } = await supabase.from("prodgrupmodificador")
      .update({ idgrupomod: grupoModi.idgrupomod }).eq("idprodgrupmod", claveMod.value);
    if (error) { console.error("Error al actualizar", error); return; }
  } else {
    const { data, error } = await supabase.from("prodgrupmodificador")
      .insert({ idproducto: claveProducto.value, idgrupomod: grupoModi.idgrupomod }).select();
    if (error) { console.error("Error al unir grupo modificador", error); return; }
    claveMod.value = data[0].idprodgrupmod;
  }
  tipo.value = null;
  await cargarGruposAsignados();
  await cargarGruposModif();
  emit("actualizado");
};

const delGrupoModProd = async () => {
  const { error } = await supabase.from("prodgrupmodificador").delete().eq("idprodgrupmod", claveMod.value);
  if (error) { console.error("Error al eliminar union", error); return; }
  await cargarGruposModif();
  await cargarGruposAsignados();
  limpiarCampos();
  emit("actualizado");
};

watch(claveProducto, (v) => { if (v != null) cargarGruposAsignados(); }, { immediate: true });
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1200; }
.modal-card { background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.14); width: 640px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 25px 36px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.modal-header-left { display: flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 700; color: #111; }
.modal-icon { width: 28px; height: 28px; border-radius: 8px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; }
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
.tabla tr.selected td { background: #e0f7ff; }
.tabla-empty { text-align: center; color: #ccc; padding: 14px 0; font-size: 12px; }
.form-panel { flex: 1; display: flex; flex-direction: column; padding: 12px 14px; overflow-y: auto; }
.fields { display: flex; flex-direction: column; gap: 9px; flex: 1; }
.field-group { display: flex; flex-direction: column; gap: 3px; }
.field-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #bbb; }
.field-input { padding: 8px 11px; border: 1.5px solid #e5e5e5; border-radius: 8px; font-size: 13px; color: #111; outline: none; transition: border-color 0.2s; }
.field-input:focus { border-color: #0284c7; }
.field-input--readonly { background: #fafafa; color: #999; cursor: default; }
.field-select { cursor: pointer; background: #fff; }
input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.form-actions { display: flex; gap: 6px; padding-top: 10px; margin-top: 6px; border-top: 1px solid #f0f0f0; flex-shrink: 0; }
.btn-secondary { padding: 7px 12px; border: 1.5px solid #e5e5e5; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; color: #555; cursor: pointer; }
.btn-secondary:hover { background: #f5f5f5; }
.btn-danger { padding: 7px 12px; border: 1.5px solid #fecaca; border-radius: 8px; background: #fff; font-size: 12px; font-weight: 600; color: #e53935; cursor: pointer; }
.btn-danger:hover { background: #fff0f0; }
.btn-primary { flex: 1; padding: 7px 12px; border: none; border-radius: 8px; background: #0284c7; font-size: 12px; font-weight: 600; color: #fff; cursor: pointer; }
.btn-primary:hover { background: #0369a1; }

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