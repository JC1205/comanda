<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Percent :size="18" /></div>
          <span>Descuento</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="16" /></button>
      </div>

      <div class="modal-body">
        <div class="field-group">
          <label class="field-label">Porcentaje de descuento</label>
          <div class="input-wrap">
            <span class="input-suffix">%</span>
            <input v-model="descuento" type="number" class="field-input" placeholder="0" />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('cerrar')">Cancelar</button>
        <button class="btn-confirm" @click="calcularDescuento()">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from "@/supabase/supabase";
import { defineEmits, defineProps, ref } from "vue";
import { idPedido } from "@/store/auth.js";
import { Percent, X } from "lucide-vue-next";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizar"]);

const descuento = ref(null);

async function calcularDescuento() {
  const desc = Number(descuento.value || 0);

  const { error } = await supabase
    .from("pedidos")
    .update({ descuento: desc })
    .eq("idpedido", idPedido.value);

  if (error) { console.error("Error al actualizar descuento", error); return; }

  emit("actualizar", desc);
  descuento.value = null;
  emit("cerrar");
}
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
  width: 360px;
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
  background: #fff8e1;
  color: #e08c00;
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

.modal-body { padding: 10px 36px 32px 32px; }

.field-group { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.input-wrap:focus-within { border-color: #e08c00; }

.input-suffix {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #e08c00;
  background: #fff8e1;
  border-right: 1.5px solid #e5e5e5;
}

.field-input {
  flex: 1;
  padding: 10px 14px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #111;
  background: transparent;
}

.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

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
.btn-confirm { background: #e08c00; color: #fff; }
.btn-confirm:hover { background: #c47a00; }
</style>
