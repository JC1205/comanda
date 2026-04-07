<template>
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><PlusCircle :size="18" /></div>
          <span>Abrir cuenta</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="16" /></button>
      </div>

      <div class="modal-body">
        <div class="field-group">
          <label class="field-label">Nombre de la cuenta</label>
          <input v-model="nombre" type="text" class="field-input" placeholder="Nombre" />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('cerrar')">Cancelar</button>
        <button class="btn-confirm" @click="abrirCuenta()">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from "@/supabase/supabase";
import { defineEmits, defineProps, ref, onMounted } from "vue";
import { idPedido, numPedidos, idTurno } from "@/store/auth.js";
import { PlusCircle, X } from "lucide-vue-next";

const props = defineProps(["mostrar"]);
const emit  = defineEmits(["cerrar", "actualizado"]);

const nombre = ref(null);

const now   = new Date();
const fecha = ref(now.toISOString().split("T")[0]);
const hora  = ref(now.toTimeString().split(" ")[0]);

const limpiarCampos = () => { nombre.value = null; };

const abrirCuenta = async () => {
  const { data: dataPedidos, error: errorPedidos } = await supabase
    .from("pedidos").select().eq("abierto", true);

  if (errorPedidos) { console.error("Error al obtener pedidos", errorPedidos); return; }

  const existe = dataPedidos.find(u => u.nombre === nombre.value);
  if (existe) { console.log("Ya existe una cuenta con ese nombre"); return; }

  const { data, error } = await supabase
    .from("pedidos")
    .insert([{
      nombre:        nombre.value,
      idturno:       idTurno.value,
      tipo:          "Normal",
      horaapertura:  hora.value,
      impreso:       false,
      abierto:       true,
      eliminado:     false,
      numeropedido:  (numPedidos.value + 1),
    }])
    .select();

  if (error) { console.error("Error al crear pedido", error); return; }

  idPedido.value = data[0].idpedido;
  limpiarCampos();

  const { data: result, error: error2 } = await supabase.rpc("incrementar_total_notas", {
    turno_id: idTurno.value,
  });
  if (error2) { console.error("❌ Error al aumentar pedidos", error2); return; }
  numPedidos.value = result;

  emit("actualizado");
  emit("cerrar");
};
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
  width: 340px;
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

.modal-body { padding: 20px; }

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
.field-input:focus { border-color: #2db760; }

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
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