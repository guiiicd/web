import { ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useNotificationStore = defineStore("notifaicationStore", () => {
  const notificationsGranted = ref(false);
  const notificationsEnabled = ref(false);

  const sendNotification = async (title: string, tag: string, options: NotificationOptions, force: boolean = false) => {
    if (notificationsEnabled.value) {
      if ((document.visibilityState !== "hidden" && !force ) || Notification.permission !== "granted") {
        return;
      }
      new Notification(title, {
        ...options,
        icon: "/favicon/64.png",
      });
    }
  };

  const setupNotifications = async () => {
    if ("Notification" in window) {
      if(Notification.permission === "granted") {
        notificationsGranted.value = true;
        notificationsEnabled.value = true;
        return;
      }
      const permission = await Notification.requestPermission();

      notificationsGranted.value = permission === "granted";
      notificationsEnabled.value = notificationsGranted.value;
    }
  };

  setupNotifications();

  return {
    notificationsGranted,
    notificationsEnabled,
    sendNotification,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useNotificationStore, import.meta.hot),
  );
}
