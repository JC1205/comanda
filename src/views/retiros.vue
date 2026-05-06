<template>
  <div class="gestor-wrapper">
    <div class="modal-card">

      <!-- ── TABS ──────────────────────────────────────────── -->
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: tab === 'retiro' }"
          @click="tab = 'retiro'"
        >
          <TrendingDown :size="15" />
          Retiro
        </button>
        <button
          class="tab-btn"
          :class="{ active: tab === 'deposito' }"
          @click="tab = 'deposito'"
        >
          <TrendingUp :size="15" />
          Depósito
        </button>
        <button class="close-tab-btn" @click="cerrarMovimientos">
          <X :size="15" />
        </button>
      </div>

      <!-- ── BODY ──────────────────────────────────────────── -->
      <div class="modal-body">

        <!-- Encabezado dinámico -->
        <div class="mov-header">
          <div class="mov-icon" :class="tab === 'retiro' ? 'mov-icon--retiro' : 'mov-icon--deposito'">
            <component :is="tab === 'retiro' ? TrendingDown : TrendingUp" :size="20" />
          </div>
          <div>
            <p class="mov-title">{{ tab === 'retiro' ? 'Retiro de Efectivo' : 'Depósito de Efectivo' }}</p>
            <p class="mov-subtitle">{{ tab === 'retiro' ? 'Registrar salida de dinero' : 'Registrar entrada de dinero' }}</p>
          </div>
        </div>

        <!-- Efectivo disponible -->
        <div class="efectivo-chip">
          <span class="chip-label">Efectivo Disponible</span>
          <span class="chip-amount">${{ efectivoDisponible.toFixed(2) }}</span>
        </div>

        <!-- Monto -->
        <div class="field-group">
          <label class="field-label">{{ tab === 'retiro' ? 'Monto a Retirar' : 'Monto a Depositar' }}</label>
          <div class="input-wrap">
            <DollarSign :size="15" class="input-icon" />
            <input
              v-model="importe"
              type="number"
              class="field-input"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Concepto -->
        <div class="field-group">
          <label class="field-label">{{ tab === 'retiro' ? 'Motivo del Retiro' : 'Motivo del Depósito' }}</label>
          <textarea
            v-model="concepto"
            class="field-textarea"
            :placeholder="tab === 'retiro' ? 'Describe el motivo del retiro...' : 'Describe el motivo del depósito...'"
            rows="3"
          />
        </div>

      </div>

      <!-- ── FOOTER ─────────────────────────────────────────── -->
      <div class="modal-footer">
        <button
          class="btn-confirm"
          :class="tab === 'retiro' ? 'btn-retiro' : 'btn-deposito'"
          @click="aggMovimiento"
        >
          {{ tab === 'retiro' ? 'Registrar Retiro' : 'Registrar Depósito' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { TrendingDown, TrendingUp, DollarSign, X } from "lucide-vue-next";
import { supabase } from "@/supabase/supabase";
import { idTurno, userLogin } from "@/store/auth.js";

const props = defineProps(["mostrar"]);
const emit = defineEmits(["irHome"]);

// ── Tab activo ────────────────────────────────────────────────
const tab = ref("retiro");

// ── Formulario ────────────────────────────────────────────────
const concepto = ref(null);
const importe  = ref(null);

const now   = new Date();
const fecha = ref(now.toISOString().split("T")[0]);
const hora  = ref(now.toTimeString().split(" ")[0]);

const limpiarCampos = () => {
  concepto.value = null;
  importe.value  = null;
};

// ── Datos para efectivo disponible (misma lógica que corte) ──
const efectivoInicial = ref(0);
const efectivoCaja    = ref(0);
const totalRetiros    = ref(0);
const totalDepositos  = ref(0);


const cerrarMovimientos = () => {
  limpiarCampos();
  emit("irHome");
};

const efectivoDisponible = computed(() =>
  efectivoInicial.value + efectivoCaja.value - totalRetiros.value + totalDepositos.value
);


const cargarEfectivoDisponible = async () => {
  // 1. Turno → monto inicial
  const { data: turnoData, error: turnoErr } = await supabase
    .from("turnos").select().eq("idturno", idTurno.value).single();
  if (turnoErr) { console.error("Error al obtener turno", turnoErr); return; }
  efectivoInicial.value = turnoData?.montoinicial ?? 0;

  // 2. Resumen de caja → efectivo cobrado
  const { data: cajaData, error: cajaErr } = await supabase
    .from("corte_caja_resumen").select("total_efectivo").eq("idturno", idTurno.value);
  if (cajaErr) { console.error("Error al cargar caja", cajaErr); return; }
  efectivoCaja.value = cajaData?.[0]?.total_efectivo ?? 0;

  // 3. Movimientos → retiros y depósitos
  const { data: movsData, error: movsErr } = await supabase
    .from("movimientos_resumen").select("*").eq("idturno", idTurno.value);
  if (movsErr) { console.error("Error al cargar movimientos", movsErr); return; }
  totalRetiros.value   = 0;
  totalDepositos.value = 0;
  movsData?.forEach(item => {
    if (item.tipomovimiento === "retiro")   totalRetiros.value   = item.total;
    if (item.tipomovimiento === "deposito") totalDepositos.value = item.total;
  });
};

// ── Registrar movimiento ─────────────────────────────────────
const aggMovimiento = async () => {
  const now2  = new Date();
  fecha.value = now2.toISOString().split("T")[0];
  hora.value  = now2.toTimeString().split(" ")[0];

  const { error } = await supabase
    .from("retirosdepositos")
    .insert([{
      idturno:        idTurno.value,
      idusuario:      userLogin.value,
      tipomovimiento: tab.value === "retiro" ? "Retiro" : "Deposito",
      concepto:       concepto.value,
      cantidad:       importe.value,
      fecha:          fecha.value,
      hora:           hora.value,
    }]);

  if (error) {
    console.error("Error al realizar", tab.value, error); return;
  }

  console.log(tab.value, "realizado correctamente");
  limpiarCampos();
  // Recargar disponible tras el movimiento
  await cargarEfectivoDisponible();
};

// ── Cargar al abrir ───────────────────────────────────────────
watch(() => props.mostrar, async (visible) => {
  if (visible) await cargarEfectivoDisponible();
});

onMounted(async () => {
  if (props.mostrar) await cargarEfectivoDisponible();
});
</script>

<style scoped>

.modal-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.13);
  width: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Tab bar ───────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 32px 36px 0;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 26px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1.5px solid transparent;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-radius: 999px;
  transition: all 0.18s ease;
}

