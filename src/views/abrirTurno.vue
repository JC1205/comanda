<template>
    <div v-if="mostrar">
      <vue-draggable-resizable :w="300" :h="200" :x="100" :y="100" :resizable="false">
        <div class="internal-frame">
          <div class="header">
            Abrir turno
            <button class="close-btn" @click="$emit('cerrar')">X</button>
          </div>
          <div class="content">
            <p>Monto inicial:</p>
            <input v-model="montoInicial" type="number" placeholder="Monto" />
            <button @click="confirmar">Confirmar</button>
          </div>
        </div>
      </vue-draggable-resizable>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from "vue";
  import VueDraggableResizable from "vue-draggable-resizable";
  import "vue-draggable-resizable/style.css";
  
  // Props y eventos
  const props = defineProps(["mostrar"]);
  const emit = defineEmits(["cerrar"]);
  
  // Variables
  const montoInicial = ref("");
  
  // Métodos
  const confirmar = () => {
    if (!montoInicial.value) {
      console.log("No se ingresó ningún monto");
      return;
    }
    console.log("Monto registrado:", Number(montoInicial.value));
    emit("cerrar");
  };
  </script>
  
  <style scoped>
  .internal-frame {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    background: #c7eb52;
    color: rgb(0, 0, 0);
    padding: 5px;
    text-align: center;
    position: relative;
  }
  
  .close-btn {
    position: absolute;
    right: 5px;
    top: 1px;
    background: red;
    color: white;
    border: none;
    padding: 4px;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .content {
    padding: 10px;
    text-align: center;
  }
  </style>
  