<template>
  <div class="layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">
        <img src="../public/logo.png">
      </div>

      <div class="menu">

        <div class="menu-item" :class="{ active: vistaActiva === 'home' }" @click="setVista('home')">
          <img src="/layout-dashboard.png" class="icon">
          <span>Home</span>
        </div>

        <div class="menu-item" @click="abrirComedor">
          <img src="/mesa.png" class="icon">
          <span>Comedor</span>
        </div>

        <div class="menu-item" @click="abrirDomicilio">
          <img src="/moto.png" class="icon">
          <span>Domicilio</span>
        </div>

        <div class="menu-item" :class="{ active: vistaActiva === 'turno' }" @click="abrirPestana">
          <img src="/clock.png" class="icon">
          <span>Turnos</span>
        </div>


        <div class="menu-item" @click="abrirRetiros">
          <img src="/retirar.png" class="icon">
          <span>Depósito y retiro</span>
        </div>

        <div class="menu-item" @click="abrirCorte">
          <img src="/caja-registradora.png" class="icon">
          <span>Corte de caja</span>
        </div>

        <!-- AJUSTES -->
        <div class="menu-item" @click.stop="mostrarDropdown = !mostrarDropdown">
          <img src="/icons8-ajustes-48.png" class="icon">
          <span>Ajustes</span>
        </div>

        <transition name="fade">
          <div v-show="mostrarDropdown" class="dropdown-modern">
            <div @click="abrirAggProductos(); mostrarDropdown=false">Productos</div>
            <div @click="abrirAggUsuarios(); mostrarDropdown=false">Usuarios</div>
            <div @click="abrirImpresoras(); mostrarDropdown=false">Impresoras</div>
          </div>
        </transition>

      </div>

      <div class="menu-footer" @click="salir">
      <CircleX class="icon" />
      <span>Cerrar sesión</span>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main">

      <!-- TOPBAR: siempre visible, fuera del hero -->
      <div class="topbar">
        <div class="title">{{ tituloActivo }}</div>
        <div class="user">
          Usuario: {{ userName }}<br>
          Martes, 28 Mar 2026
        </div>
      </div>

      <!-- HERO -->
      <section class="hero">
        <div class="overlay"></div>

        <!-- Vista Home -->
        <transition name="hero-anim" appear>
            <div v-if="vistaActiva === 'home'" class="hero-content">
            <h1>Serve <span>faster.</span><br>Manage <span>smarter.</span></h1>
            <div class="logo-center"></div>
            <p>Everything your restaurant needs, in one place.</p>
            <button class="btn" @click="abrirComedor">Start Order</button>
          </div>
        </transition>

        <!-- Solo GestorTurno va en el hero -->
        <transition name="panel-fade">
          <div v-if="vistaActiva === 'turno'" class="hero-panel">
            <GestorTurno
              :mostrar="true"
              @cerrar="setVista('home')"
              @turnoAbierto="mostrarAlertaTurno"
              @turnoCerrado="MostrarAlertaTurnoCerrado"
            />
          </div>
        </transition>

      </section>
    </main>

    <!-- ALERTAS -->
    <transition name="fade-slide">
      <div v-if="mostrarAlertaTurnoAbierto" class="alert error">
        Ya hay un turno abierto.
      </div>
    </transition>

    <transition name="fade-slide">
      <div v-if="mostrarAlertaNoTurnoAbierto" class="alert error">
        No hay un turno abierto.
      </div>
    </transition>

    <transition name="fade-slide">
      <div v-if="mostrarAlertaTurnoCreado" class="alert success">
        ¡Turno registrado correctamente!
      </div>
    </transition>

    <transition name="fade-slide">
      <div v-if="alertaTurnoCerrado" class="alert success">
        ¡Turno cerrado correctamente!
      </div>
    </transition>

    <!-- MODALES FLOTANTES (NO TOCAR) -->
    <aggProductos :mostrar="mostrarAggProductos" @cerrar="mostrarAggProductos = false" />
    <aggUsuarios  :mostrar="mostrarAggUsuarios"  @cerrar="mostrarAggUsuarios = false" />
    <comedor      :mostrar="mostrarComedor"      @cerrar="mostrarComedor = false" />
    <impresoras   :mostrar="mostrarImpresoras"   @cerrar="mostrarImpresoras = false" />
    <retiros      :mostrar="mostrarRetiros"      @cerrar="mostrarRetiros = false" />
    <corte        :mostrar="mostrarCorte"        @cerrar="mostrarCorte = false" />
    <domicilio    :mostrar="mostrarDomicilio"    @cerrar="mostrarDomicilio = false" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import aggProductos from "./views/aggProductos.vue";
import comedor from "./views/comedor.vue";
import aggUsuarios from "./views/aggUsuarios.vue";
import GestorTurno from "@/views/GestorTurno.vue";
import impresoras from "./views/impresoras.vue";
import retiros from "./views/retiros.vue";
import corte from "./views/corte.vue";
import domicilio from "./views/domicilio.vue";
import { turno, userName } from "@/store/auth.js";
import { CircleX } from 'lucide-vue-next';

// ── Vista activa en el hero (solo turno) ──────────────────────
const vistaActiva = ref('home');