.tab-btn:nth-child(1).active {
  color: #e53935;
  background: #ffe5e5;
  border-color: #e53935;
}

.tab-btn:nth-child(2).active {
  color: #2db760;
  background: #e6fff0;
  border-color: #2db760;
}

/* color activo por posición */
.tab-btn:nth-child(1).active { color: #e53935; border-bottom-color: #e53935; }
.tab-btn:nth-child(2).active { color: #2db760; border-bottom-color: #2db760; }

.tab-btn:hover { color: #555; }

.close-tab-btn {
  margin-left: auto;
  margin-bottom: 6px;
  width: 28px;
  height: 28px;
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
.close-tab-btn:hover { background: #ffe5e5; color: #e53935; }

/* ── Body ──────────────────────────────────────────────────── */
.modal-body {
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Encabezado dinámico */
.mov-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.mov-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mov-icon--retiro   { background: #ffe5e5; color: #e53935; }
.mov-icon--deposito { background: #e6fff0; color: #2db760; }

.mov-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}
.mov-subtitle {
  font-size: 13px;
  color: #999;
}

/* Efectivo disponible */
.efectivo-chip {
  background: #f8f8f8;
  border: 1px solid #efefef;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chip-label  { font-size: 12px; color: #888; font-weight: 500; }
.chip-amount { font-size: 26px; font-weight: 800; color: #111; letter-spacing: -0.5px; }

/* Campos */
.field-group { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e2e2e2;
  border-radius: 10px;
  overflow: hidden;
  padding: 0 14px;
  gap: 10px;
  transition: border-color 0.2s;
}
.input-wrap:focus-within {
  border-color: #3cd677;
}

.input-icon { color: #bbb; flex-shrink: 0; }

.field-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 0;
  font-size: 15px;
  color: #111;
  background: transparent;
}
.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.field-textarea {
  padding: 12px 14px;
  border: 1.5px solid #e5e5e5;
  border-radius: 11px;
  font-size: 14px;
  color: #111;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
  line-height: 1.5;
}
.field-textarea:focus { border-color: #3cd677; }
.field-textarea::placeholder { color: #ccc; }

/* ── Footer ────────────────────────────────────────────────── */
.modal-footer {
  padding: 0 36px 32px;
}

.btn-confirm {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
  letter-spacing: 0.01em;
}

.btn-retiro   { background: #ed6c6c; color: #fff; }
.btn-retiro:hover   { background: #df4848; }
.btn-deposito { background: #48e180; color: #fff; }
.btn-deposito:hover { background: #31b05f; }
</style>