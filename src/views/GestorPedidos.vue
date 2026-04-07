<template>
  <div class="gestor-wrapper">
    <div class="pedidos-card">

      <!-- ── HEADER ─────────────────────────────────────────── -->
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrap" :class="tabActivo === 'domicilio' ? 'icon-wrap--delivery' : 'icon-wrap--comedor'">
            <component :is="tabActivo === 'comedor' ? UtensilsCrossed : Bike" :size="22" />
          </div>
          <div>
            <h2 class="card-title">Pedidos</h2>
            <p class="card-subtitle">
              {{ tabActivo === 'comedor' ? 'Gestión de mesas y cuentas' : 'Pedidos a domicilio' }}
            </p>
          </div>
        </div>
        <div class="tab-switcher">
          <button class="tab-btn" :class="{ active: tabActivo === 'comedor' }" @click="cambiarTab('comedor')">
            <UtensilsCrossed :size="15" /> Comedor
          </button>
          <button class="tab-btn" :class="{ active: tabActivo === 'domicilio' }" @click="cambiarTab('domicilio')">
            <Bike :size="15" /> Domicilio
          </button>
        </div>
      </div>

      <div class="divider" />

      <!-- ── BODY ───────────────────────────────────────────── -->
      <div class="card-body">

        <!-- ── COLUMNA IZQUIERDA: lista de pedidos ──────────── -->
        <div class="lista-panel">
          <p class="lista-label">Cuentas abiertas</p>

          <div v-if="tabActivo === 'comedor'" class="lista-scroll">
            <div
              v-for="pedido in comedor.pedidosAbiertos.value"
              :key="pedido.idpedido"
              class="pedido-row"
              :class="{ selected: comedor.folio.value === pedido.idpedido }"
              @click="comedor.obtenerPedido(pedido)"
            >
              <div class="pedido-row-left">
                <span class="pedido-nombre">{{ pedido.nombre }}</span>
                <span class="pedido-id"># {{ pedido.idpedido }}</span>
              </div>
              <span class="badge-impreso" :class="pedido.impreso ? 'badge-ok' : 'badge-pending'">
                {{ pedido.impreso ? 'Imp.' : 'Pend.' }}
              </span>
            </div>
            <p v-if="!comedor.pedidosAbiertos.value.length" class="lista-empty">Sin cuentas abiertas</p>
          </div>

          <div v-else class="lista-scroll">
            <div
              v-for="pedido in domicilio.pedidosAbiertos.value"
              :key="pedido.idpedido"
              class="pedido-row"
              :class="{ selected: domicilio.folio.value === pedido.idpedido }"
              @click="domicilio.obtenerPedido(pedido)"
            >
              <div class="pedido-row-left">
                <span class="pedido-nombre">{{ pedido.nombrecliente }}</span>
                <span class="pedido-id">Tel: {{ pedido.telefono }}</span>
              </div>
              <span class="badge-impreso" :class="pedido.impreso ? 'badge-ok' : 'badge-pending'">
                {{ pedido.impreso ? 'Imp.' : 'Pend.' }}
              </span>
            </div>
            <p v-if="!domicilio.pedidosAbiertos.value.length" class="lista-empty">Sin pedidos activos</p>
          </div>
        </div>

        <!-- ── COLUMNA DERECHA: detalle ─────────────────────── -->
        <div class="detalle-panel">

          <!-- Info chips -->
          <div class="info-grid">
            <template v-if="tabActivo === 'comedor'">
              <div class="info-chip">
                <span class="chip-label">Cuenta</span>
                <span class="chip-value">{{ comedor.cuenta.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Folio</span>
                <span class="chip-value">{{ comedor.folio.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Orden</span>
                <span class="chip-value">{{ comedor.orden.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Apertura</span>
                <span class="chip-value">{{ comedor.horaApertura.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Impresión</span>
                <span class="chip-value">{{ comedor.horaImpresa.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Impreso</span>
                <span class="chip-value">
                  <span class="dot" :class="comedor.checkimpreso.value ? 'dot-ok' : 'dot-no'" />
                  {{ comedor.checkimpreso.value ? 'Sí' : 'No' }}
                </span>
              </div>
            </template>

            <template v-else>
              <div class="info-chip">
                <span class="chip-label">Cliente</span>
                <span class="chip-value">{{ domicilio.cliente.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Folio</span>
                <span class="chip-value">{{ domicilio.folio.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Orden</span>
                <span class="chip-value">{{ domicilio.orden.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Apertura</span>
                <span class="chip-value">{{ domicilio.horaApertura.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Impresión</span>
                <span class="chip-value">{{ domicilio.horaImpresa.value ?? '—' }}</span>
              </div>
              <div class="info-chip">
                <span class="chip-label">Impreso</span>
                <span class="chip-value">
                  <span class="dot" :class="domicilio.checkimpreso.value ? 'dot-ok' : 'dot-no'" />
                  {{ domicilio.checkimpreso.value ? 'Sí' : 'No' }}
                </span>
              </div>
              <div class="info-chip info-chip--wide">
                <span class="chip-label">Dirección</span>
                <span class="chip-value chip-value--sm">{{ domicilio.direccionCompleta.value ?? '—' }}</span>
              </div>
            </template>
          </div>

          <!-- Tabla de productos -->
          <div class="tabla-wrapper">
            <table class="tabla-productos">
              <thead>
                <tr>
                  <th>Cant.</th>
                  <th>Clave</th>
                  <th>Descripción</th>
                  <th>Precio</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="tabActivo === 'comedor'">
                  <tr v-for="(item, i) in comedor.productosPedido.value" :key="i">
                    <td>{{ item.cantidad }}</td>
                    <td>{{ item.id }}</td>
                    <td>
                      {{ item.descripcion }}
                      <ul v-if="item.modificadores?.length" class="mod-list">
                        <li v-for="(m, j) in item.modificadores" :key="j">
                          → {{ m.nombre }}<span v-if="m.precio"> (+{{ m.precio }})</span>
                        </li>
                      </ul>
                    </td>
                    <td>{{ item.precio?.toFixed(2) ?? '0.00' }}</td>
                    <td>{{ ((Number(item.precio ?? 0) + (item.modificadores?.reduce((a, m) => a + Number(m.precio || 0), 0) || 0)) * Number(item.cantidad || 1)).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="!comedor.productosPedido.value.length">
                    <td colspan="5" class="tabla-empty">Selecciona un pedido</td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="(item, i) in domicilio.productosPedido.value" :key="i">
                    <td>{{ item.cantidad }}</td>
                    <td>{{ item.id }}</td>
                    <td>
                      {{ item.descripcion }}
                      <ul v-if="item.modificadores?.length" class="mod-list">
                        <li v-for="(m, j) in item.modificadores" :key="j">
                          + {{ m.nombre }} (${{ m.precio }})
                        </li>
                      </ul>
                    </td>
                    <td>${{ item.precio?.toFixed(2) }}</td>
                    <td>${{ ((item.precio + (item.modificadores?.reduce((s, m) => s + Number(m.precio || 0), 0) || 0)) * item.cantidad).toFixed(2) }}</td>
                  </tr>
                  <tr v-if="!domicilio.productosPedido.value.length">
                    <td colspan="5" class="tabla-empty">Selecciona un pedido</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <!-- Footer: botones + totales -->
          <div class="footer-row">
            <div class="acciones">
              <template v-if="tabActivo === 'comedor'">
                <button class="btn-accion" @click="mostrarAbrir = true">Abrir cuenta</button>
                <button class="btn-accion" @click="abrirShared('descuento', 'comedor')">Descuento</button>
                <button class="btn-accion" @click="abrirShared('captura', 'comedor')">Captura</button>
                <button class="btn-accion" @click="abrirRenombrar">Renombrar</button>
                <button class="btn-accion" @click="comedor.imprimirPedido()">Imprimir</button>
                <button
                  class="btn-accion btn-accion--primary"
                  :disabled="!comedor.checkimpreso.value"
                  :title="!comedor.checkimpreso.value ? 'Debes imprimir antes de pagar' : ''"
                  @click="abrirPagarComedor"
                >Pagar cuenta</button>
              </template>
              <template v-else>
                <button class="btn-accion" @click="abrirAggClientes">Abrir cuenta</button>
                <button class="btn-accion" @click="abrirShared('descuento', 'domicilio')">Descuento</button>
                <button class="btn-accion" @click="abrirShared('captura', 'domicilio')">Captura</button>
                <button class="btn-accion" @click="domicilio.imprimirPedido()">Imprimir</button>
                <button
                  class="btn-accion btn-accion--primary"
                  :disabled="!domicilio.checkimpreso.value"
                  :title="!domicilio.checkimpreso.value ? 'Debes imprimir antes de pagar' : ''"
                  @click="abrirPagarDomicilio"
                >Pagar cuenta</button>
              </template>
            </div>

            <div class="totales-box">
              <template v-if="tabActivo === 'comedor'">
                <div class="total-row"><span>Subtotal</span><strong>{{ comedor.subtotal.value ?? '$0.00' }}</strong></div>
                <div class="total-row"><span>Descuento</span><strong>{{ comedor.descuent.value ?? '0%' }}</strong></div>
                <div class="total-row"><span>Impuestos</span><strong>{{ comedor.impuestos.value ?? '$0.00' }}</strong></div>
                <div class="total-row"><span>Sin desc.</span><strong>{{ comedor.totalsindesc.value ?? '$0.00' }}</strong></div>
                <div class="total-row total-row--final"><span>Total</span><strong>{{ comedor.total.value ?? '$0.00' }}</strong></div>
              </template>
              <template v-else>
                <div class="total-row"><span>Subtotal</span><strong>{{ domicilio.subtotal.value ?? '$0.00' }}</strong></div>
                <div class="total-row"><span>Descuento</span><strong>{{ domicilio.descuent.value ?? '0%' }}</strong></div>
                <div class="total-row"><span>Impuestos</span><strong>{{ domicilio.impuestos.value ?? '$0.00' }}</strong></div>
                <div class="total-row"><span>Sin desc.</span><strong>{{ domicilio.totalsindesc.value ?? '$0.00' }}</strong></div>
                <div class="total-row total-row--final"><span>Total</span><strong>{{ domicilio.total.value ?? '$0.00' }}</strong></div>
              </template>
            </div>
          </div>

        </div>
      </div>

      <!-- ── MODALES dentro del root div ──────────────────────── -->

      <!-- Comedor exclusivos -->
      <abrir
        :mostrar="mostrarAbrir"
        @cerrar="mostrarAbrir = false"
        @actualizado="comedor.actualizarDespuesDeEditar()"
      />
      <renombrar
        :mostrar="mostrarRenombrar"
        @cerrar="mostrarRenombrar = false"
        @actualizado="comedor.actualizarDespuesDeEditar()"
      />
      <pagar
        :mostrar="mostrarPagar"
        @cerrar="mostrarPagar = false"
        @actualizado="comedor.cargarPedidosAbiertos(); comedor.limpiarCampos()"
      />

      <!-- Domicilio exclusivos -->
      <aggClientes
        :mostrar="mostrarAggClientes"
        @cerrar="mostrarAggClientes = false"
        @actualizado="domicilio.actualizarDespuesDeEditar()"
      />
      <pagar
        :mostrar="mostrarPagarDom"
        @cerrar="mostrarPagarDom = false"
        @actualizado="domicilio.cargarPedidosAbiertos(); domicilio.limpiarCampos()"
      />

      <!-- Compartidos: una instancia, callback según tab activo -->
      <captura
        :mostrar="mostrarCaptura"
        @cerrar="mostrarCaptura = false"
        @actualizar="onActualizarCaptura"
      />
      <descuento
        :mostrar="mostrarDescuento"
        @cerrar="mostrarDescuento = false"
        @actualizar="onActualizarDescuento"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { UtensilsCrossed, Bike } from "lucide-vue-next";

import { useComedor }   from "@/views/composables/useComedor.js";
import { useDomicilio } from "@/views/composables/useDomicilio.js";

import abrir       from "./Comedor/abrir.vue";
import renombrar   from "./Comedor/renombrar.vue";
import pagar       from "./Comedor/pagar.vue";
import captura     from "./Comedor/captura.vue";
import descuento   from "./Comedor/descuento.vue";
import aggClientes from "./Domicilio/aggClientes.vue";

import { idPedido, idCliente } from "@/store/auth.js";

// ── Tab ───────────────────────────────────────────────────────
const tabActivo  = ref("comedor");

// Al cambiar de tab sincronizamos idPedido global con el pedido
// seleccionado en ese tab, evitando que se pisen entre composables.
const cambiarTab = (tab) => {
  tabActivo.value = tab;
  if (tab === "comedor") {
    idPedido.value = comedor.folio.value;
  } else {
    idPedido.value = domicilio.folio.value;
  }
};

// ── Composables ───────────────────────────────────────────────
const comedor   = useComedor();
const domicilio = useDomicilio();

// ── Modales ───────────────────────────────────────────────────
const mostrarAbrir       = ref(false);
const mostrarRenombrar   = ref(false);
const mostrarPagar       = ref(false);
const mostrarAggClientes = ref(false);
const mostrarPagarDom    = ref(false);
const mostrarCaptura     = ref(false);
const mostrarDescuento   = ref(false);

// ── Modales compartidos (captura y descuento) ─────────────────
// Siempre sincroniza idPedido antes de abrir
const tabShared = ref("comedor"); // recuerda para qué tab se abrió

const abrirShared = (modal, tab) => {
  tabShared.value = tab;
  idPedido.value  = tab === "comedor" ? comedor.folio.value : domicilio.folio.value;
  if (modal === "captura")   mostrarCaptura.value   = true;
  if (modal === "descuento") mostrarDescuento.value = true;
};

const onActualizarCaptura = () => {
  tabShared.value === "comedor"
    ? comedor.cargarProductosPedido()
    : domicilio.cargarProductosPedido();
};

const onActualizarDescuento = () => {
  tabShared.value === "comedor"
    ? comedor.cargarProductosPedido()
    : domicilio.cargarProductosPedido();
};

// ── Renombrar ─────────────────────────────────────────────────
const abrirRenombrar = () => {
  idPedido.value = comedor.folio.value;
  mostrarRenombrar.value = true;
};

// ── Pagar comedor ─────────────────────────────────────────────
const abrirPagarComedor = async () => {
  if (!comedor.checkimpreso.value) return;
  idPedido.value = comedor.folio.value;
  await comedor.actualizarTotalPedido();
  mostrarPagar.value = false;
  await nextTick();
  idPedido.value = idPedido.value + 1;
  idPedido.value = idPedido.value - 1;
  mostrarPagar.value = true;
};

// ── Pagar domicilio ───────────────────────────────────────────
const abrirPagarDomicilio = async () => {
  if (!domicilio.checkimpreso.value) return;
  idPedido.value = domicilio.folio.value;
  await domicilio.actualizarTotalPedido();
  mostrarPagarDom.value = false;
  await nextTick();
  idPedido.value = idPedido.value + 1;
  idPedido.value = idPedido.value - 1;
  mostrarPagarDom.value = true;
};

// ── Abrir cuenta domicilio ────────────────────────────────────
const abrirAggClientes = () => {
  idCliente.value = null;
  mostrarAggClientes.value = true;
};

// ── Carga inicial ─────────────────────────────────────────────
onMounted(() => {
  comedor.cargarPedidosAbiertos();
  domicilio.cargarPedidosAbiertos();
});
</script>

<style scoped>
.gestor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.pedidos-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.09);
  width: 100%;
  max-width: 1100px;
  height: 100%;
  max-height: 620px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative; /* necesario para que los modales position:fixed funcionen */
}

/* ── Header ────────────────────────────────────────────────── */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 14px; }

.icon-wrap {
  width: 46px; height: 46px;
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.25s, color 0.25s;
}
.icon-wrap--comedor  { background: #e6fff0; color: #2db760; }
.icon-wrap--delivery { background: #fff3e0; color: #e07c00; }

.card-title    { font-size: 17px; font-weight: 700; color: #111; margin: 0; }
.card-subtitle { font-size: 12px; color: #aaa; margin: 2px 0 0; }

/* ── Tabs ──────────────────────────────────────────────────── */
.tab-switcher {
  display: flex; gap: 6px;
  background: #f4f4f4;
  border-radius: 12px;
  padding: 4px;
}

.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border: none; border-radius: 9px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; color: #888;
  background: transparent;
  transition: all 0.2s ease;
}
.tab-btn.active { background: #fff; color: #111; box-shadow: 0 1px 6px rgba(0,0,0,0.1); }
.tab-btn.active:first-child { color: #2db760; }
.tab-btn.active:last-child  { color: #e07c00; }

/* ── Divider ───────────────────────────────────────────────── */
.divider { height: 1px; background: #f0f0f0; flex-shrink: 0; }

/* ── Body: fila horizontal ─────────────────────────────────── */
.card-body {
  display: flex;
  flex-direction: row;   /* lista a la izquierda, detalle a la derecha */
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ── Lista izquierda ───────────────────────────────────────── */
.lista-panel {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #f0f0f0;
  display: block;
  flex-direction: column;
  overflow: hidden;
  padding-top: 12px;
}

.lista-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #bbb;
  padding: 0 14px 8px;
  flex-shrink: 0;
}

.lista-scroll { flex: 1; overflow-y: auto; }

.pedido-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 0.15s, border-color 0.15s;
}
.pedido-row:hover    { background: #f8f8f8; }
.pedido-row.selected { background: #f0fdf5; border-left-color: #2db760; }

.pedido-row-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pedido-nombre   { font-size: 13px; font-weight: 600; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pedido-id       { font-size: 11px; color: #aaa; }

.badge-impreso { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; flex-shrink: 0; }
.badge-ok      { background: #e6fff0; color: #2db760; }
.badge-pending { background: #fff8e1; color: #e08c00; }

.lista-empty { font-size: 12px; color: #ccc; text-align: center; padding: 20px 14px; }

/* ── Detalle derecho ───────────────────────────────────────── */
.detalle-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* Info chips */
.info-grid {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 12px 16px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-chip {
  display: flex; flex-direction: column; gap: 2px;
  background: #fafafa; border: 1px solid #efefef;
  border-radius: 10px; padding: 7px 11px;
  min-width: 82px;
}
.info-chip--wide { flex: 1; min-width: 180px; }

.chip-label {
  font-size: 10px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: #bbb;
}
.chip-value {
  font-size: 13px; font-weight: 600; color: #222;
  display: flex; align-items: center; gap: 5px;
}
.chip-value--sm { font-size: 11px; font-weight: 500; color: #555; }

.dot    { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-ok { background: #2db760; }
.dot-no { background: #ddd; }

/* ── Tabla ─────────────────────────────────────────────────── */
.tabla-wrapper { flex: 1; overflow-y: auto; padding: 0 16px; min-height: 0; }

.tabla-productos { width: 100%; border-collapse: collapse; font-size: 13px; }

.tabla-productos thead tr { position: sticky; top: 0; background: #fff; z-index: 1; }

.tabla-productos th {
  text-align: left; padding: 9px 7px;
  color: #aaa; font-weight: 600; font-size: 11px;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid #f0f0f0;
}

.tabla-productos td {
  padding: 8px 7px; color: #333;
  border-bottom: 1px solid #f8f8f8;
  vertical-align: top;
}

.tabla-empty { text-align: center; color: #ccc; font-size: 13px; padding: 18px 0; }

.mod-list {
  margin: 3px 0 0 3px; padding: 0;
  list-style: none; font-size: 11px; color: #888;
}

/* ── Footer ────────────────────────────────────────────────── */
.footer-row {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 10px 16px 14px;
  border-top: 1px solid #f0f0f0;
  gap: 12px; flex-shrink: 0;
}

.acciones { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; align-items: flex-end; }

.btn-accion {
  padding: 7px 13px;
  font-size: 12px; font-weight: 600;
  border: 1.5px solid #e5e5e5; border-radius: 9px;
  background: #fff; color: #444;
  cursor: pointer; transition: all 0.15s ease;
  white-space: nowrap;
}
.btn-accion:hover:not(:disabled) { background: #f5f5f5; border-color: #ccc; }
.btn-accion:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-accion--primary { background: #2db760; border-color: #2db760; color: #fff; }
.btn-accion--primary:hover:not(:disabled) { background: #239e51; border-color: #239e51; }

/* ── Totales ────────────────────────────────────────────────── */
.totales-box {
  display: flex; flex-direction: column; gap: 4px;
  min-width: 180px;
  background: #fafafa; border: 1px solid #efefef;
  border-radius: 12px; padding: 10px 14px;
  flex-shrink: 0;
}

.total-row {
  display: flex; justify-content: space-between;
  font-size: 12px; color: #666; gap: 20px;
}
.total-row strong { color: #222; font-weight: 600; }

.total-row--final {
  padding-top: 5px; margin-top: 2px;
  border-top: 1px solid #e8e8e8;
  font-size: 13px;
}
.total-row--final span   { color: #111; font-weight: 700; }
.total-row--final strong { color: #2db760; font-size: 14px; }
</style>