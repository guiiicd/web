<script setup lang="ts">
import { useSound } from "~/composables/useSound";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, VolumeX } from "lucide-vue-next";

definePageMeta({
  layout: "profile-settings",
});

const { isEnabled, volume, updateSettings, playNotificationSound } = useSound();

const handleSoundToggle = (enabled: boolean) => {
  updateSettings(enabled);
};

const handleVolumeChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newVolume = parseFloat(target.value);
  updateSettings(isEnabled.value, newVolume);
};

const testSound = () => {
  playNotificationSound();
};
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      {{ $t("pages.settings.notifications.title") }}
    </h3>
    <p class="text-sm text-muted-foreground">
      {{ $t("pages.settings.notifications.description") }}
    </p>
  </div>
  <Separator />

  <div class="space-y-6">
    <!-- Chat Sound Notifications -->
    <div
      class="flex flex-row items-center justify-between rounded-lg border p-4"
    >
      <div class="space-y-0.5">
        <h4 class="text-base font-medium">
          {{ $t("pages.settings.notifications.chat_sound.title") }}
        </h4>
        <p class="text-sm text-muted-foreground">
          {{ $t("pages.settings.notifications.chat_sound.description") }}
        </p>
      </div>
      <Switch
        :model-value="isEnabled"
        @update:model-value="handleSoundToggle"
      />
    </div>

    <!-- Volume Control -->
    <div v-if="isEnabled" class="space-y-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">
            {{ $t("pages.settings.notifications.volume.title") }}
          </label>
          <div class="flex items-center gap-2">
            <VolumeX v-if="volume === 0" class="h-4 w-4" />
            <Volume2 v-else class="h-4 w-4" />
            <span class="text-sm text-muted-foreground">
              {{ Math.round(volume * 100) }}%
            </span>
          </div>
        </div>
        <Input
          type="range"
          :value="volume"
          @input="handleVolumeChange"
          :max="1"
          :min="0"
          :step="0.1"
          class="w-full"
        />
      </div>

      <!-- Test Sound Button -->
      <Button variant="outline" @click="testSound" class="w-full">
        {{ $t("pages.settings.notifications.test_sound") }}
      </Button>
    </div>
  </div>
</template>
