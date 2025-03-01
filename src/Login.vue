<template>
    <div class="login-container">
        <img src="C:\Users\gamer\PioDesk\pio.png" alt="Logo">
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

const router = useRouter();
const usuario = ref('');
const password = ref('');


// Prueba de usuarios
const usuarios = [
    { username: 'admin', password: '1234' }
];

const iniciarSesion = () => {
    const esValido = usuarios.some(u => u.username === usuario.value && u.password === password.value);

    if (esValido) {
        router.push('/home');
    } else {
        console.log('Usuario o contraseña incorrectos');
        router.push('/')
    }
};

</script>
