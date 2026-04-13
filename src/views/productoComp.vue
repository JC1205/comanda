<template>
      <transition name="fade-slide">
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Layers :size="16" /></div>
          <span>Producto compuesto</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="15" /></button>
      </div>

      <div class="modal-body">

        <!-- Grupos de modificadores -->
        <div class="section">
          <div class="section-header">
            <p class="section-title">Grupos de modificadores</p>
            <div class="section-actions">
              <button class="btn-sm" @click="abrirAsignarMod">Asignar</button>
              <button class="btn-sm" @click="abrirEditarGrupo">Editar</button>
            </div>
          </div>
          <div class="tabla-wrapper">
            <table class="tabla">
              <thead><tr><th>Clave</th><th>Descripción</th><th>Máx. modif.</th></tr></thead>
              <tbody>
                <tr v-for="g in gruposAnadidos" :key="g.idgrupomod">
                  <td>{{ g.idgrupomod }}</td>
                  <td>{{ g.nombre }}</td>
                  <td>{{ g.modificadoresmax }}</td>
                </tr>
                <tr v-if="!gruposAnadidos.length">
                  <td colspan="3" class="tabla-empty">Sin grupos asignados</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="divider" />

        <!-- Modificadores de productos -->
        <div class="section">
          <div class="section-header">
            <p class="section-title">Modificadores de productos</p>
            <div class="section-actions">
              <button class="btn-sm" @click="abrirEditarModProd">Editar</button>
            </div>
          </div>
          <div class="tabla-wrapper">
            <table class="tabla">
              <thead><tr><th>Clave</th><th>Descripción</th><th>Precio</th><th>Grupo</th></tr></thead>
              <tbody>
                <tr v-for="m in modificadores" :key="m.idmodificador">
                  <td>{{ m.idmodificador }}</td>
                  <td>{{ m.nombre }}</td>
                  <td>${{ m.precio }}</td>
                  <td>{{ obtenerNombreGrupoMod(m.idgrupomod) }}</td>
                </tr>
                <tr v-if="!modificadores.length">
                  <td colspan="4" class="tabla-empty">Sin modificadores</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <editarGrupo   :mostrar="mostrarEditarGrupo"   @cerrar="mostrarEditarGrupo = false"   @actualizado="actualizarDespuesDeEditar" />
    <editarModProd :mostrar="mostrarEditarModProd"  @cerrar="mostrarEditarModProd = false"  @actualizado="actualizarDespuesDeEditar" />
    <asignarMod    :mostrar="mostrarAsignarMod"     @cerrar="mostrarAsignarMod = false"     @actualizado="actualizarDespuesDeEditar" />
  </div>
  </transition>
</template>

<script setup>
import { defineEmits, defineProps, ref, onMounted, watch } from "vue";
import { Layers, X } from "lucide-vue-next";
import { supabase } from "../supabase/supabase.js";
import editarGrupo   from "./ProductosCompuestos/editarGrupoModificador.vue";
import editarModProd from "./ProductosCompuestos/editarModProd.vue";
import asignarMod    from "./ProductosCompuestos/asignarMod.vue";
import { cargarGruposModif, claveProducto } from "../store/auth.js";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar"]);

const mostrarEditarGrupo   = ref(false);
const mostrarEditarModProd = ref(false);
const mostrarAsignarMod    = ref(false);
const gruposAnadidos = ref([]);
const modificadores  = ref([]);

const abrirEditarGrupo   = () => { mostrarEditarGrupo.value = true; };
const abrirEditarModProd = () => { mostrarEditarModProd.value = true; };
const abrirAsignarMod    = async () => { mostrarAsignarMod.value = true; await cargarGruposModif(); };

const actualizarDespuesDeEditar = () => { cargarGruposAsignados(); obtenerModificadores(); };

const cargarGruposAsignados = async () => {
  try {
    const { data, error } = await supabase
      .from("prodgrupmodificador")
      .select(`grupomodificador!inner(*)`)
      .eq("idproducto", claveProducto.value);
    if (error) throw new Error(error.message);
    gruposAnadidos.value = data.map(item => item.grupomodificador);
  } catch (e) {
    console.error("Error al cargar grupos asignados:", e);
    gruposAnadidos.value = [];
  }
};

const obtenerNombreGrupoMod = (idgrupomod) => {
  const mod = gruposAnadidos.value.find(g => g.idgrupomod === idgrupomod);
  return mod ? mod.nombre : "Sin grupo modificador";
};

const obtenerModificadores = async () => {
  const { data, error } = await supabase.from("modificadores").select();
  if (error) { console.error("Error al obtener modificadores", error); return; }
  modificadores.value = data;
};

watch(claveProducto, (v) => { if (v != null) cargarGruposAsignados(); }, { immediate: true });
onMounted(() => { cargarGruposAsignados(); obtenerModificadores(); });
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center; z-index: 1050;
}
.modal-card {
  background: #fff; border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
  width: 620px; max-height: 88vh;
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
  background: #ede9fe; color: #7c3aed;
  display: flex; align-items: center; justify-content: center;
}
.close-btn {
  width: 28px; height: 28px; border: none; background: #f5f5f5;
  border-radius: 7px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: #888;
}
.close-btn:hover { background: #ffe5e5; color: #e53935; }
.modal-body { flex: 1; overflow-y: auto; padding: 10px 36px 32px 32px; display: flex; flex-direction: column; gap: 0; }
.section { display: flex; flex-direction: column; gap: 10px; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: 13px; font-weight: 700; color: #333; margin: 0; }
.section-actions { display: flex; gap: 6px; }
.btn-sm {
  padding: 6px 12px; border: 1.5px solid #e5e5e5; border-radius: 8px;
  background: #fff; font-size: 12px; font-weight: 600; color: #555; cursor: pointer;
  transition: all 0.15s;
}
.btn-sm:hover { background: #f5f5f5; border-color: #ccc; }
.tabla-wrapper { overflow-y: auto; max-height: 160px; }
.tabla { width: 100%; border-collapse: collapse; font-size: 13px; }
.tabla th {
  text-align: left; padding: 7px 6px; font-size: 11px; font-weight: 600; color: #aaa;
  text-transform: uppercase; border-bottom: 1px solid #f0f0f0;
  position: sticky; top: 0; background: #fff;
}
.tabla td { padding: 7px 6px; color: #333; border-bottom: 1px solid #f8f8f8; }
.tabla-empty { text-align: center; color: #ccc; padding: 12px 0; font-size: 13px; }
.divider { height: 1px; background: #f0f0f0; margin: 14px 0; flex-shrink: 0; }

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