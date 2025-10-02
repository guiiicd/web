import { ref } from "vue";

export const useSound = () => {
  const isEnabled = ref(true);
  const volume = ref(0.5);

  const loadSettings = () => {
    if (!import.meta.client) {
      return;
    }

    const savedEnabled = localStorage.getItem("chat-sound-enabled");
    const savedVolume = localStorage.getItem("chat-sound-volume");

    if (savedEnabled !== null) {
      isEnabled.value = savedEnabled === "true";
    }
    if (savedVolume !== null) {
      volume.value = parseFloat(savedVolume);
    }
  };

  const saveSettings = () => {
    if (!import.meta.client) {
      return;
    }

    localStorage.setItem("chat-sound-enabled", isEnabled.value.toString());
    localStorage.setItem("chat-sound-volume", volume.value.toString());
  };

  const generateBeepSound = (
    frequency: number = 800,
    duration: number = 200,
  ) => {
    if (!import.meta.client) {
      return;
    }

    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      volume.value * 0.3,
      audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration / 1000,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);

    return audioContext;
  };

  const playNotificationSound = () => {
    if (!import.meta.client || !isEnabled.value) {
      return;
    }

    try {
      generateBeepSound(800, 200);

      // Add a second beep for a more distinctive notification
      setTimeout(() => {
        generateBeepSound(600, 150);
      }, 100);
    } catch (error) {
      console.warn("Failed to play notification sound:", error);
    }
  };

  const updateSettings = (enabled: boolean, newVolume?: number) => {
    isEnabled.value = enabled;
    if (newVolume !== undefined) {
      volume.value = Math.max(0, Math.min(1, newVolume));
    }
    saveSettings();
  };

  if (import.meta.client) {
    loadSettings();
  }

  return {
    updateSettings,
    playNotificationSound,
    volume: readonly(volume),
    isEnabled: readonly(isEnabled),
  };
};
