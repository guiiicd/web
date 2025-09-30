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
      <div
        :class="{
          'mx-auto': !showLeftNav,
          'lg:max-w-7xl': containContent,
        }"
      >
        <slot></slot>
      </div>
    </AppNav>
  </div>

  <div id="global-chat-container"></div>
</template>

<script lang="ts">
import { e_player_roles_enum } from "~/generated/zeus";

export default {
  computed: {
    containContent() {
      switch (this.$route.name) {
        case "matches-id":
          return false;
        default:
          return true;
      }
    },
    showLeftNav() {
      return useAuthStore().isRoleAbove(e_player_roles_enum.match_organizer);
    },
  },
};
</script>
