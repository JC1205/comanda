<template>
  <div class="layout">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">
        <img src="../public/logo.png">
      </div>

      <div class="menu">

        <div class="menu-item">
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

        <div class="menu-item" @click="abrirPestana">
          <img src="/candado-abierto.png" class="icon">
          <span>Abrir turno</span>
        </div>

        <div class="menu-item" @click="PestanaCerrar">
          <img src="/candado.png" class="icon">
          <span>Cerrar turno</span>
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
        <img src="/circle-x.png" class="icon">
        <span>Cerrar sesión</span>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <div class="topbar">
        <div class="title">Home</div>
        <div class="user">
        Usuario: JC<br>
        Martes, 28 Mar 2026
      </div>
      </div>

      <section class="hero">
        <div class="overlay"></div>

        <transition name="hero-anim" appear>
  <div class="hero-content">
    <h1>Serve <span>faster.</span><br>Manage <span>smarter.</span></h1>

    <div class="logo-center"></div>

    <p>Everything your restaurant needs, in one place.</p>

    <button class="btn" @click="abrirComedor">
      Start Order
    </button>
  </div>
</transition>
      </section>
    </main>

    <!-- 🔥 ALERTAS -->
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

    <!-- MODALES (NO TOCAR) -->
    <AbrirTurno :mostrar="mostrarVentana" @cerrar="mostrarVentana = false" @turnoAbierto="mostrarAlertaTurno" />
    <cerrarTurno :mostrar="mostrarVentanaCerrar" @cerrar="mostrarVentanaCerrar = false" @turnoCerrado="MostrarAlertaTurnoCerrado" />
    <aggProductos :mostrar="mostrarAggProductos" @cerrar="mostrarAggProductos = false" />
    <aggUsuarios :mostrar="mostrarAggUsuarios" @cerrar="mostrarAggUsuarios = false" />
    <comedor :mostrar="mostrarComedor" @cerrar="mostrarComedor = false" />
    <impresoras :mostrar="mostrarImpresoras" @cerrar="mostrarImpresoras = false" />
    <retiros :mostrar="mostrarRetiros" @cerrar="mostrarRetiros = false" />
    <corte :mostrar="mostrarCorte" @cerrar="mostrarCorte = false" />
    <domicilio :mostrar="mostrarDomicilio" @cerrar="mostrarDomicilio = false" />

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import AbrirTurno from "@/views/abrirTurno.vue";
import cerrarTurno from "@/views/cerrarTurno.vue";
import aggProductos from "./views/aggProductos.vue";
import comedor from "./views/comedor.vue";
import aggUsuarios from "./views/aggUsuarios.vue";

import impresoras from "./views/impresoras.vue";

import retiros from "./views/retiros.vue";
import corte from "./views/corte.vue";
import domicilio from "./views/domicilio.vue";

import { turno } from "@/store/auth.js";

const mostrarVentana = ref(false);
const mostrarAlertaTurnoAbierto = ref(false);
const mostrarAlertaTurnoCreado = ref(false);
const mostrarAlertaNoTurnoAbierto = ref(false);
const alertaTurnoCerrado = ref(false);
const mostrarVentanaCerrar = ref(false);
const mostrarDropdown = ref(false);
const router = useRouter();
const mostrarAggProductos = ref(false);
const mostrarAggUsuarios = ref(false);
const mostrarComedor = ref(false);

const mostrarImpresoras = ref(false);

const mostrarRetiros = ref(false);
const mostrarCorte = ref(false);
const mostrarDomicilio = ref(false);


// Funcion para abrir turno
const abrirPestana = () => {
  if (!turno.value) {
    mostrarVentana.value = true;
  } else {
    mostrarAlertaTurnoAbierto.value = true;
    setTimeout(() => {
      mostrarAlertaTurnoAbierto.value = false;
    }, 3000);
  }
};

// Funcion para cerrar turno
const PestanaCerrar = () => {
  if (turno.value) {
    mostrarVentanaCerrar.value = true;
  } else {
    mostrarAlertaNoTurnoAbierto.value = true;
    setTimeout(() => {
      mostrarAlertaNoTurnoAbierto.value = false;
    }, 3000);
  }
};

// Funcion para mostrar alerta turno creado
const mostrarAlertaTurno = () => {
  mostrarAlertaTurnoCreado.value = true;
  setTimeout(() => {
    mostrarAlertaTurnoCreado.value = false;
  }, 3000);
};

// Funcion para mostrar alerta turno cerrado
const MostrarAlertaTurnoCerrado = () => {
  alertaTurnoCerrado.value = true;
  setTimeout(() => {
    alertaTurnoCerrado.value = false;
  }, 3000);
};


//Abrir comedor
const abrirComedor = () => {
  mostrarComedor.value = true;
};

// Abrir Agg productos
const abrirAggProductos = () => {
  mostrarAggProductos.value = true;
};

// Abrir Agg usuarios
const abrirAggUsuarios = () => {
  mostrarAggUsuarios.value = true;
};

//Abrir Impresoras
const abrirImpresoras = () => {
  mostrarImpresoras.value = true;
};

// Abrir retiros
const abrirRetiros = () => {
  mostrarRetiros.value = true;
};

// abrir Corte CAja
const abrirCorte = () => {
  mostrarCorte.value = true;
  
};

// abrir domicilio
const abrirDomicilio = () => {
  mostrarDomicilio.value = true;

};

// Manejo del dropdown fuera de foco
function handleClickOutside(event) {
  const dropdown = document.querySelector('.dropdown');
  if (dropdown && !dropdown.contains(event.target)) {
    mostrarDropdown.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside);
});

// Salir
const salir = () => {
  router.push("/");
};
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

.menu-item.active {
  background: #e8c3a5;
  font-weight: 500;
}

.icon {
  width: 20px;
  height: 20px;
}

.menu-footer {
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      border-radius: 10px;
      margin-left: 8px;
      padding: 12px 24px;
      padding-left: 35px;
      border-top: 2px solid #eee;
      cursor: pointer;
      color: #424242;
      font-size: 14px;
}

/* MAIN */
.main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

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
      z-index: 10;
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
  background-image: url('../public/imagen.jpg'); /* 👈 ponla en public */
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

.hero-content {
      position: relative;
      z-index: 2;
      height: 100%;
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

/* ALERTAS */
.alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 22px;
  border-radius: 12px;
  color: white;
}

.alert.error {
  background: #ff5f5f;
}

.alert.success {
  background: #22c55e;
}

/* ANIMACIÓN */
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

/* HERO ANIMACIÓN */
.hero-anim-enter-active {
  animation: heroFade 0.8s ease forwards;
}

@keyframes heroFade {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
