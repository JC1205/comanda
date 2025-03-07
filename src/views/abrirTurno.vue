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
import { supabase } from "@/supabase/supabase";

// Props y eventos
const props = defineProps(["mostrar", "userLogin"]);
const emit = defineEmits(["cerrar"]);

// Variables
const montoInicial = ref(0);
const idTurno = ref(0);

// Fecha y Hora en formato correcto
const now = new Date();
const fecha = ref(now.toISOString().split("T")[0]); // "YYYY-MM-DD"
const hora = ref(now.toISOString().split("T")[1].split(".")[0]); // "HH:MM:SS"

// Método para abrir turno
const confirmar = async () => {
  // if (idTurno.value !== 0) {
  //   console.log("Ya hay un turno abierto");
  //   return;
  // }

  // Insertar el turno
  const { data, error } = await supabase.from("turnos").insert([
    {
      idusuario: props.userLogin,
      fecha: fecha.value,
      horaapertura: hora.value,
      horacierre: null,
      montoinicial: montoInicial.value,

    },
  ]);

  if (error) {
    console.error("Error:", error.message);
    return;
  }
  console.log("Turno abierto correctamente");

  // Obtener el idTurno recién insertado
  // const { data: turnoAbierto, error: errorTurno } = await supabase
  //   .from("turno")
  //   .select("idTurno")
  //   .eq("horaCierre", null);

  // if (errorTurno) {
  //   console.error("Error al obtener turno abierto:", errorTurno.message);
  // } else if (turnoAbierto && turnoAbierto.length > 0) {
  //   idTurno.value = turnoAbierto[0].idTurno;
  // }

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
  