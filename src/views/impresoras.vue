<template>
    <transition name="fade-slide">
  <div v-if="mostrar" class="modal-overlay">
    <div class="modal-card">

      <div class="modal-header">
        <div class="modal-header-left">
          <div class="modal-icon"><Printer :size="18" /></div>
          <span>Impresoras</span>
        </div>
        <button class="close-btn" @click="$emit('cerrar')"><X :size="16" /></button>
      </div>

      <div class="modal-body">

        <!-- Selector de impresora -->
        <div class="field-group">
          <label class="field-label">Impresora seleccionada</label>
          <select v-model="selectedPrinter" class="field-input field-select">
            <option v-for="printer in printers" :key="printer.name" :value="printer.name">
              {{ printer.name }}
            </option>
            <option v-if="!printers.length" disabled>Sin impresoras detectadas</option>
          </select>
        </div>

        <!-- Vista previa -->
        <div class="preview-section">
          <p class="field-label">Vista previa del ticket</p>
          <div class="ticket-preview">
            <pre class="ticket-pre">{{ formattedTicket }}</pre>
          </div>
        </div>

        <!-- Mensaje de estado -->
        <div v-if="message" class="message-row" :class="message.startsWith('✅') ? 'msg-ok' : 'msg-err'">
          {{ message }}
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('cerrar')">Cancelar</button>
        <button class="btn-confirm" @click="printTest">
          <Printer :size="14" />
          Imprimir prueba
        </button>
      </div>

    </div>
  </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed, onMounted } from "vue";
import { Printer, X } from "lucide-vue-next";

const props = defineProps({ mostrar: Boolean });
const emit  = defineEmits(["cerrar"]);

const printers        = ref([]);
const selectedPrinter = ref("");
const message         = ref("");

const ticketData = {
  titulo:  "*** Pio Pio Bonless and wings ***",
  pedido:  "1234",
  items: [
    { nombre: "Boneless",  cantidad: 1, precio: 180 },
    { nombre: "Coca-Cola", cantidad: 2, precio: 25  },
  ],
  mensaje: "Mensaje de ejemplo",
};
ticketData.total = ticketData.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

const formattedTicket = computed(() => {
  const fecha = new Date().toLocaleString();
  return [
    ticketData.titulo,
    fecha,
    `Pedido #: ${ticketData.pedido}`,
    "",
    ...ticketData.items.map(i => `${i.cantidad}x ${i.nombre} - $${(i.precio * i.cantidad).toFixed(2)}`),
    "",
    `Total: $${ticketData.total.toFixed(2)}`,
    "",
    ticketData.mensaje,
  ].join("\n");
});

const printTest = async () => {
  try {
    const success = await window.printer.printTicket(ticketData, selectedPrinter.value);
    message.value = success ? "✅ Impreso correctamente" : "❌ Falló la impresión";
  } catch (err) {
    message.value = "❌ Error: " + err.message;
  }
};

onMounted(async () => {
  try {
    const list = await window.printer.getPrinters();
    printers.value = list;
    if (list.length) selectedPrinter.value = list[0].name;
  } catch (err) {
    console.error("Error obteniendo impresoras:", err);
    message.value = "Error cargando impresoras";
  }
});
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
  width: 480px; max-height: 90vh;
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
  background: #e0f2fe; color: #0284c7;
  display: flex; align-items: center; justify-content: center;
}

.close-btn {
  width: 30px; height: 30px; border: none; background: #f5f5f5;
  border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #888; transition: background 0.15s;
}
.close-btn:hover { background: #ffe5e5; color: #e53935; }

.modal-body {
  padding: 20px; display: flex; flex-direction: column;
  gap: 16px; overflow-y: auto; flex: 1;
  padding: 10px 36px 32px 32px;
  
}

.field-group { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em; color: #bbb;
}

.field-input {
  padding: 10px 12px;
  border: 1.5px solid #e5e5e5; border-radius: 10px;
  font-size: 14px; color: #111; outline: none;
  transition: border-color 0.2s;
}
.field-input:focus { border-color: #0284c7; }
.field-select { cursor: pointer; background: #fff; }

/* Vista previa */
.preview-section { display: flex; flex-direction: column; gap: 8px; }

.ticket-preview {
  background: #fafafa; border: 1.5px solid #efefef;
  border-radius: 10px; padding: 14px;
  max-height: 220px; overflow-y: auto;
}

.ticket-pre {
  font-family: 'Courier New', monospace;
  font-size: 12px; color: #333; margin: 0;
  white-space: pre-wrap; line-height: 1.6;
}

/* Mensaje */
.message-row {
  padding: 10px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
}
.msg-ok  { background: #f0fdf5; color: #2db760; border: 1px solid #d1fae5; }
.msg-err { background: #fff5f5; color: #e53935; border: 1px solid #fecaca; }

/* Footer */
.modal-footer {
  display: flex; gap: 10px;
  padding: 25px 36px; border-top: 1px solid #f0f0f0; flex-shrink: 0;
}

.btn-cancel, .btn-confirm {
  flex: 1; height: 42px; border: none; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s ease;
}

.btn-cancel  { background: #f5f5f5; color: #555; }
.btn-cancel:hover  { background: #eee; }
.btn-confirm {
  background: #0284c7; color: #fff;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-confirm:hover { background: #0369a1; }

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