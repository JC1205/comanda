<template>
  <transition name="fade-slide">
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">

      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Package :size="18" /></div>
          <span>Productos</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="16" /></button>
      </div>

      <div class="modal-body">

        <!-- Tabla izquierda -->
        <div class="tabla-panel">
          <p class="panel-label">Catálogo</p>
          <div class="tabla-wrapper">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Grupo</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="producto in productos"
                  :key="producto.idproducto"
                  @dblclick="seleccionarProducto(producto)"
                  :class="{ selected: clave === producto.idproducto }"
                >
                  <td>{{ producto.idproducto }}</td>
                  <td>{{ producto.idgrupo === null ? producto.idsubgrupo : producto.idgrupo + ',' + producto.idsubgrupo }}</td>
                  <td>{{ producto.nombre }}</td>
                  <td>{{ producto.precio }}</td>
                </tr>
                <tr v-if="!productos.length">
                  <td colspan="4" class="tabla-empty">Sin productos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Formulario derecho -->
        <div class="form-panel">
          <p class="panel-label">Datos del producto</p>

          <div class="fields">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Grupo</label>
                <div class="input-with-btn">
                  <input v-model="grupo" type="number" class="field-input" />
                  <button class="icon-btn" @click="abrirAggGrupo" title="Administrar grupos">
                    <Settings2 :size="13" />
                  </button>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">Subgrupo</label>
                <div class="input-with-btn">
                  <input v-model="subgrupo" type="number" class="field-input" />
                  <button class="icon-btn" @click="abrirAggSubgrupo" title="Administrar subgrupos">
                    <Settings2 :size="13" />
                  </button>
                </div>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Clave</label>
              <input v-model="clave" type="text" class="field-input" />
            </div>

            <div class="field-group">
              <label class="field-label">Descripción</label>
              <input v-model="descripcion" type="text" class="field-input" />
            </div>

            <div class="field-row">
              <div class="field-group">
                <label class="field-label">Precio</label>
                <input v-model="precio" type="number" class="field-input" @keyup.enter="calcularPrecioSinIVA" />
              </div>
              <div class="field-group">
                <label class="field-label">Sin imp.</label>
                <input v-model="preciosinimp" type="number" class="field-input field-input--readonly" readonly />
              </div>
              <div class="field-group field-group--sm">
                <label class="field-label">IVA</label>
                <input v-model="iva" type="text" class="field-input field-input--readonly" readonly />
              </div>
            </div>

            <!-- Toggle producto compuesto -->
            <div class="compuesto-row">
              <label class="toggle-label">
                <div class="toggle-wrap" :class="{ 'toggle-active': isChecked }">
                  <input v-model="isChecked" type="checkbox" class="toggle-input" />
                  <span class="toggle-slider" />
                </div>
                Producto compuesto
              </label>
              <button
                class="btn-comp"
                :class="{ 'btn-comp--active': isChecked }"
                :disabled="!isChecked"
                @click="abrirProductoComp"
              >
                Configurar
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" @click="limpiarCampos">Limpiar</button>
            <button class="btn-danger"@click="eliminarProducto" >Eliminar</button>
            <button class="btn-primary" @click="aggProducto">Guardar</button>
            
          </div>
        </div>
      </div>

    </div>

    <!-- Sub-modales intactos -->
    <productoComp :mostrar="mostrarProductoComp" @cerrar="mostrarProductoComp = false" />
    <aggGrupo    :mostrar="mostrarAggGrupo"      @cerrar="mostrarAggGrupo = false" />
    <aggSubgrupo :mostrar="mostrarAggSubgrupo"   @cerrar="mostrarAggSubgrupo = false" />
  </div>
  </transition>
</template>

<script setup>
import { defineEmits, defineProps, onMounted, ref, watch } from "vue";
import { Package, X, Settings2 } from "lucide-vue-next";
import productoComp from "./productoComp.vue";
import aggGrupo     from "./ProductosCompuestos/aggGrupo.vue";
import aggSubgrupo  from "./ProductosCompuestos/aggSubgrupo.vue";
import { supabase } from "../supabase/supabase";
import { claveProducto } from "../store/auth.js";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar"]);

