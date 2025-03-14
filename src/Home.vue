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

  <div class="container">
    <AbrirTurno :mostrar="mostrarVentana" @cerrar="mostrarVentana = false" />
    <img src="/PIO2.jpeg" alt="">
    
  </div>
  
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
  background-color: rgb(247, 219, 75);
  border: none;
  padding: 15px;
  min-width: 100px;
  height: 65px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: background-color 0.3s ease,transform 0.2s ease;
}

.container{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

img{
  width: 500px;
  max-width: 100%;
  max-height: 100%;
}

button:hover {
  transform: scale(1.07);
}

button:active{
  background-color: white;
}

.salir-btn {
  margin-left: auto;
}
</style>
