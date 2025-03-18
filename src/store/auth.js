
import { ref } from "vue";

// Variable global para el usuario logueado
export const userLogin = ref(localStorage.getItem("userLogin") || 0);