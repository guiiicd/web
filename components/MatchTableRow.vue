<script setup lang="ts">
import { UserPlusIcon, EyeIcon, EyeOffIcon, UsersIcon } from "lucide-vue-next";
import TimeAgo from "~/components/TimeAgo.vue";
import { e_lobby_access_enum, e_match_status_enum } from "~/generated/zeus";
import cleanMapName from "~/utilities/cleanMapName";
import PlayerDisplay from "~/components/PlayerDisplay.vue";
</script>

<template>
  <div
    class="bg-muted/30 border border-border rounded-lg hover:shadow-md hover:bg-muted/20 transition-all duration-200 cursor-pointer group"
    @click="navigateToMatch(match.id, $event)"
  >
    <div class="block p-6">
      <!-- Match Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <Badge variant="secondary" class="text-xs">
            {{ match.options.type }}
          </Badge>
        </div>
        <div class="flex items-center space-x-4">
          <!-- Join Button - Prominent Position -->
          <Button
            v-if="
              match.status === e_match_status_enum.PickingPlayers &&
              match.options.lobby_access === e_lobby_access_enum.Open &&
              !match.lineup_1.is_on_lineup &&
              !match.lineup_2.is_on_lineup
            "
            variant="default"
            size="sm"
            class="flex items-center space-x-2"
            @click.stop="navigateToMatch(match.id, $event)"
          >
            <UserPlusIcon class="h-4 w-4" />
            <span>{{ $t("match.options.table.join") }}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            @click.stop="toggleShowPlayers"
            class="flex items-center space-x-2"
          >
            <EyeIcon v-if="!showPlayers" class="h-4 w-4" />
            <EyeOffIcon v-else class="h-4 w-4" />
            <span>{{ showPlayers ? "Hide Players" : "Show Players" }}</span>
          </Button>
          <div
            class="flex items-center space-x-2 text-sm text-muted-foreground"
          >
            <Badge variant="outline" class="text-xs">
              {{ match.e_match_status.description }}
            </Badge>

            <TimeAgo
              :date="match.started_at || match.scheduled_at || match.created_at"
            ></TimeAgo>
            <template v-if="match.ended_at">
              <span>•</span>
              <span>Duration: {{ getMatchDuration(match) }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Teams Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <!-- Team 1 -->
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div
                class="w-14 h-14 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg border-2 border-primary/20"
              >
                {{ getTeamInitials(match.lineup_1.name) }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">
                {{ match.lineup_1.name }}
              </h3>
              <div class="flex items-center space-x-2 mt-1">
                <UsersIcon class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">
                  {{ match.lineup_counts.lineup_1_count }}/{{
                    match.max_players_per_lineup
                  }}
                  players
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-foreground">
                {{ getTeamScore(match, match.lineup_1.id) }}
              </div>
            </div>
          </div>

          <!-- Players for Team 1 -->
          <div v-if="showPlayers" class="space-y-2">
            <div
              v-if="matchStats.lineup_1"
              class="bg-muted/50 rounded-lg p-4 border border-border min-h-[200px] flex flex-col"
            >
              <h5 class="text-sm font-semibold text-foreground mb-3">
                {{ matchStats.lineup_1.name }} Stats
              </h5>
              <div class="overflow-x-auto flex-1">
                <table class="w-full text-xs min-w-[400px] h-full">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="text-left py-2 px-3 font-medium">Player</th>
                      <th class="text-center py-2 px-3 font-medium w-12">K</th>
                      <th class="text-center py-2 px-3 font-medium w-12">D</th>
                      <th class="text-center py-2 px-3 font-medium w-12">A</th>
                      <th class="text-center py-2 px-3 font-medium w-16">
                        DMG
                      </th>
                      <th class="text-center py-2 px-3 font-medium w-12">
                        K/D
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template
                      v-for="lineupPlayer in matchStats.lineup_1.lineup_players"
                      :key="lineupPlayer.steam_id"
                    >
                      <tr class="border-b border-border/50 last:border-b-0">
                        <td class="py-3 px-3">
                          <PlayerDisplay
                            :player="lineupPlayer.player"
                          ></PlayerDisplay>
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            lineupPlayer.player.kills_aggregate?.aggregate
                              ?.count || 0
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            lineupPlayer.player.deaths_aggregate?.aggregate
                              ?.count || 0
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            lineupPlayer.player.assists_aggregate?.aggregate
                              ?.count || 0
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            Math.round(
                              lineupPlayer.player.damage_dealt_aggregate
                                ?.aggregate?.sum?.damage || 0,
                            )
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            getKDRatio(
                              lineupPlayer.player.kills_aggregate?.aggregate
                                ?.count || 0,
                              lineupPlayer.player.deaths_aggregate?.aggregate
                                ?.count || 0,
                            )
                          }}
                        </td>
                      </tr>
                    </template>
                    <!-- Empty rows to maintain consistent height -->
                    <template
                      v-for="i in Math.max(
                        0,
                        5 -
                          (matchStats.lineup_1?.lineup_players?.length ||
                            match.lineup_1?.lineup_players?.length ||
                            0),
                      )"
                      :key="`empty-${i}`"
                    >
                      <tr class="border-b border-border/50 last:border-b-0">
                        <td class="py-3 px-3">
                          <PlayerDisplay
                            :show-flag="false"
                            :show-role="false"
                            :show-elo="false"
                            :linkable="false"
                            :player="{
                              name: `Slot ${(matchStats.lineup_1?.lineup_players?.length || match.lineup_1?.lineup_players?.length || 0) + i}`,
                            }"
                          />
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Team 2 -->
        <div class="space-y-3">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div
                class="w-14 h-14 bg-gradient-to-br from-destructive via-destructive/90 to-destructive/70 rounded-xl flex items-center justify-center text-destructive-foreground font-bold text-lg shadow-lg border-2 border-destructive/20"
              >
                {{ getTeamInitials(match.lineup_2.name) }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">
                {{ match.lineup_2.name }}
              </h3>
              <div class="flex items-center space-x-2 mt-1">
                <UsersIcon class="h-4 w-4 text-muted-foreground" />
                <span class="text-sm text-muted-foreground">
                  {{ match.lineup_counts.lineup_2_count }}/{{
                    match.max_players_per_lineup
                  }}
                  players
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-foreground">
                {{ getTeamScore(match, match.lineup_2.id) }}
              </div>
            </div>
          </div>

          <!-- Players for Team 2 -->
          <div v-if="showPlayers" class="space-y-2">
            <div
              v-if="matchStats.lineup_2"
              class="bg-muted/50 rounded-lg p-4 border border-border min-h-[200px] flex flex-col"
            >
              <h5 class="text-sm font-semibold text-foreground mb-3">
                {{ matchStats.lineup_2.name }} Stats
              </h5>
              <div class="overflow-x-auto flex-1">
                <table class="w-full text-xs min-w-[400px] h-full">
                  <thead>
                    <tr class="border-b border-border">
                      <th class="text-left py-2 px-3 font-medium">Player</th>
                      <th class="text-center py-2 px-3 font-medium w-12">K</th>
                      <th class="text-center py-2 px-3 font-medium w-12">D</th>
                      <th class="text-center py-2 px-3 font-medium w-12">A</th>
                      <th class="text-center py-2 px-3 font-medium w-16">
                        DMG
                      </th>
                      <th class="text-center py-2 px-3 font-medium w-12">
                        K/D
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <template
                      v-for="lineupPlayer in matchStats.lineup_2.lineup_players"
                      :key="lineupPlayer.steam_id"
                    >
                      <tr class="border-b border-border/50 last:border-b-0">
                        <td class="py-3 px-3">
                          <PlayerDisplay
                            :player="lineupPlayer.player"
                          ></PlayerDisplay>
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            lineupPlayer.player.kills_aggregate?.aggregate
                              ?.count || 0
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            lineupPlayer.player.deaths_aggregate?.aggregate
                              ?.count || 0
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            lineupPlayer.player.assists_aggregate?.aggregate
                              ?.count || 0
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            Math.round(
                              lineupPlayer.player.damage_dealt_aggregate
                                ?.aggregate?.sum?.damage || 0,
                            )
                          }}
                        </td>
                        <td class="text-center py-3 px-3">
                          {{
                            getKDRatio(
                              lineupPlayer.player.kills_aggregate?.aggregate
                                ?.count || 0,
                              lineupPlayer.player.deaths_aggregate?.aggregate
                                ?.count || 0,
                            )
                          }}
                        </td>
                      </tr>
                    </template>
                    <!-- Empty rows to maintain consistent height -->
                    <template
                      v-for="i in Math.max(
                        0,
                        5 -
                          (matchStats.lineup_2?.lineup_players?.length ||
                            match.lineup_2?.lineup_players?.length ||
                            0),
                      )"
                      :key="`empty-${i}`"
                    >
                      <tr class="border-b border-border/50 last:border-b-0">
                        <td class="py-3 px-3">
                          <PlayerDisplay
                            :show-flag="false"
                            :show-role="false"
                            :show-elo="false"
                            :linkable="false"
                            :player="{
                              name: `Slot ${(matchStats.lineup_2?.lineup_players?.length || match.lineup_2?.lineup_players?.length || 0) + i}`,
                            }"
                          />
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                        <td class="text-center py-3 px-3 text-muted-foreground">
                          -
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Maps Section -->
      <div
        class="border-t border-border pt-4"
        v-if="match.match_maps.length > 0"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <h4 class="text-sm font-medium text-foreground">Maps:</h4>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(match_map, index) of match.match_maps"
                :key="index"
                class="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2 border border-border"
              >
                <img
                  :src="match_map.map.patch"
                  :alt="match_map.map.name"
                  class="w-6 h-6"
                  @error="
                    ($event.target as HTMLImageElement).style.display = 'none'
                  "
                />
                <span class="text-sm font-medium">{{
                  cleanMapName(match_map.map.name)
                }}</span>
                <div class="flex items-center space-x-1 text-xs">
                  <span class="font-semibold text-primary">{{
                    match_map.lineup_1_score
                  }}</span>
                  <span class="text-muted-foreground">-</span>
                  <span class="font-semibold text-destructive">{{
                    match_map.lineup_2_score
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { generateQuery } from "~/graphql/graphqlGen";
import { matchLineupStats } from "~/graphql/matchLineupStats";

export default {
  props: {
    match: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showPlayers: false,
      matchStats: {},
    };
  },
  methods: {
    async getMatchStats() {
      const {
        data: { matches_by_pk },
      } = await this.$apollo.query({
        variables: {
          matchId: this.match.id,
        },
        query: generateQuery({
          matches_by_pk: [
            {
              id: this.match.id,
            },
            {
              lineup_1: [{}, matchLineupStats],
              lineup_2: [{}, matchLineupStats],
            },
          ],
        }),
      });

      this.matchStats = matches_by_pk;
    },
    async toggleShowPlayers() {
      this.showPlayers = !this.showPlayers;
      await this.getMatchStats();
    },
    navigateToMatch(matchId: string, event: Event) {
      // Check if the click was on the toggle button
      const target = event.target as HTMLElement;
      const isToggleButton = target.closest("button");

      if (isToggleButton) {
        return; // Don't navigate if clicking on toggle button
      }

      // Navigate to match details
      this.$router.push({ name: "matches-id", params: { id: matchId } });
    },
    getTeamInitials(teamName: string): string {
      return teamName
        .split(" ")
        .map((word: string) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    },
    getTeamScore(match: any, lineupId: string): string | number {
      if (match.status !== "Finished") {
        return "-";
      }

      const totalScore = match.match_maps.reduce((total: number, map: any) => {
        if (map.winning_lineup_id === lineupId) {
          return total + 1;
        }
        return total;
      }, 0);

      return totalScore;
    },
    getMatchDuration(match: any): string {
      if (!match.ended_at || !match.created_at) {
        return "N/A";
      }

      const start = new Date(match.created_at);
      const end = new Date(match.ended_at);
      const durationMs = end.getTime() - start.getTime();

      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);

      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    },
    getKDRatio(kills: number, deaths: number): string {
      if (deaths === 0) {
        return kills > 0 ? kills.toFixed(1) : "0.0";
      }
      return (kills / deaths).toFixed(2);
    },
  },
};
</script>
