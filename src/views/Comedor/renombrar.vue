<template>
  <transition name="fade-slide">
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Pencil :size="18" /></div>
          <span>Renombrar cuenta</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="16" /></button>
      </div>

      <div class="modal-body">
        <div class="field-group">
          <label class="field-label">Nombre actual</label>
          <input v-model="nombreActual" type="text" class="field-input field-input--readonly" readonly />
        </div>
        <div class="field-group" style="margin-top: 12px;">
          <label class="field-label">Nombre nuevo</label>
          <input v-model="nombreNuevo" type="text" class="field-input" placeholder="Nuevo nombre..." />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('cerrar')">Cancelar</button>
        <button class="btn-confirm" @click="upNombrePedido()">Confirmar</button>
      </div>
    </div>
  </div>
  </transition>
</template>

<script setup>
import { supabase } from "@/supabase/supabase";
import { defineEmits, defineProps, ref, onMounted, watch } from "vue";
import { idPedido } from "@/store/auth.js";
import { Pencil, X } from "lucide-vue-next";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizado"]);

const nombreActual = ref(null);
const nombreNuevo  = ref(null);
const pedido       = ref([]);

const cargarPedido = async () => {
  const { data } = await supabase
    .from("pedidos").select().eq("idpedido", idPedido.value);
  pedido.value = data[0];
  nombreActual.value = pedido.value?.nombre;
};

const upNombrePedido = async () => {
  if (!nombreNuevo.value) { console.error("Ingrese nombre nuevo"); return; }

  const { data: dataPedidos, error: errorPedidos } = await supabase
    .from("pedidos").select().eq("abierto", true);
  if (errorPedidos) { console.error("Error al obtener pedidos", errorPedidos); return; }

  const existe = dataPedidos.find(u => u.nombre === nombreNuevo.value);
  if (existe) { console.log("Ya existe una cuenta con ese nombre"); return; }

  const { error } = await supabase
    .from("pedidos")
    .update({ nombre: nombreNuevo.value })
    .eq("idpedido", idPedido.value);

  if (error) { console.error("Error al actualizar nombre", error); return; }

  emit("actualizado");
  limpiarCampos();
  emit("cerrar");
};

const limpiarCampos = () => { nombreActual.value = null; nombreNuevo.value = null; };

watch(idPedido, (val) => { if (val != null) cargarPedido(); }, { immediate: true });
onMounted(() => { if (idPedido.value) cargarPedido(); });
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
  width: 380px;
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
  background: #ede9fe;
  color: #7c3aed;
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

.field-input {
  padding: 10px 14px;
  border: 1.5px solid #e5e5e5;
  border-radius: 10px;
  font-size: 14px;
  color: #111;
  outline: none;
  transition: border-color 0.2s;
}
.field-input:focus { border-color: #7c3aed; }
.field-input--readonly { background: #fafafa; color: #999; cursor: default; }

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
.btn-confirm { background: #7c3aed; color: #fff; }
.btn-confirm:hover { background: #6d28d9; }

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