<template>
    <div class="login-container">
        <img src="../pio.png" alt="Logo">
        <h1>Login</h1>
        <hr/>
        <h2>User</h2>
        <input type="text" v-model="usuario" placeholder="Ingresa tu usuario">
        <h2>Password</h2>    
        <input type="password" v-model="password" placeholder="Ingresa tu Contraseña">
        <h2></h2>
        <button @click="iniciarSesion">Iniciar sesión</button>
    
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from "@/supabase/supabase";

const router = useRouter();
const usuario = ref('');
const password = ref('');
const userLogin = ref(0);


const iniciarSesion = async () => {
    const { data, error } = await supabase
        .from("usuarios")
        .select("idusuario,userName, password")
        .eq("userName", usuario.value)
        .single();  // Si solo hay un usuario con ese nombre

       
    if (error) {
       console.error("Error al obtener usuario:", error.message);
        return;
    }

    if (data && data.password === password.value) {
        localStorage.setItem('userLogin', data.idUsuario);
        router.push('/home');
    } else {
        console.log("Usuario o contraseña incorrectos");
        router.push('/');
    }
};

</script>

<style scoped>
.login-container {
    max-width: 300px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}
input {
    width: 100%;
    padding: 8px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}
button {
    background-color: #ffcc00;
    border: none;
    padding: 10px;
    width: 100%;
    border-radius: 5px;
    cursor: pointer;
}
</style>