import { defineStore, acceptHMRUpdate } from "pinia";
import { ref, computed } from "vue";
import { e_player_roles_enum } from "~/generated/zeus";
import getGraphqlClient from "~/graphql/getGraphqlClient";
import { generateSubscription } from "~/graphql/graphqlGen";
import { useMatchmakingStore } from "./MatchmakingStore";
import { order_by } from "@/generated/zeus";

interface Region {
  value: string;
  description: string;
  is_lan: boolean;
  status: string;
}

export const useApplicationSettingsStore = defineStore(
  "applicationSettings",
  () => {
    const settings = ref<Array<{ name: string; value: string }>>([]);

    const subscribeToSettings = async () => {
      const subscription = getGraphqlClient().subscribe({
        query: generateSubscription({
          settings: [
            {},
            {
              name: true,
              value: true,
            },
          ],
        }),
      });

      subscription.subscribe({
        next: ({ data }) => {
          settings.value = data.settings;
        },
      });
    };

    subscribeToSettings();

    const currentPluginVersion = ref<string | null>(null);

    const subscribeToPluginVersion = async () => {
      const subscription = getGraphqlClient().subscribe({
        query: generateSubscription({
          plugin_versions: [
            {
              limit: 1,
              order_by: [
                {
                  published_at: order_by.desc,
                },
              ],
            },
            {
              version: true,
            },
          ],
        }),
      });

      subscription.subscribe({
        next: ({ data }) => {
          currentPluginVersion.value = data.plugin_versions.at(0).version;
        },
      });
    };

    subscribeToPluginVersion();

    const matchCreateRole = computed(() => {
      if (!settings.value) {
        return false;
      }

      const create_matches_role = settings.value.find(
        (setting) => setting.name === "public.create_matches_role",
      );

      return create_matches_role?.value || e_player_roles_enum.user;
    });

    const tournamentCreateRole = computed(() => {
      if (!settings.value) {
        return false;
      }

      const create_tournaments_role = settings.value.find(
        (setting) => setting.name === "public.create_tournaments_role",
      );

      return create_tournaments_role?.value || e_player_roles_enum.user;
    });

    const matchmakingAllowed = computed(() => {
      if (!settings.value) {
        return false;
      }

      const matchMakingSetting = settings.value.find(
        (setting) => setting.name === "public.matchmaking",
      );

      const matchmakingEnabled = matchMakingSetting
        ? matchMakingSetting.value === "true"
        : true;

      if (!matchmakingEnabled) {
        return false;
      }

      const matchmakingMinRole = settings.value.find(
        (setting) => setting.name === "public.matchmaking_min_role",
      );

      if (!matchmakingMinRole) {
        return true;
      }

      return useAuthStore().isRoleAbove(matchmakingMinRole.value);
    });

    const supportsDiscordBot = computed(() => {
      if (!settings.value) {
        return false;
      }

      return (
        settings.value.find(
          (setting) => setting.name === "public.supports_discord_bot",
        )?.value === "true"
      );
    });

    const supportsGameServerNodes = computed(() => {
      if (!settings.value) {
        return false;
      }

      return (
        settings.value.find(
          (setting) => setting.name === "supports_game_server_nodes",
        )?.value === "true"
      );
    });

    const supportsGameServerVersionPinning = computed(() => {
      if (!settings.value) {
        return false;
      }

      return (
        settings.value.find(
          (setting) => setting.name === "supports_game_server_version_pinning",
        )?.value === "true"
      );
    });

    const playerNameRegistration = computed(() => {
      return (
        settings.value?.find(
          (setting) => setting.name === "public.player_name_registration",
        )?.value === "true"
      );
    });

    const availableRegions = ref<Region[]>([]);

    const subscribeToAvailableRegions = async () => {
      const subscription = getGraphqlClient().subscribe({
        query: generateSubscription({
          server_regions: [
            {
              where: {
                total_server_count: {
                  _gt: 0,
                },
              },
            },
            {
              value: true,
              status: true,
              description: true,
              is_lan: true,
              has_node: true,
            },
          ],
        }),
      });

      subscription.subscribe({
        next: ({ data }) => {
          availableRegions.value = data.server_regions;
          useMatchmakingStore().checkLatenies();
        },
      });
    };

    subscribeToAvailableRegions();

    const canCreateMatch = computed(() => {
      const me = useAuthStore().me;
      if (!me) {
        return false;
      }

      return useAuthStore().isRoleAbove(matchCreateRole.value);
    });

    const canAddWithoutInvite = computed(() => {
      const lineupAddWithoutInviteRole = settings.value.find(
        (setting) => setting.name === "public.lineup_add_without_invite",
      )?.value;

      if (!lineupAddWithoutInviteRole) {
        return true;
      }

      return useAuthStore().isRoleAbove(lineupAddWithoutInviteRole);
    });

    const maxAcceptableLatency = computed(() => {
      return settings.value.find(
        (setting) => setting.name === "public.max_acceptable_latency",
      )?.value;
    });

    return {
      settings,
      availableRegions,
      maxAcceptableLatency,
      matchCreateRole,
      matchmakingAllowed,
      tournamentCreateRole,
      supportsDiscordBot,
      supportsGameServerNodes,
      supportsGameServerVersionPinning,
      playerNameRegistration,
      canCreateMatch,
      currentPluginVersion,
      canAddWithoutInvite,
    };
  },
);

if (import.meta.hot) {
  import.meta.hot.accept(
    acceptHMRUpdate(useApplicationSettingsStore, import.meta.hot),
  );
}
