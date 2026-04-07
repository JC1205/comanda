<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><ShoppingCart :size="18" /></div>
          <span>Captura de productos</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar'); limpiar()"><X :size="16" /></button>
      </div>

      <div class="modal-body">
        <!-- Panel izquierdo: carrito -->
        <div class="carrito-panel">
          <p class="panel-label">Carrito</p>
          <div class="tabla-wrapper">
            <table class="tabla-carrito">
              <thead>
                <tr>
                  <th>Cant.</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in carrito" :key="index">
                  <td>{{ item.cantidad }}</td>
                  <td>
                    {{ item.descripcion }}
                    <ul v-if="item.modificadores?.length" class="mod-list">
                      <li v-for="(mod, i) in item.modificadores" :key="i">
                        → {{ mod.nombre }}<span v-if="mod.precio"> (+{{ mod.precio }})</span>
                      </li>
                    </ul>
                  </td>
                  <td>{{ item.precio }}</td>
                  <td>
                    <button class="remove-btn" @click="eliminarDelCarrito(index)">
                      <Trash2 :size="13" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!carrito.length">
                  <td colspan="4" class="tabla-empty">Sin productos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Panel derecho: selección -->
        <div class="selector-panel">
          <!-- Grupos -->
          <div class="section">
            <p class="panel-label">Grupos</p>
            <div class="btn-grid">
              <button
                v-for="grupo in grupos"
                :key="grupo.idgrupo"
                class="selector-btn"
                @click="seleccionarGrupo(grupo.idgrupo)"
              >
                {{ grupo.nombre }}
              </button>
            </div>
          </div>

          <!-- Subgrupos -->
          <div v-if="subgrupos.length" class="section">
            <p class="panel-label">Subgrupos</p>
            <div class="btn-grid">
              <button
                v-for="subgrupo in subgrupos"
                :key="subgrupo.idsubgrupo"
                class="selector-btn"
                @click="productos.value = []; seleccionarSubgrupo(subgrupo.idsubgrupo)"
              >
                {{ subgrupo.nombre }}
              </button>
            </div>
          </div>

          <!-- Productos -->
          <div v-if="productos.length" class="section">
            <p class="panel-label">Productos</p>
            <div class="btn-grid btn-grid--productos">
              <button
                v-for="producto in productos"
                :key="producto.id"
                class="selector-btn selector-btn--producto"
                @click="agregarAlCarrito(producto)"
              >
                {{ producto.nombre }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="cancelar(); limpiar()">Cancelar</button>
        <button class="btn-confirm" @click="aceptar()">Aceptar</button>
      </div>
    </div>
  </div>

  <capturarCompuesto
    :mostrar="mostrarCompuesto"
    @cerrar="mostrarCompuesto = false"
    @actualizar="agregarModificadorAlCarrito()"
  />
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { supabase } from "../../supabase/supabase";
import capturarCompuesto from "./capturarCompuesto.vue";
import { idPedido, idProducto, idModificador } from "@/store/auth.js";
import { ShoppingCart, Trash2, X } from "lucide-vue-next";

const props = defineProps({ mostrar: Boolean });
const emit  = defineEmits(["cerrar", "actualizar"]);

const mostrarCompuesto = ref(null);
const grupos           = ref([]);
const subgrupos        = ref([]);
const productos        = ref([]);
const carrito          = ref([]);

const cargarGrupos = async () => {
  const { data, error } = await supabase.from("grupos").select();
  if (error) { console.error("Error al obtener grupos", error); return; }
  grupos.value = data;
};

const cargarSubGrupos = async (idgrupo) => {
  subgrupos.value = [];
  productos.value = [];
  const { data, error } = await supabase.from("subgrupos").select().eq("idgrupo", idgrupo);
  if (error) { console.error("Error al obtener SubGrupos", error); return; }
  subgrupos.value = data;
  if (subgrupos.value.length === 0) await productosGrupos(idgrupo);
};

const productosGrupos = async (idgrupo) => {
  const { data } = await supabase.from("productos").select().eq("idgrupo", idgrupo);
  productos.value = data;
};

async function seleccionarSubgrupo(idsubgrupo) {
  const { data } = await supabase.from("productos").select().eq("idsubgrupo", idsubgrupo);
  productos.value = data;
}

function seleccionarGrupo(idgrupo) { cargarSubGrupos(idgrupo); }

function limpiar() {
  carrito.value   = [];
  subgrupos.value = [];
  productos.value = [];
}

async function agregarModificadorAlCarrito() {
  const { data, error } = await supabase
    .from("modificadores").select().eq("idmodificador", idModificador.value).single();
  if (error) { console.error("Error al obtener modificador", error); return; }

  const ultimoProducto = carrito.value[carrito.value.length - 1];
  if (!ultimoProducto.modificadores) ultimoProducto.modificadores = [];
  ultimoProducto.modificadores.push({
    idmodificador: data.idmodificador,
    nombre:        data.nombre,
    precio:        data.precio,
  });
}

function agregarAlCarrito(producto) {
  carrito.value.push({
    id:            producto.idproducto,
    cantidad:      1,
    descripcion:   producto.nombre,
    precio:        producto.precio,
    modificadores: [],
  });
  if (producto.compuesto) {
    mostrarCompuesto.value = true;
    idProducto.value = producto.idproducto;
  }
}

function eliminarDelCarrito(index) {
  if (carrito.value[index].cantidad > 1) carrito.value[index].cantidad -= 1;
  else carrito.value.splice(index, 1);
}

async function aceptar() {
  try {
    const total = carrito.value.reduce((acc, item) => {
      const modTotal = item.modificadores?.reduce((s, mod) => s + (mod.precio || 0), 0) || 0;
      return acc + ((item.precio + modTotal) * item.cantidad);
    }, 0);

    const { error: errorPedido } = await supabase
      .from("pedidos").update({ totalPedido: total }).eq("idpedido", idPedido.value);
    if (errorPedido) { console.error("Error al actualizar pedido", errorPedido); return; }

    for (const item of carrito.value) {
      const { data: productoPedido, error: errorProdPed } = await supabase
        .from("productos_pedidos")
        .insert([{ idproducto: item.id, idpedido: idPedido.value, cantidad: item.cantidad }])
        .select().single();
      if (errorProdPed) { console.error(`Error al agregar producto ${item.nombre}`, errorProdPed); return; }

      if (item.modificadores?.length) {
        const modsData = item.modificadores.map(mod => ({
          idprodpedi:    productoPedido.idprodpedi,
          idmodificador: mod.idmodificador,
        }));
        const { error: errorMods } = await supabase
          .from("productos_pedidos_modificadores").insert(modsData);
        if (errorMods) { console.error("Error al insertar modificadores", errorMods); return; }
      }
    }

    limpiar();
    emit("actualizar");
    emit("cerrar");
  } catch (err) {
    console.error("Error en aceptar()", err);
  }
}

function cancelar() { carrito.value = []; }

onMounted(() => { cargarGrupos(); });
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
  width: 860px;
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
  background: #e0f2fe;
  color: #0284c7;
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

/* Body */
.modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 0;
}

