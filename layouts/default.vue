<script setup lang="ts">
import AppNav from "~/layouts/components/AppNav.vue";
import MatchmakingConfirm from "~/components/matchmaking/MatchmakingConfirm.vue";
import PlayerNameRegistration from "~/components/PlayerNameRegistration.vue";
</script>

<template>
  <PlayerNameRegistration></PlayerNameRegistration>
  <MatchmakingConfirm></MatchmakingConfirm>
  <div class="flex min-h-screen w-full flex-col">
    <AppNav>
      <slot></slot>
    </AppNav>
  </div>

  <div id="global-chat-container"></div>
</template>

<script lang="ts"></script>
