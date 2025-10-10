<script setup lang="ts">
// @ts-ignore
definePageMeta({
  layout: "public",
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.1) 1px, transparent 0); background-size: 60px 60px;"></div>
    </div>

    <!-- Floating Elements -->
    <div class="absolute top-20 left-20 w-32 h-32 bg-gray-800/30 rounded-full blur-xl"></div>
    <div class="absolute bottom-20 right-20 w-40 h-40 bg-gray-700/30 rounded-full blur-xl"></div>
    <div class="absolute top-1/2 left-10 w-24 h-24 bg-gray-600/30 rounded-full blur-xl"></div>

    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
      <!-- Logo Section -->
      <div class="text-center mb-12">
        <div class="relative">
          <NuxtImg
            class="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-2xl border-4 border-white/20 backdrop-blur-sm"
            src="/favicon/512.png"
          />
          <div class="absolute -inset-2 bg-gradient-to-r from-gray-600 to-gray-500 rounded-2xl blur opacity-20"></div>
        </div>
        <h1 class="text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-400 bg-clip-text text-transparent mb-2">
          CS2Mix
        </h1>
        <p class="text-xl text-gray-300 font-medium">.com.br</p>
        <p class="text-gray-400 mt-2 text-lg">A melhor plataforma de CS2 do Brasil</p>
      </div>

      <!-- Login Card -->
      <div class="w-full max-w-md">
        <div class="bg-black/40 backdrop-blur-lg rounded-3xl border border-gray-800/50 shadow-2xl p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-white mb-2">
              {{ $t("pages.login.sign_in") || "Entrar" }}
            </h2>
            <p class="text-gray-300">
              Faça login com sua conta Steam
            </p>
          </div>

          <!-- Steam Login Button -->
          <div class="relative group">
            <button
              @click="signIn"
              class="w-full bg-gradient-to-r from-[#1b2838] to-[#2a475e] hover:from-[#2a475e] hover:to-[#1b2838] text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-600/50"
            >
              <div class="flex items-center justify-center space-x-3">
                <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>
                <span class="text-lg">Entrar com Steam</span>
              </div>
            </button>
            <div class="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <!-- Features -->
          <div class="mt-8 space-y-3">
            <div class="flex items-center text-gray-300 text-sm">
              <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              Matchmaking inteligente
            </div>
            <div class="flex items-center text-gray-300 text-sm">
              <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              Torneios e competições
            </div>
            <div class="flex items-center text-gray-300 text-sm">
              <svg class="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              Estatísticas detalhadas
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-12 text-center">
        <p class="text-gray-400 text-sm">
          Desenvolvido com ❤️ para a comunidade brasileira de CS2
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAuthStore } from "~/stores/AuthStore";
import { GithubLogoIcon } from "@radix-icons/vue";

export default {
  methods: {
    signIn() {
      const authLink = this.authLink;
      if (authLink) {
        window.location.href = authLink;
      } else {
        console.error('Auth link not found');
      }
    },
  },
  watch: {
    me: {
      immediate: true,
      handler(me: Record<string, unknown>) {
        if (me) {
          this.$router.push("/");
        }
      },
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    authLink() {
      return `https://${useRuntimeConfig().public.webDomain}/auth/steam?redirect=${encodeURIComponent(
        window.location.toString(),
      )}`;
    },
  },
};
</script>
