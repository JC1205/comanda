<template>
    <div class="home-container">
      <button class="comedor-button" @click="">Comedor</button>
      <button class="domicilio-button" @click="">Domicilio</button>
      <button class="cerrar-sesion-button"@click="cerrarSesion">Cerrar sesión</button>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const cerrarSesion = () => {
    router.push('/'); 
  };
  </script>

<style>

.comedor-button {
  background-color: rgb(223, 246, 77);
  color: rgb(0, 0, 0); 
  border: 10;
  padding: 25px 10px;
  font-size: 12px;
  border-radius: 15px; 
  cursor: pointer; 
}

.domicilio-button {
  background-color: rgb(223, 246, 77);
  color: rgb(0, 0, 0); 
  border: 10;
  padding: 25px 10px;
  font-size: 12px;
  border-radius: 15px; 
  cursor: pointer; 
}

.cerrar-sesion-button {
  background-color: hwb(68 30% 4%);
  color: rgb(0, 0, 0); 
  border: 10;
  padding: 25px 10px;
  font-size: 12px;
  border-radius: 15px; 
  cursor: pointer; 
}

.home-container {
  background-color: #81817f; 
  padding: 20px; 
}

</style>
  