const mostrarProductoComp = ref(false);
const mostrarAggGrupo     = ref(false);
const mostrarAggSubgrupo  = ref(false);
const isChecked   = ref(false);
const grupo       = ref(null);
const subgrupo    = ref(null);
const clave       = ref(null);
const descripcion = ref(null);
const precio      = ref(null);
const preciosinimp = ref(null);
const iva         = ref(16);
const hover       = ref(false);
const productos   = ref([]);

watch(iva, (v) => { if (v !== 16) iva.value = 16; });
watch(precio, (v) => { if (v) calcularPrecioSinIVA(); });

const limpiarCampos = () => {
  grupo.value = null; subgrupo.value = null; clave.value = null;
  descripcion.value = null; precio.value = null; preciosinimp.value = null;
  isChecked.value = false;
};

const abrirProductoComp = () => { if (isChecked.value) mostrarProductoComp.value = true; };
const abrirAggGrupo     = () => { mostrarAggGrupo.value = true; };
const abrirAggSubgrupo  = () => { mostrarAggSubgrupo.value = true; };


const eliminarProducto = async () => {
  if (!clave.value) {
    console.error("No hay producto seleccionado");
    return;
  }

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('idproducto', clave.value);

  if (error) {
    console.error("Error al eliminar producto", error);
  } else {
    console.log("Producto eliminado correctamente");

    // Limpiar inputs
    grupo.value = null;
    subgrupo.value = null;
    clave.value = null;
    descripcion.value = null;
    precio.value = null;
    preciosinimp.value = null;
    isChecked.value = false;

    // Recargar tabla
    consultarProductos();
  }
};

const seleccionarProducto = (producto) => {
  if (producto.idgrupo != null) grupo.value = producto.idgrupo;
  else subgrupo.value = producto.idsubgrupo;
  clave.value        = producto.idproducto;
  descripcion.value  = producto.nombre;
  precio.value       = producto.precio;
  preciosinimp.value = producto.preciosinimporte;
  isChecked.value    = producto.compuesto;
  claveProducto.value = clave.value;
};

const consultarProductos = async () => {
  const { data, error } = await supabase.from("productos").select();
  if (error) { console.error("Error al obtener productos", error); return; }
  productos.value = data;
};

const aggProducto = async () => {
  await consultarProductos();
  const existe = productos.value.find(u => u.idproducto === clave.value);
  if (existe) {
    const { error } = await supabase.from("productos").update({
      idgrupo: grupo.value, idsubgrupo: subgrupo.value || null,
      nombre: descripcion.value, precio: precio.value,
      preciosinimporte: preciosinimp.value, compuesto: isChecked.value,
    }).eq("idproducto", clave.value);
    if (error) { console.error("Error al actualizar producto", error); return; }
    console.log("Producto actualizado correctamente");
  } else {
    const { data, error } = await supabase.from("productos").insert([{
      nombre: descripcion.value, precio: precio.value,
      preciosinimporte: preciosinimp.value, compuesto: isChecked.value,
      idgrupo: grupo.value, idsubgrupo: subgrupo.value,
    }]).select();
    if (error) { console.error("Error al agregar producto", error); return; }
    clave.value = data[0].idproducto;
    console.log("Producto agregado correctamente");
  }
  await consultarProductos();
};

const calcularPrecioSinIVA = () => {
  if (precio.value) preciosinimp.value = (precio.value / (1 + iva.value / 100)).toFixed(2);
};

onMounted(() => { consultarProductos(); });
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff; border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.14);
  width: 860px; max-height: 110vh;
  display: flex; flex-direction: column; overflow: hidden;
}

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
  background: #e6fff0; color: #2db760;
  display: flex; align-items: center; justify-content: center;
}

.close-btn {
  width: 30px; height: 30px; border: none; background: #f5f5f5;
  border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #888; transition: background 0.15s;
}
.close-btn:hover { background: #ffe5e5; color: #e53935; }

.modal-body { display: flex; flex: 1; overflow: hidden; 
padding: 10px 36px 32px 32px;}

/* Tabla */
.tabla-panel {
  width: 360px; flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: flex; flex-direction: column;
  padding: 14px; overflow: hidden;
}

.panel-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #bbb; margin: 0 0 10px; flex-shrink: 0;
}

