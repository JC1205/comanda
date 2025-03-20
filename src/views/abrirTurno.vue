<template>
  <div v-if="mostrar">

    <div v-if="alertaVisible" role="alert" class="alert alert-success">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>¡Turno registrado correctamente!</span>
    </div>

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
import { supabase } from "@/supabase/supabase";
import { defineEmits, defineProps, ref } from "vue";
import VueDraggableResizable from "vue-draggable-resizable";
import "vue-draggable-resizable/style.css";
import {userLogin,turno,obtenerTurno,idTurno} from "@/store/auth.js";



// Props y eventos
const props = defineProps(["mostrar"]);
const emit = defineEmits(["cerrar"]);

// Variables
const montoInicial = ref(0);
const alertaVisible = ref(false);


// Fecha y Hora en formato correcto
const now = new Date();
const fecha = ref(now.toISOString().split("T")[0]); // "YYYY-MM-DD"
const hora = ref(now.toISOString().split("T")[1].split(".")[0]); // "HH:MM:SS"




const confirmar = async () => {
  await obtenerTurno();

  if (turno.value) {
    console.log("Ya hay un turno abierto");
    return;
  }

  const { data, error } = await supabase.from("turnos").insert([
    {
      idusuario: userLogin.value,
      fecha: fecha.value,
      horaapertura: hora.value,
      montoinicial: montoInicial.value,
    },
  ]);

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  await obtenerTurno();
  turno.value = true;

  // Emitir evento a Home para mostrar alerta
  emit("turnoAbierto");

  emit("cerrar");
};
</script>
  
  
  <style scoped>
  .internal-frame {
    position: fixed;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    background: rgb(247, 219, 75);
    color: rgb(0, 0, 0);
    padding: 5px;
    text-align: center;
    position: relative;
  }
  
  .close-btn {
    width: 20px;
    height: 25px;
    position: absolute;
    right: 5px;
    top: 5px;
    background: red;
    color: white;
    border: none;
    
    cursor: pointer;
    border-radius: 5px;
  }
  
  .content {
    padding: 10px;
    text-align: center;
  }
  </style>
  