<script lang="ts">
import { Loader, ExternalLink, Copy } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import ClipBoard from "~/components/ClipBoard.vue";

export default {
  components: {
    Loader,
    ExternalLink,
    Copy,
    ClipBoard,
    Button,
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
  <div v-if="server.connection_string" class="flex items-center gap-1">
    <ClipBoard :data="server.connection_string"></ClipBoard>
    <a
      :href="server.connection_link"
      v-if="server.connection_link"
      @click="handleClick"
    >
      <Button variant="outline" class="min-w-32" :disabled="isLoading">
        <template v-if="!isLoading">
          <ExternalLink class="w-4 h-4 mr-1" />
          {{ $t("server.join_server") }}
        </template>
        <Loader v-else class="w-4 h-4 animate-spin" />
      </Button>
    </a>
  </div>
</template>
