<script lang="ts">
import { Loader, ExternalLink, Copy } from "lucide-vue-next";
import ClipBoard from "~/components/ClipBoard.vue";

export default {
  components: {
    Loader,
    ExternalLink,
    Copy,
    ClipBoard,
  },
  props: {
    server: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isLoading: false,
    };
  },
  methods: {
    handleClick() {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 10000);
    },
  },
};
</script>

<template>
  <div v-if="server.connection_string">
    <div class="flex items-center gap-2 p-4 rounded-lg border bg-foreground/10">
      <ClipBoard
        :data="server.connection_string"
        class="shrink-0 p-3 rounded-md"
        :class="{
          grow: !server.connection_link,
        }"
      >
        <div
          class="flex items-center justify-center gap-2"
          v-if="!server.connection_link"
        >
          <Copy class="w-4 h-4" />
          <span>{{ $t("server.copy_connection_string") }}</span>
        </div>
      </ClipBoard>
      <template v-if="server.connection_link">
        <a
          :href="server.connection_link"
          class="flex items-center justify-center gap-2 rounded-md p-3 w-full transition-colors bg-background hover:bg-background/50"
          @click="handleClick"
        >
          <template v-if="!isLoading">
            <span>{{ $t("server.join_server") }}</span>
            <ExternalLink class="w-4 h-4" />
          </template>
          <Loader v-else class="w-6 h-6 animate-spin" />
        </a>
      </template>
    </div>
  </div>
</template>
