<template>
    <div class="login-bg">
        <div class="login-container">
            <img src="../PIO.jpg" alt="Logo">
            <h1>Bienvenido!</h1>
            <input type="text" v-model="usuario" placeholder="Usuario">
            <input type="password" v-model="password" placeholder="Contraseña">
        <button @click="iniciarSesion">Iniciar sesión</button>
        <p class="text-blue-500 font-bold">Si esto es azul, Tailwind funciona.</p>
        </div>
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
*{
    margin:  0;
    padding:  0;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
}
.login-bg{
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(214, 214, 214);
    height: 100vh;
}
.login-container{
    background-color: rgb(255, 255, 255);
    width: 430px;
    height: 430px;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
    border-radius: 10px;

}

button{
    background-color: rgb(247, 219, 75);
    height: 45px;
    width: 300px;
    border-radius: 13px;
    border: 0;
    font-size: 15px;
    margin-top: 20px;
    transition: background-color 0.3s ease, transform 0.2s ease;
    cursor: pointer;

}

button:hover {
    transform:  scale(1.02);
}

button:active{
    background-color: rgb(255, 255, 255);
}

input{
    height: 45px;
    width: 300px;
    margin-top: 20px;
    padding-left: 10px;

}

img{
    width: 80px;
    margin-top: 35px;
}

h2{
    font-weight: 700;
    font-size: 35px;
    margin-top: 5px;

    
}

::placeholder{
    font-size: 15px;
}
</style>