<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">

      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Layers :size="18" /></div>
          <span>Captura productos compuestos</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="16" /></button>
      </div>

      <div class="modal-body">

        <!-- Grupos de modificadores -->
        <div class="section">
          <p class="panel-label">Grupos</p>
          <div class="btn-grid">
            <button
              v-for="(grupo, index) in grupModifcadores"
              :key="grupo.idgrupomod"
              class="selector-btn"
              :class="{ 'selector-btn--active': grupoSeleccionadoId === grupo.idgrupomod }"
              @click="mostrarGrupo(index)"
            >
              {{ grupo.nombre }}
              <span class="mod-max-badge">máx. {{ grupo.modificadoresmax }}</span>
            </button>
          </div>
        </div>

        <!-- Modificadores del grupo seleccionado -->
        <div v-if="modificadores?.length" class="section">
          <div class="section-header">
            <p class="panel-label">Modificadores</p>
            <span class="restantes-badge">
              Restantes: {{ modMaximo }}
            </span>
          </div>
          <div class="btn-grid">
            <button
              v-for="modificador in modificadores"
              :key="modificador.idmodificador"
              class="selector-btn selector-btn--mod"
              :disabled="modMaximo === 0"
              @click="agregarModificador(modificador.idmodificador)"
            >
              {{ modificador.nombre }}
            </button>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-if="!grupModifcadores.length" class="empty-state">
          <Layers :size="32" class="empty-icon" />
          <p>Cargando grupos de modificadores...</p>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { supabase } from "@/supabase/supabase";
import { defineEmits, defineProps, nextTick, ref, watch } from "vue";
import { Layers, X } from "lucide-vue-next";
import { idProducto, idModificador } from "@/store/auth.js";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizar"]);

const grupModifcadores    = ref([]);
const modificadores       = ref(null);
const cantidadgrupMod     = ref(0);
const contadorgrup        = ref(0);
const modMaximo           = ref(0);
const grupoSeleccionadoId = ref(null);

// ── Cargar grupos de modificadores del producto activo ────────
async function cargarGruposModificadores() {
  const { data, error } = await supabase
    .from("prodgrupmodificador")
    .select(`
      idprodgrupmod,
      idgrupomod,
      grupomodificador (
        nombre,
        modificadoresmax
      )
    `)
    .eq("idproducto", idProducto.value);

  if (error) { console.error("Error gruposmod", error); return; }

  grupModifcadores.value = data.map(item => ({
    idgrupomod:       item.idgrupomod,
    nombre:           item.grupomodificador?.nombre ?? "",
    modificadoresmax: item.grupomodificador?.modificadoresmax ?? 0,
  }));

  cantidadgrupMod.value = grupModifcadores.value.length;
  modMaximo.value       = grupModifcadores.value[0]?.modificadoresmax ?? 0;

  await nextTick();
  cargarModificadores();
}

// ── Cargar modificadores del grupo actual ─────────────────────
async function cargarModificadores() {
  if (contadorgrup.value === cantidadgrupMod.value) {
    emit("cerrar");
    return;
  }

  const idgrupo = grupModifcadores.value[contadorgrup.value].idgrupomod;

  const { data, error } = await supabase
    .from("modificadores").select().eq("idgrupomod", idgrupo);
  if (error) { console.error("Error al obtener modificadores", error); return; }
  modificadores.value = data;

  const { data: data2, error: error2 } = await supabase
    .from("grupomodificador").select().eq("idgrupomod", idgrupo);
  if (error2) { console.error("Error al obtener grupoMod", error2); return; }
  modMaximo.value = data2[0].modificadoresmax;
}

// ── Seleccionar grupo manualmente ─────────────────────────────
function mostrarGrupo(index) {
  grupoSeleccionadoId.value = grupModifcadores.value[index].idgrupomod;
  contadorgrup.value        = index;
  cargarModificadores();
}

// ── Agregar modificador al carrito ────────────────────────────
async function agregarModificador(idmodificador) {
  modMaximo.value--;
  idModificador.value = idmodificador;
  emit("actualizar");

  if (modMaximo.value === 0) {
    contadorgrup.value++;
    cargarModificadores();
  }
}

// ── Limpiar al cerrar ─────────────────────────────────────────
function limpiarEstado() {
  setTimeout(() => {
    grupModifcadores.value    = [];
    modificadores.value       = null;
    cantidadgrupMod.value     = 0;
    contadorgrup.value        = 0;
    modMaximo.value           = 0;
    grupoSeleccionadoId.value = null;
  }, 200);
}

watch(idProducto, (v) => {
  if (v != null) cargarGruposModificadores();
}, { immediate: true });

watch(() => props.mostrar, async (visible) => {
  if (visible) {
    await cargarGruposModificadores();
  } else {
    limpiarEstado();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100;
}

.modal-card {
  background: #fff; border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
  width: 520px; max-height: 85vh;
  display: flex; flex-direction: column; overflow: hidden;
}

/* ── Header ────────────────────────────────────────────────── */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 25px 36px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}

.modal-header-left {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700; color: #111;
}

.modal-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: #ede9fe; color: #7c3aed;
  display: flex; align-items: center; justify-content: center;
}

.close-btn {
  width: 30px; height: 30px; border: none; background: #f5f5f5;
  border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #888; transition: background 0.15s;
}
.close-btn:hover { background: #ffe5e5; color: #e53935; }

/* ── Body ──────────────────────────────────────────────────── */
.modal-body {
  flex: 1; overflow-y: auto;
  padding: 16px; display: flex; flex-direction: column; gap: 20px;
}

.section { display: flex; flex-direction: column; gap: 10px; }

.section-header {
  display: flex; align-items: center; justify-content: space-between;
}

.panel-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #bbb; margin: 0;
}

.restantes-badge {
  font-size: 12px; font-weight: 700;
  background: #ede9fe; color: #7c3aed;
  padding: 3px 10px; border-radius: 20px;
}

/* ── Botones de grupos ─────────────────────────────────────── */
.btn-grid { display: flex; flex-wrap: wrap; gap: 8px; }

.selector-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 14px;
  border: 1.5px solid #e5e5e5; border-radius: 10px;
  background: #fff; font-size: 13px; font-weight: 600;
  color: #444; cursor: pointer; transition: all 0.15s ease;
}

.selector-btn:hover:not(:disabled) {
  background: #f3f0ff; border-color: #7c3aed; color: #7c3aed;
}

.selector-btn--active {
  background: #f3f0ff; border-color: #7c3aed; color: #7c3aed;
}

.selector-btn--mod {
  background: #fafafa; border-color: #e5e5e5; color: #333;
}
.selector-btn--mod:hover:not(:disabled) {
  background: #f0fdf5; border-color: #2db760; color: #2db760;
}
.selector-btn--mod:disabled {
  opacity: 0.35; cursor: not-allowed;
}

.mod-max-badge {
  font-size: 10px; font-weight: 600;
  background: #ede9fe; color: #7c3aed;
  padding: 2px 7px; border-radius: 20px;
}

/* ── Estado vacío ──────────────────────────────────────────── */
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; color: #ccc; padding: 32px;
}

.empty-state p { font-size: 13px; margin: 0; }
.empty-icon { opacity: 0.3; }
</style>