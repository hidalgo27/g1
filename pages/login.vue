<script setup lang="ts">

const username = ref('');
const password = ref('');
const error = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleLogin = () => {
  if (authStore.login(username.value, password.value)) {
    router.push('/leads');
  } else {
    error.value = 'Credenciales incorrectas';
  }
};

</script>

<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center ">
    <!-- Logo -->
    <!--    <div class="absolute top-48 left-1/2 transform -translate-x-1/2">-->
    <!--      <img src="https://gotoperu-com.s3-us-west-1.amazonaws.com/logos/logo-gotoperu-black.png" alt="Logo">-->
    <!--    </div>-->

    <div class="bg-white px-5 py-2 rounded-full shadow-xl">
      <img src="https://gotoperu-com.s3-us-west-1.amazonaws.com/logos/logo-gotoperu-black.png" alt="Logo" class="w-40">
    </div>
    <!-- Formulario de ingreso -->
    <div class="bg-white shadow-xl rounded-xl px-8 py-16 mt-24 w-full max-w-lg">
      <h1 class="text-4xl font-bold text-center mb-4">Hola,</h1>
      <p class="text-center text-gray-600 text-lg font-medium mb-6">Ingresa tus datos para identificarte</p>

      <form  @submit.prevent="handleLogin" class="space-y-6">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="size-7">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </span>
          <input v-model="username" type="text" placeholder="Ingresa tu usuario o correo" class="w-full rounded-md bg-gray-100 pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-400">
        </div>

        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="size-7">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </span>
          <input v-model="password" type="password" placeholder="Ingresa tu contraseña" class="w-full bg-gray-100 rounded-md pl-12 pr-4 py-4 pr-10 focus:ring-2 focus:ring-green-400 outline-none" />
          <span class="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
            <!-- Ícono para alternar visibilidad -->
          </span>
        </div>

        <button class="mt-4 w-full bg-primary text-white py-4 rounded-md hover:bg-green-700 transition-colors">Ingresar</button>

        <p class="text-center  text-sm text-gray-500 cursor-pointer font-semibold hover:text-gray-800 transition-colors">Olvidé mi contraseña</p>
      </form>
      <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
    </div>

    <!-- Background Image -->
    <div class="absolute  inset-0 -z-10 bg-cover bg-bottom " style="background-image: url('/images/fondo.jpg');"></div>
  </div>
</template>

<style scoped>

</style>