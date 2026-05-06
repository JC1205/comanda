<template>
  <div v-if="mostrar" class="gestor-wrapper">
    <div class="corte-card">

      <!-- ── HEADER ─────────────────────────────────────────── -->
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrap">
            <Calculator :size="18" />
          </div>
          <div>
            <h2 class="card-title">Corte de caja</h2>
            <p class="card-subtitle">Resumen del turno actual</p>
          </div>
        </div>
        <div class="comandas-chip">
          <span class="chip-label">Comandas</span>
          <span class="chip-value">{{ comandas ?? '—' }}</span>
        </div>
      </div>

      <div class="divider" />

      <!-- ── BODY ───────────────────────────────────────────── -->
      <div class="card-body">

        <!-- Columna 1: Movimientos -->
        <div class="col-section">
          <p class="section-label">Movimientos</p>
          <div class="metrics-list">
            <div class="metric-row">
              <span class="metric-name">Efectivo inicial</span>
              <span class="metric-val">${{ fmt(efectivoInical) }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Efectivo cobrado</span>
              <span class="metric-val">${{ fmt(efectivo) }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Tarjeta</span>
              <span class="metric-val">${{ fmt(tarjeta) }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Transferencia</span>
              <span class="metric-val">${{ fmt(transferencia) }}</span>
            </div>
            <div class="metric-row metric-row--negative">
              <span class="metric-name">Retiros</span>
              <span class="metric-val">-${{ fmt(retiros) }}</span>
            </div>
            <div class="metric-row metric-row--positive">
              <span class="metric-name">Depósitos</span>
              <span class="metric-val">+${{ fmt(depositos) }}</span>
            </div>
          </div>
        </div>

        <div class="col-divider" />

        <!-- Columna 2: Resumen ventas -->
        <div class="col-section">
          <p class="section-label">Resumen de ventas</p>
          <div class="metrics-list">
            <div class="metric-row">
              <span class="metric-name">Efectivo</span>
              <span class="metric-val">${{ fmt(efectivo2) }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Tarjeta</span>
              <span class="metric-val">${{ fmt(tarjeta2) }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-name">Transferencia</span>
              <span class="metric-val">${{ fmt(transferencia2) }}</span>
            </div>
          </div>

          <div class="venta-bruta-chip">
            <span class="vb-label">Venta bruta</span>
            <span class="vb-value">${{ fmt(ventaBruta) }}</span>
          </div>
        </div>

        <div class="col-divider" />

        <!-- Columna 3: Saldos finales -->
        <div class="col-section">
          <p class="section-label">Saldos finales</p>
          <div class="final-chips">
            <div class="final-chip">
              <span class="final-label">Saldo final</span>
              <span class="final-value">${{ fmt(saldoFinal) }}</span>
            </div>
            <div class="final-chip final-chip--accent">
              <span class="final-label">Efectivo final</span>
              <span class="final-value">${{ fmt(efectivoFinal) }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from "vue";
import { Calculator } from "lucide-vue-next";
import { supabase } from "@/supabase/supabase";
import { idTurno } from "@/store/auth.js";

const props = defineProps(["mostrar"]);

const fmt = (val) => val != null ? Number(val).toFixed(2) : '0.00';

const comandas        = ref(null);
const efectivoInical  = ref(null);
const efectivo        = ref(null);
const tarjeta         = ref(null);
const transferencia   = ref(null);
const retiros         = ref(null);
const depositos       = ref(null);
const saldoFinal      = ref(null);
const efectivoFinal   = ref(null);
const efectivo2       = ref(null);
const tarjeta2        = ref(null);
const transferencia2  = ref(null);
const ventaBruta      = ref(null);

const resumenCaja        = ref({ efectivo: 0, tarjeta: 0, transferencia: 0, ventaBruta: 0 });
const resumenMovimientos = ref({ retiro: 0, deposito: 0 });
const turno              = ref([]);

const cargarResumenCaja = async () => {
  const { data, error } = await supabase
    .from('corte_caja_resumen').select('*').eq('idturno', idTurno.value);
  if (error) { console.error("❌ Error al cargar resumen de caja:", error); return; }
  if (data.length > 0) {
    resumenCaja.value = {
      efectivo:      data[0].total_efectivo,
      tarjeta:       data[0].total_tarjeta,
      transferencia: data[0].total_transferencia,
      ventaBruta:    data[0].venta_bruta,
    };
  }
};

const cargarResumenMovimientos = async () => {
  const { data, error } = await supabase
    .from('movimientos_resumen').select('*').eq('idturno', idTurno.value);
  if (error) { console.error("❌ Error al cargar movimientos:", error); return; }
  data.forEach(item => {
    if (item.tipomovimiento === 'retiro')   resumenMovimientos.value.retiro   = item.total;
    if (item.tipomovimiento === 'deposito') resumenMovimientos.value.deposito = item.total;
  });
};

async function obtenerTurno() {
  const { data, error } = await supabase
    .from('turnos').select().eq('idturno', idTurno.value);
  if (error) { console.error("Error al obtener turno", error); return; }
  turno.value = data[0];
}

function cargarDatos() {
  comandas.value       = turno.value.totalNotas;
  efectivoInical.value = turno.value.montoinicial;
  efectivo.value       = resumenCaja.value.efectivo;
  tarjeta.value        = resumenCaja.value.tarjeta;
  transferencia.value  = resumenCaja.value.transferencia;
  retiros.value        = resumenMovimientos.value.retiro;
  depositos.value      = resumenMovimientos.value.deposito;
  saldoFinal.value     = efectivoInical.value + efectivo.value + tarjeta.value + transferencia.value - retiros.value + depositos.value;
  efectivoFinal.value  = efectivoInical.value + efectivo.value - retiros.value + depositos.value;
  efectivo2.value      = efectivo.value;
  tarjeta2.value       = tarjeta.value;
  transferencia2.value = transferencia.value;
  ventaBruta.value     = resumenCaja.value.ventaBruta;
}

const cargarTodo = async () => {
  await obtenerTurno();
  await cargarResumenCaja();
  await cargarResumenMovimientos();
  cargarDatos();
};

watch(() => props.mostrar, (visible) => { if (visible) cargarTodo(); });
onMounted(() => { if (props.mostrar) cargarTodo(); });
</script>

<style scoped>
.gestor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.corte-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 860px;
  display: flex;
  flex-direction: column;
}

/* ── Header ────────────────────────────────────────────────── */
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; flex-shrink: 0;
}

.header-left { display: flex; align-items: center; gap: 10px; }

.icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  background: #f0fdf5; color: #2db760;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.card-title    { font-size: 15px; font-weight: 700; color: #111; margin: 0; }
.card-subtitle { font-size: 11px; color: #aaa; margin: 1px 0 0; }

.comandas-chip {
  display: flex; align-items: center; gap: 8px;
  background: #fafafa; border: 1px solid #efefef;
  border-radius: 10px; padding: 6px 14px;
}

.chip-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; color: #bbb;
}
.chip-value { font-size: 18px; font-weight: 800; color: #111; }

.divider { height: 1px; background: #f0f0f0; flex-shrink: 0; }

/* ── Body ──────────────────────────────────────────────────── */
.card-body {
  display: flex;
  padding: 14px 18px;
  gap: 0;
}

.col-section {
  flex: 1; display: flex; flex-direction: column;
  gap: 8px; padding: 0 16px;
}
.col-section:first-child { padding-left: 0; }
.col-section:last-child  { padding-right: 0; }

.col-divider { width: 1px; background: #f0f0f0; flex-shrink: 0; }

.section-label {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: #ccc; margin: 0 0 2px;
}

/* ── Metric rows ───────────────────────────────────────────── */
.metrics-list { display: flex; flex-direction: column; gap: 4px; }

.metric-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 10px;
  background: #fafafa; border: 1px solid #f0f0f0; border-radius: 8px;
}

.metric-name { font-size: 12px; color: #666; }
.metric-val  { font-size: 12px; font-weight: 700; color: #111; }

.metric-row--negative .metric-val { color: #e53935; }
.metric-row--positive .metric-val { color: #2db760; }

/* ── Venta bruta ───────────────────────────────────────────── */
.venta-bruta-chip {
  display: flex; align-items: center; justify-content: space-between;
  background: #f0fdf5; border: 1.5px solid #d1fae5;
  border-radius: 10px; padding: 8px 12px;
  margin-top: auto;
}

.vb-label {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; color: #2db760;
}
.vb-value { font-size: 18px; font-weight: 800; color: #111; }

/* ── Saldos finales ────────────────────────────────────────── */
.final-chips { display: flex; flex-direction: column; gap: 6px; }

.final-chip {
  display: flex; align-items: center; justify-content: space-between;
  background: #fafafa; border: 1px solid #efefef;
  border-radius: 10px; padding: 8px 12px;
}

.final-chip--accent { background: #f0fdf5; border-color: #d1fae5; }

.final-label {
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em; color: #bbb;
}
.final-chip--accent .final-label { color: #2db760; }

.final-value { font-size: 16px; font-weight: 800; color: #111; }
</style>