const titulos = {
  home:  'Home',
  turno: 'Turnos',
};

const tituloActivo = computed(() => titulos[vistaActiva.value] ?? 'Home');

const setVista = (vista) => {
  vistaActiva.value = vista;
};

// ── Alertas ────────────────────────────────────────────────────
const mostrarAlertaTurnoAbierto    = ref(false);
const mostrarAlertaTurnoCreado     = ref(false);
const mostrarAlertaNoTurnoAbierto  = ref(false);
const alertaTurnoCerrado           = ref(false);

const mostrarAlertaTurno = () => {
  mostrarAlertaTurnoCreado.value = true;
  setTimeout(() => { mostrarAlertaTurnoCreado.value = false; }, 3000);
};

const MostrarAlertaTurnoCerrado = () => {
  alertaTurnoCerrado.value = true;
  setTimeout(() => { alertaTurnoCerrado.value = false; }, 3000);
};

// ── Turno va al hero ───────────────────────────────────────────
const abrirPestana  = () => setVista('turno');
const PestanaCerrar = () => setVista('turno');

// ── Modales flotantes (sin cambios) ───────────────────────────
const mostrarDropdown     = ref(false);
const mostrarComedor      = ref(false);
const mostrarDomicilio    = ref(false);
const mostrarRetiros      = ref(false);
const mostrarCorte        = ref(false);
const mostrarAggProductos = ref(false);
const mostrarAggUsuarios  = ref(false);
const mostrarImpresoras   = ref(false);

const abrirComedor      = () => { mostrarComedor.value = true; };
const abrirDomicilio    = () => { mostrarDomicilio.value = true; };
const abrirRetiros      = () => { mostrarRetiros.value = true; };
const abrirCorte        = () => { mostrarCorte.value = true; };
const abrirAggProductos = () => { mostrarAggProductos.value = true; };
const abrirAggUsuarios  = () => { mostrarAggUsuarios.value = true; };
const abrirImpresoras   = () => { mostrarImpresoras.value = true; };

// ── Dropdown fuera de foco ─────────────────────────────────────
function handleClickOutside(event) {
  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    mostrarDropdown.value = false;
  }
}

onMounted(() => { window.addEventListener('click', handleClickOutside); console.log("Nombre de usuario:", userName.value); });
onBeforeUnmount(() => { window.removeEventListener('click', handleClickOutside); });

const router = useRouter();
const salir = () => { router.push("/"); };
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.layout {
  display: flex;
  height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f5f5f5;
}

/* SIDEBAR */
.sidebar {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.logo img {
  width: 160px;
  margin: 0 auto 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 24px;
  margin: 4px 12px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.menu-item:hover {
  background: #e8c3a5;
  transform: translateX(4px);
}

.icon {
  width: 20px;
  height: 20px;
}

.menu-footer {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  border-radius: 10px;
  margin-left: 8px;
  padding-top: 20px;
  padding-left: 35px;
  border-top: 2px solid #eee;
  color: #ff8383;
  font-size: 14px;
}

.menu-footer:hover{
  color: #000;
  transition: all 0.3s ease;
  transform: translateX(4px);
}
/* MAIN */
.main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* TOPBAR — siempre encima de todo */
.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.509);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(255,255,255,0.3);
}

.topbar .user {
  font-size: 14px;
  color: #777;
  text-align: right;
}

/* HERO */
.hero {
  width: 100%;
  height: 100%;
  position: relative;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url('../public/imagen.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(2px);
}

/* Hero content centrado */
.hero-content {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
}

.hero h1 {
  font-size: 52px;
  font-weight: 400;
}

.hero h1 span {
  font-weight: 700;
  font-style: italic;
}

.hero p {
  font-size: 18px;
  color: #000000;
}

.logo-center {
  margin-bottom: 10px;
  width: 120px;
  height: 40px;
  background-image: url('../public/mini-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.btn {
  height: 50px;
  margin-top: 20px;
  padding: 14px 30px;
  border-radius: 30px;
  border: 2px solid #000;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #000;
  color: #fff;
  transform: scale(1.05);
}

/* Panel GestorTurno — respeta el topbar con padding-top */
.hero-panel {
  position: absolute;
  inset: 0;
  z-index: 2;
  padding-top: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ALERTAS */
.alert {
  position: fixed;
  top: 20px;
  left: 58%;
  transform: translateX(-50%);
  padding: 14px 22px;
  border-radius: 12px;
  color: white;
  z-index: 200;
  border: none;
  outline: none;

}

.alert.error  { background: #f87f7f; }
.alert.success { background: #50cc7d; }

/* ANIMACIONES */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

/* DROPDOWN */
.dropdown-modern {
  position: absolute;
  left: 240px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  padding: 10px;
}

.dropdown-modern div {
  padding: 10px;
  cursor: pointer;
}

.dropdown-modern div:hover {
  background: #eee;
}

/* Hero animación */
.hero-anim-enter-active {
  animation: heroFade 0.8s ease forwards;
}
.hero-anim-leave-active {
  transition: opacity 0.3s ease;
}
.hero-anim-leave-to {
  opacity: 0;
}

@keyframes heroFade {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Panel animación */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.3s ease;
}
.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>