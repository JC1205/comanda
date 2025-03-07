<template>
  <div class="home-container">
    <button @click="">Comedor</button>
    <button @click="">Domicilio</button>
    <button @click="">Retiro y <br> depósito</button>
    <button @click="">Consultar <br> citas</button>
    <button @click="mostrarVentana = true">Abrir turno</button>
    <button @click="">Cerrar turno</button>
    <button @click="salir">Salir</button>
  </div>

  <AbrirTurno :mostrar="mostrarVentana" @cerrar="mostrarVentana = false" />
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import AbrirTurno from "@/views/abrirTurno.vue";

// Estado
const mostrarVentana = ref(false);
const router = useRouter();

const salir = () => {
  router.push("/");
};
</script>
