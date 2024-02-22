<template>
  <div class="min-h-screen flex items-center justify-center">
    <form class="bg-gray-400 shadow-md rounded px-8 pt-6 pb-8 mb-4 w-64" @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
          Username:
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="email" type="text" v-model="email" required
        />
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
          Password:
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="password" type="password" v-model="password" required
        />
      </div>
      <div class="flex items-center justify-between">
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Sign In
        </button>
      </div>
    </form>
  </div>
</template>

  
<script lang="ts">
import { defineComponent } from 'vue';

interface LoginResponseModel {
  ApiStatus: true;
  ApiStatusCode: string;
  ApiStatusMessage: string;
  Data: {
    AccessToken: string;
    RefreshToken: string;
    TokenType: string;
    ExpiresAt: string;
  };
}

  export default defineComponent({
    data() {
      return {
        email: 'homework@eva.guru',
        password: 'Homeworkeva1**'
      };
    },
    methods: {
      async submitForm() {
        try {
          const response = await this.sendCredentials();
          this.handleApiResponse(response);
        } catch (error) {
          console.error(error);
        }
      },
      async sendCredentials() {
        const url = 'https://iapitest.eva.guru/oauth/token';
        const body = {
            Email: this.email,
            Password: this.password,
            GrantType: 'password',
            Scope: 'amazon_data',
            ClientId: 'C0001',
            ClientSecret: 'SECRET0001',
            RedirectUri: 'https://api.eva.guru'
        };
  
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
  
        return response.json() as Promise<LoginResponseModel>;
      },
      handleApiResponse(response: LoginResponseModel) {
        const { ApiStatus, ApiStatusMessage, Data } = response;
  
        if (ApiStatus) {
          // Successful response (200)
          localStorage.setItem('email', this.email);
          localStorage.setItem('accessToken', Data.AccessToken);
          // Redirect to home page (replace with your home page route)
          this.$router.push('/data');
        } else {
          // Unsuccessful response (401 or 500)
          alert(ApiStatusMessage);
        }
      }
    }
  });
</script>
  
<style scoped>
/* Add your styles here if needed */
</style>
  