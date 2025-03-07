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