.tabla-wrapper {
  height: 450px;          /* 🔥 altura fija */
  overflow-y: auto;       /* 🔥 scroll vertical */
  overflow-x: hidden;     /* opcional */
  border-radius: 10px;
}


.tabla { width: 100%; border-collapse: collapse; font-size: 13px; }

.tabla th {
  text-align: left; padding: 8px 6px;
  font-size: 11px; font-weight: 600; color: #aaa;
  text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid #f0f0f0;
  position: sticky; top: 0; background: #fff; z-index: 1;
}

.tabla td {
  padding: 8px 6px; color: #333;
  border-bottom: 1px solid #f8f8f8; cursor: pointer;
}

.tabla tr:hover td { background: #f8f8f8; }
.tabla tr.selected td { background: #f0fdf5; }
.tabla-empty { text-align: center; color: #ccc; padding: 20px 0; font-size: 13px; }

/* Formulario */
.form-panel {
  flex: 1; display: flex; flex-direction: column;
  padding: 14px 18px; overflow-y: auto;
}

.fields { display: flex; flex-direction: column; gap: 10px; flex: 1; }

.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-group--sm { max-width: 90px; }
.field-row { display: flex; gap: 12px; }
.field-row .field-group { flex: 1; }

.field-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: #bbb;
}

.field-input {
  padding: 9px 12px;
  border: 1.5px solid #e5e5e5; border-radius: 9px;
  font-size: 13px; color: #111; outline: none;
  transition: border-color 0.2s; width: 100%; box-sizing: border-box;
}
.field-input:focus { border-color: #2db760; }
.field-input--readonly { background: #fafafa; color: #999; cursor: default; }

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.input-with-btn { display: flex; gap: 6px; }
.input-with-btn .field-input { flex: 1; }

.icon-btn {
  width: 36px; height: 36px; flex-shrink: 0;
  border: 1.5px solid #e5e5e5; border-radius: 9px;
  background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #888; transition: all 0.15s;
}
.icon-btn:hover { background: #f5f5f5; border-color: #ccc; }

/* Toggle compuesto */
.compuesto-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  background: #fafafa; border: 1.5px solid #efefef; border-radius: 10px;
}

.toggle-label {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 600; color: #333; cursor: pointer;
}

.toggle-wrap {
  width: 36px; height: 20px; border-radius: 20px;
  background: #ddd; position: relative; transition: background 0.2s; flex-shrink: 0;
}
.toggle-wrap.toggle-active { background: #2db760; }
.toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; top: 2px; left: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-active .toggle-slider { transform: translateX(16px); }

.btn-comp {
  padding: 7px 14px;
  border: 1.5px solid #e5e5e5; border-radius: 9px;
  background: #fff; font-size: 12px; font-weight: 600;
  color: #bbb; cursor: not-allowed; transition: all 0.15s;
}
.btn-comp--active { border-color: #2db760; color: #2db760; cursor: pointer; }
.btn-comp--active:hover { background: #f0fdf5; }

.btn-danger {
  padding: 9px 16px;
  border: 1.5px solid #fecaca; border-radius: 9px;
  background: #fff; font-size: 13px; font-weight: 600;
  color: #e53935; cursor: pointer; transition: all 0.15s;
}

/* Acciones */
.form-actions {
  display: flex; gap: 8px;
  padding-top: 12px; margin-top: 8px;
  border-top: 1px solid #f0f0f0; flex-shrink: 0;
}

.btn-secondary {
  padding: 9px 18px;
  border: 1.5px solid #e5e5e5; border-radius: 9px;
  background: #fff; font-size: 13px; font-weight: 600;
  color: #555; cursor: pointer; transition: all 0.15s;
}
.btn-secondary:hover { background: #f5f5f5; }

.btn-primary {
  flex: 1; padding: 9px 18px; border: none; border-radius: 9px;
  background: #2db760; font-size: 13px; font-weight: 600;
  color: #fff; cursor: pointer; transition: all 0.15s;
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