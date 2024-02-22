<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
const router = useRouter();

const handleLogout = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    // Make a logout request
    await fetch('https://iapitest.eva.guru/user/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('email');

    // Route to /login
    router.push('/login');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
</script>

<template>
  <div class="bg-blue-400 py-4">
    <nav class="container mx-auto">
      <div class="text-white mx-4 hover:text-gray-800 cursor-pointer w-min" @click="handleLogout">Login/Logout</div> 
    </nav>
  </div>

  <div class="main">
    <RouterView />
  </div>
</template>

<style scoped>
</style>
