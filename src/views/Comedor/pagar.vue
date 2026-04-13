<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><CreditCard :size="18" /></div>
          <span>Pagar cuenta</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar'); limpiarCampos()"><X :size="16" /></button>
      </div>

      <div class="modal-body">
        <!-- Totales resumen -->
        <div class="totales-row">
          <div class="total-chip">
            <span class="chip-label">Total</span>
            <span class="chip-value">${{ totalCuenta }}</span>
          </div>
          <div class="total-chip total-chip--cambio">
            <span class="chip-label">Cambio</span>
            <span class="chip-value">${{ cambio }}</span>
          </div>
          <div class="total-chip total-chip--saldo">
            <span class="chip-label">Saldo</span>
            <span class="chip-value">${{ saldo }}</span>
          </div>
        </div>

        <!-- Formas de pago -->
        <div class="pagos-list">
          <div class="pago-row">
            <div class="pago-info">
              <span class="pago-clave">EF</span>
              <span class="pago-nombre">Efectivo</span>
            </div>
            <div class="input-wrap">
              <span class="input-prefix">$</span>
              <input v-model="efectivo" type="number" class="pago-input" placeholder="0.00" />
            </div>
          </div>
          <div class="pago-row">
            <div class="pago-info">
              <span class="pago-clave">MC</span>
              <span class="pago-nombre">Tarjeta</span>
            </div>
            <div class="input-wrap">
              <span class="input-prefix">$</span>
              <input v-model="tarjeta" type="number" class="pago-input" placeholder="0.00" />
            </div>
          </div>
          <div class="pago-row">
            <div class="pago-info">
              <span class="pago-clave">TR</span>
              <span class="pago-nombre">Transferencia</span>
            </div>
            <div class="input-wrap">
              <span class="input-prefix">$</span>
              <input v-model="transferencia" type="number" class="pago-input" placeholder="0.00" />
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('cerrar'); limpiarCampos()">Cancelar</button>
        <button class="btn-confirm" @click="confirmarPago()">Confirmar pago</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps, ref, watch, onMounted } from "vue";
import { idPedido } from "@/store/auth.js";
import { supabase } from "@/supabase/supabase";
import { CreditCard, X } from "lucide-vue-next";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizado"]);

const totalCuenta   = ref(0);
const efectivo      = ref(0);
const tarjeta       = ref(0);
const transferencia = ref(0);
const totalPago     = ref(0);
const cambio        = ref(0);
const saldo         = ref(0);

async function obtenerTotalCuenta() {
  const { data, error } = await supabase
    .from("pedidos").select().eq("idpedido", idPedido.value);
  if (error) { console.error("Error al obtener total del pedido", error); return; }
  totalCuenta.value = data[0].totalPedido;
}

watch([efectivo, tarjeta, transferencia], () => {
  totalPago.value = Number(efectivo.value || 0) + Number(tarjeta.value || 0) + Number(transferencia.value || 0);
  const diferencia = totalPago.value - totalCuenta.value;
  if (diferencia >= 0) { cambio.value = diferencia; saldo.value = 0; }
  else { saldo.value = Math.abs(diferencia); cambio.value = 0; }
});

function limpiarCampos() {
  totalCuenta.value = 0; cambio.value = 0; saldo.value = 0;
  efectivo.value = 0; tarjeta.value = 0; transferencia.value = 0;
}

async function confirmarPago() {
  if (!idPedido.value) { console.log("Debes seleccionar un pedido."); return; }
  if (cambio.value > 0 && Number(efectivo.value) === 0) {
    console.log("⚠️ No se puede dar cambio sin pago en efectivo."); return;
  }

  const { error } = await supabase
    .from("pedidos")
    .update({
      pagoEfectivo: efectivo.value,
      pagoTarjeta:  tarjeta.value,
      pagoTransfer: transferencia.value,
      abierto:      false,
    })
    .eq("idpedido", idPedido.value);

  if (error) { console.error("Error al registrar el pago", error); return; }

  limpiarCampos();
  emit("actualizado");
  emit("cerrar");
}

watch(() => props.mostrar, async (visible) => {
  if (visible) { limpiarCampos(); await obtenerTotalCuenta(); }
});

onMounted(() => { limpiarCampos(); obtenerTotalCuenta(); });
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
  width: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 36px;
  border-bottom: 1px solid #f0f0f0;
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
  background: #e6fff0;
  color: #2db760;
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

.modal-body { padding: 10px 36px 32px 32px; display: flex; flex-direction: column; gap: 16px; }

/* Totales resumen */
.totales-row { display: flex; gap: 10px; }

.total-chip {
  flex: 1;
  background: #fafafa;
  border: 1px solid #efefef;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.total-chip--cambio { border-color: #d1fae5; background: #f0fdf4; }
.total-chip--saldo  { border-color: #fee2e2; background: #fff5f5; }

.chip-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #bbb;
}

.chip-value { font-size: 16px; font-weight: 700; color: #111; }
.total-chip--cambio .chip-value { color: #2db760; }
.total-chip--saldo  .chip-value { color: #e53935; }

/* Formas de pago */
.pagos-list { display: flex; flex-direction: column; gap: 10px; }

.pago-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pago-info { display: flex; align-items: center; gap: 10px; flex: 1; }

.pago-clave {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #666;
}

.pago-nombre { font-size: 14px; font-weight: 500; color: #333; }

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  overflow: hidden;
  width: 140px;
  transition: border-color 0.2s;
}
.input-wrap:focus-within { border-color: #2db760; }

.input-prefix {
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #aaa;
  background: #fafafa;
  border-right: 1.5px solid #e5e5e5;
}

.pago-input {
  flex: 1;
  padding: 8px 10px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111;
  background: transparent;
  width: 0;
}

.pago-input::-webkit-inner-spin-button,
.pago-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 25px 36px;
  border-top: 1px solid #f0f0f0;
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
.btn-confirm { background: #2db760; color: #fff; }
.btn-confirm:hover { background: #239e51; }
</style>