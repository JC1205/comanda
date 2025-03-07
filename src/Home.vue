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

<style scoped>
.home-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #dcdcdc;
  padding: 15px;
  gap: 10px;
}

button {
  background-color: #ffcc00;
  border: none;
  padding: 15px;
  min-width: 100px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  text-align: center;
}

button:hover {
  background-color: #e6b800;
}

.salir-btn {
  margin-left: auto;
}
</style>
