<template>
  <div class="container" @keydown="manejarTeclado">

    <!-- ERROR -->
    <transition name="fade-slide">
  <div v-if="mensajeError" class="error-box">
    <span class="icon">⚠</span>
    <span>{{ mensajeError }}</span>
  </div>
</transition>

    <!-- FONDO -->
    <div class="background">
      <img src="../public/mono.svg" class="bg-svg" />
    </div>

    <!-- LOGIN -->
    <div class="login-wrapper">
      <div class="card">

        <p class="welcome">Welcome to</p>

        <img src="../public/logo.png" class="logo">

        <p class="subtitle">
          Enter your username and password to access your account
        </p>

        <form @submit.prevent="iniciarSesion">
          <div class="input-icon">
    <!-- icono usuario -->
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>

    <input 
      type="text" 
      v-model="usuario"
      ref="usuarioInput"
      placeholder="Enter username"
    >
  </div>

  <label>Password</label>
  <div class="input-icon">
    <!-- icono candado -->
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>

    <input 
      type="password" 
      v-model="password"
      ref="passwordInput"
      placeholder="Enter password"
    >
  </div>

          <button type="submit">Log in</button>
        </form>

        <p class="register">
           © 2026 Comanda. All rights reserved.
        </p>

      </div>
    </div>

  </div>
</template>

<script setup>
import { obtenerTurno, resultadoLogin, userLogin, userName } from "@/store/auth.js";
import { supabase } from "@/supabase/supabase";
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const usuario = ref('');
const password = ref('');
const mensajeError = ref("");

const usuarioInput = ref(null);
const passwordInput = ref(null);

const manejarTeclado = (e) => {
  if (e.key === "ArrowDown") {
    if (document.activeElement === usuarioInput.value) {
      passwordInput.value.focus();
    }
  }

  if (e.key === "ArrowUp") {
    if (document.activeElement === passwordInput.value) {
      usuarioInput.value.focus();
    }
  }

  if (e.key === "Enter") {
    e.preventDefault();
    iniciarSesion();
  }
};


const iniciarSesion = async () => {
  mensajeError.value = "";

  const { data, error } = await supabase
    .from("usuarios")
    .select("idusuario,userName,password")
    .eq("userName", usuario.value)
    .single();

  if (error) {
    mostrarError("Usuario o contraseña incorrectos.");
    return;
  }

  if (data && data.password === password.value) {
    userLogin.value = data.idusuario;
    userName.value = data.userName;
    localStorage.setItem('userLogin', data.idusuario);

    obtenerTurno();
    resultadoLogin.value = 'Inicio sesion correcto';

    router.push('/home');
  } else {
    mostrarError("Usuario o contraseña incorrectos.");
    resultadoLogin.value = 'Credenciales Incorrectas';
    router.push('/');
  }
};

const mostrarError = (mensaje) => {
  mensajeError.value = mensaje;
  setTimeout(() => {
    mensajeError.value = "";
  }, 3000);
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
}

body {
  height: 100vh;
  overflow: hidden;
}

/* CONTENEDOR */
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #e0e0e0; /* gris claro base */
}

/* FONDO SVG */
.background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.55;
  filter: grayscale(20%);
   transform: scale(1.1);


}

/* WRAPPER LOGIN */
.login-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: fadeCenter 0.8s ease;
}

/* CARD */
.card {
  width: 545px;
  padding: 80px 90px;
  border-radius: 22px;

  /* glass effect */
  background: rgb(255, 255, 255);
  /*backdrop-filter: blur(12px);*/

  box-shadow: 
    0 20px 50px rgba(0,0,0,0.35),
    0 5px 15px rgba(0,0,0,0.05);

  animation: fadeIn 1s ease;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: scale(1.02);
}
/* TEXTOS */
.welcome {
  font-size: 20px;
  color: #000000;
  margin-bottom: -5px;
}

.logo {
  width: 360px;
  margin-bottom: 25px;
}

.subtitle {
  font-size: 14px;
  color: #000000;
  margin-bottom: 30px;
}

/* FORM */
form {
  display: flex;
  flex-direction: column;
}

label {
    font-weight: 500;
  font-size: 13px;
  color: #000000;
  margin-bottom: 15px;
}

input {
  height: 42px;
  border-radius: 25px;
  border: 1px solid #939393;
  padding: 0 12px;
  margin-bottom: 15px;
  outline: none;
  transition: all 0.25s ease;
}

/* INPUT EFECTO MODERNO */
input:focus {
  border-color: #f4a261;
  box-shadow: 0 0 0 3px rgba(244, 162, 97, 0.2);
}

input::placeholder {
  color: #b9b9b9;
  font-size: 14px;
}


.input-icon {
  display: flex;
  align-items: center;
  border: 1px solid #939393;
  border-radius: 25px;
  padding: 0 12px;
  margin-bottom: 15px;
  height: 50px;
  transition: all 0.25s ease;
}


.input-icon input {
  border: none;
  box-shadow: none;
  margin-bottom: 0;
  padding: 0 8px;
  height: 100%;
  background: transparent;
}


.input-icon:focus-within {
  border-color: #f4a261;
  box-shadow: 0 0 0 3px rgba(244, 162, 97, 0.2);
}


.input-icon svg {
  width: 25px;
  height: 25px;
  color: #939393;
}


.input-icon:focus-within svg {
  color: #f4a261;
}

/* BOTÓN */
button {
  margin-top: 35px;
  height: 50px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  color: white;
  cursor: pointer;

  background: rgb(236, 197, 134);

  transition: all 0.3s ease;
}

/* HOVER BOTÓN */
button:hover {
    background: #000000;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

/* REGISTER */
.register {
  text-align: center;
  font-size: 12px;
  margin-top: 20px;
  color: #919191;
}


/* ANIMACIONES */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(50px, -50%);
  }
  to {
    opacity: 1;
    transform: translate(0, -50%);
  }
}

@keyframes fadeCenter {
  from {
    opacity: 0;
    transform: translate(-50%, -40%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .login-wrapper {
    right: 50%;
    transform: translate(50%, -50%);
  }

  .card {
    width: 90vw;
  }
}

/* ALERTA */
.error-box {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 14px 22px;
  border-radius: 14px;

  background: rgba(255, 95, 95, 0.9);
  backdrop-filter: blur(10px);

  color: white;
  font-size: 14px;
  font-weight: 500;

  box-shadow: 0 10px 25px rgba(0,0,0,0.2);

  z-index: 999;
}

/* ICONO */
.error-box .icon {
  font-size: 18px;
}

/* ANIMACIÓN */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}


</style>
