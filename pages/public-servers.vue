<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeading from "~/components/PageHeading.vue";
import QuickServerConnect from "~/components/match/QuickServerConnect.vue";
import { generateQuery } from "~/graphql/graphqlGen";
import { $ } from "~/generated/zeus";
import { e_server_types_enum } from "~/generated/zeus";
</script>

<template>
  <div class="flex-grow flex flex-col gap-4">
    <PageHeading>
      <template #title> {{ $t("pages.public_servers.title") }} </template>
      <template #description>
        {{ $t("pages.public_servers.description") }}
      </template>
    </PageHeading>

    <Card class="p-4" v-if="servers && (servers as any[]).length > 0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{ $t("pages.public_servers.table.label") }}</TableHead>
            <TableHead>{{
              $t("pages.public_servers.table.players")
            }}</TableHead>
            <TableHead>{{ $t("pages.public_servers.table.region") }}</TableHead>
            <TableHead>{{ $t("pages.public_servers.table.type") }}</TableHead>
            <TableHead>{{
              $t("pages.public_servers.table.connect")
            }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="server of servers"
            :key="server.id"
            class="cursor-pointer hover:bg-muted/50"
          >
            <TableCell>
              <div class="flex gap-2 items-center">
                <span class="truncate font-mono text-sm">
                  {{ server.label }}
                </span>
              </div>
            </TableCell>
            <TableCell>
              {{ getDedicatedServerPlayers(server.id) }} /
              {{ server.max_players }}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{{ server.region }}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                :variant="server.type === 'Ranked' ? 'default' : 'secondary'"
              >
                {{ server.type }}
              </Badge>
            </TableCell>
            <TableCell>
              <QuickServerConnect :server="server" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <Card class="p-8 text-center" v-else-if="servers && servers.length === 0">
      <div class="flex flex-col items-center gap-4">
        <div class="text-muted-foreground">
          {{ $t("pages.public_servers.no_servers") }}
        </div>
      </div>
    </Card>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      servers: undefined as any[] | undefined,
    };
  },
  apollo: {
    getDedicatedServerPlayerCounts: {
      query: generateQuery({
        getDedicatedServerPlayerCounts: [
          {},
          {
            id: true,
            players: true,
          },
        ],
      }),
      pollInterval: 60 * 1000,
    },
    $subscribe: {
      servers: {
        query: generateQuery({
          servers: [
            {
              where: {
                _and: [
                  {
                    _or: [
                      {
                        type: {
                          _neq: $("rankedType", "e_server_types_enum!"),
                        },
                      },
                      {
                        connection_string: {
                          _is_null: false,
                        },
                      },
                    ],
                  },
                  {
                    enabled: {
                      _eq: true,
                    },
                  },
                  {
                    connected: {
                      _eq: true,
                    },
                  },
                ],
              },
              order_by: [
                {
                  label: "asc" as any,
                },
              ],
            },
            {
              id: true,
              label: true,
              type: true,
              region: true,
              connection_link: true,
              connection_string: true,
              max_players: true,
            },
          ],
        }),
        variables: function () {
          return {
            rankedType: e_server_types_enum.Ranked,
          };
        },
        result: function ({ data }: { data: any }) {
          this.servers = data.servers;
        },
      },
    },
  },
  methods: {
    getDedicatedServerPlayers(id: string) {
      return (
        this.getDedicatedServerPlayerCounts?.find(
          (player: any) => player.id === id,
        )?.players || 0
      );
    },
  },
};
</script>