/* Carrito */
.carrito-panel {
  width: 380px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.panel-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #bbb;
  margin: 0 0 10px;
}

.tabla-wrapper { flex: 1; overflow-y: auto; }

.tabla-carrito {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.tabla-carrito th {
  text-align: left;
  padding: 8px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background: #fff;
}

.tabla-carrito td {
  padding: 8px 6px;
  color: #333;
  border-bottom: 1px solid #f8f8f8;
  vertical-align: top;
}

.tabla-empty { text-align: center; color: #ccc; padding: 20px 0; }

.mod-list {
  margin: 3px 0 0 4px;
  padding: 0;
  list-style: none;
  font-size: 11px;
  color: #888;
}

.remove-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: #fff0f0;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e53935;
  transition: background 0.15s;
  padding: 0;
}
.remove-btn:hover { background: #ffd7d7; }

/* Selector */
.selector-panel {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section { display: flex; flex-direction: column; gap: 8px; }

.btn-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selector-btn {
  padding: 8px 14px;
  border: 1.5px solid #e5e5e5;
  border-radius: 9px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.selector-btn:hover { background: #f0fdf5; border-color: #2db760; color: #2db760; }

.selector-btn--producto {
  background: #f8faff;
  border-color: #dbeafe;
  color: #1d4ed8;
}
.selector-btn--producto:hover { background: #dbeafe; border-color: #1d4ed8; }

/* Footer */
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
.btn-confirm { background: #0284c7; color: #fff; }
.btn-confirm:hover { background: #0369a1; }
</style>