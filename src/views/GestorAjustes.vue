<template>
  <div class="gestor-wrapper">
    <div class="ajustes-card">

      <!-- ── HEADER ─────────────────────────────────────────── -->
      <div class="card-header">
        <div class="header-left">
          <div class="icon-wrap">
            <Settings :size="22" />
          </div>
          <div>
            <h2 class="card-title">Ajustes</h2>
            <p class="card-subtitle">Configura tu sistema</p>
          </div>
        </div>

        <button class="close-tab-btn" @click="$emit('cerrar')">
          <X :size="15" />
          </button>

      </div>


      <!-- ── CARDS ──────────────────────────────────────────── -->
      <div class="cards-grid">

        <button class="ajuste-card" @click="mostrarProductos = true">
          <div class="ajuste-icon ajuste-icon--green">
            <Package :size="26" />
          </div>
          <div class="ajuste-info">
            <p class="ajuste-title">Productos</p>
            <p class="ajuste-sub">Gestionar catálogo de productos, grupos y precios</p>
          </div>
          <ChevronRight :size="18" class="ajuste-arrow" />
        </button>

        <button class="ajuste-card" @click="mostrarUsuarios = true">
          <div class="ajuste-icon ajuste-icon--purple">
            <Users :size="26" />
          </div>
          <div class="ajuste-info">
            <p class="ajuste-title">Usuarios</p>
            <p class="ajuste-sub">Administrar accesos, roles y contraseñas</p>
          </div>
          <ChevronRight :size="18" class="ajuste-arrow" />
        </button>

        <button class="ajuste-card" @click="mostrarImpresoras = true">
          <div class="ajuste-icon ajuste-icon--blue">
            <Printer :size="26" />
          </div>
          <div class="ajuste-info">
            <p class="ajuste-title">Impresoras</p>
            <p class="ajuste-sub">Configurar dispositivos de impresión de tickets</p>
          </div>
          <ChevronRight :size="18" class="ajuste-arrow" />
        </button>

      </div>

    </div>

    <!-- ── MODALES ────────────────────────────────────────────── -->
    <aggProductos :mostrar="mostrarProductos" @cerrar="mostrarProductos = false" />
    <aggUsuarios  :mostrar="mostrarUsuarios"  @cerrar="mostrarUsuarios = false" />
    <impresoras   :mostrar="mostrarImpresoras" @cerrar="mostrarImpresoras = false" />

  </div>
</template>

<script setup>
import { ref } from "vue";
import { Settings, Package, Users, Printer, ChevronRight } from "lucide-vue-next";
import aggProductos from "@/views/aggProductos.vue";
import aggUsuarios  from "@/views/aggUsuarios.vue";
import impresoras   from "@/views/impresoras.vue";
import { X } from "lucide-vue-next";


const mostrarProductos  = ref(false);
const mostrarUsuarios   = ref(false);
const mostrarImpresoras = ref(false);

const props = defineProps(["mostrar"]);
const emit = defineEmits(["cerrar"]);

const cerrarMovimientos = () => {
  emit("cerrar");
};

const vista = ref("ajustes");

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

.ajustes-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.09);
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 36px;
  border-bottom: 1px;
  border-bottom: 2px solid #f0f0f0;
}

.header-left { display: flex; align-items: center; gap: 14px; }

.icon-wrap {
  width: 46px; height: 46px;
  border-radius: 13px;
  background: #f4f4f4;
  color: #555;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.card-title    { font-size: 18px; font-weight: 700; color: #111; margin: 0; }
.card-subtitle { font-size: 12px; color: #aaa; margin: 2px 0 0; }

.divider { height: 0px; background: #f0f0f0; }

/* Cards grid */
.cards-grid {
  display: flex;
  flex-direction: column;
  padding: 32px;
  gap: 10px;
}

.ajuste-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 28px 18px;
  border: 1.5px solid #efefef;
  border-radius: 14px;
  background: #fafafa;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;
  width: 100%;
}

.ajuste-card:hover {
  background: #fff;
  border-color: #ddd;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  transform: translateY(-1px);
}

.ajuste-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.ajuste-icon--green  { background: #e6fff0; color: #2db760; }
.ajuste-icon--purple { background: #ede9fe; color: #7c3aed; }
.ajuste-icon--blue   { background: #e0f2fe; color: #0284c7; }

.ajuste-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }

.ajuste-title { font-size: 15px; font-weight: 700; color: #111; margin: 0; }
.ajuste-sub   { font-size: 12px; color: #aaa; margin: 0; }

.ajuste-arrow { color: #ccc; flex-shrink: 0; }
.ajuste-card:hover .ajuste-arrow { color: #999; }

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


</style>