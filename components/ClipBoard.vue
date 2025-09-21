<script lang="ts" setup>
import { Copy } from "lucide-vue-next";
</script>
<template>
  <div
    class="copy bg-background hover:bg-background/50 transition-colors"
    @click="copyToClipboard"
  >
    <div
      ref="copy"
      class="icon--btn icon--btn-small"
      :data-clipboard-text="data"
    >
      <slot>
        <Copy></Copy>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { toast } from "@/components/ui/toast";
export default {
  props: {
    data: {
      required: false,
      type: String,
      default: "",
    },
  },
  methods: {
    async copyToClipboard() {
      if (!this.data) {
        console.warn("data missing");
        return;
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.data);
        } else {
          this.fallbackCopyToClipboard(this.data);
        }

        toast({
          title: "Copied to Clipboard",
        });
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        this.fallbackCopyToClipboard(this.data);
        toast({
          title: "Copied to Clipboard",
        });
      }
    },

    fallbackCopyToClipboard(text) {
      // Create a temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make it invisible
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);

      // Select and copy the text
      textArea.focus();
      textArea.select();

      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback copy failed:", err);
      }

      document.body.removeChild(textArea);
    },
  },
};
</script>

<style>
.copy {
  cursor: pointer;
  margin: 0 10px;
  display: inline;
  svg {
    width: 22px;
    height: auto;
  }
}
</style>
