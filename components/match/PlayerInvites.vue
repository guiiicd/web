<script lang="ts" setup>
import PlayerDisplay from "~/components/PlayerDisplay.vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-vue-next";
</script>

<template>
  <Card v-if="match_invites.length > 0">
    <CardHeader>
      <CardTitle>{{ $t("match.invites.title") }}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{{ $t("match.invites.invited_player") }}</TableHead>
            <TableHead>{{ $t("match.invites.invited_by") }}</TableHead>
            <TableHead class="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invite in match_invites" :key="invite.id">
            <TableCell class="font-medium">
              <PlayerDisplay :player="invite.player" />
            </TableCell>
            <TableCell>
              <PlayerDisplay :player="invite.invited_by" />
            </TableCell>
            <TableCell>
              <AlertDialog v-if="canDeleteInvite(invite)">
                <AlertDialogTrigger as-child>
                  <Button variant="ghost" size="sm" class="h-8 w-8 p-0">
                    <Trash2 class="h-4 w-4" />
                    <span class="sr-only">{{ $t("common.delete") }}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{{
                      $t("match.invites.delete_confirm.title")
                    }}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {{
                        $t("match.invites.delete_confirm.description", {
                          player: invite.player.name,
                          steam_id: invite.player.steam_id,
                        })
                      }}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{{
                      $t("common.cancel")
                    }}</AlertDialogCancel>
                    <AlertDialogAction @click="deleteInvite(invite.id)">
                      {{ $t("common.delete") }}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { $ } from "~/generated/zeus";
import { playerFields } from "~/graphql/playerFields";
import { generateMutation } from "~/graphql/graphqlGen";
import { toast } from "@/components/ui/toast";

export default {
  data() {
    return {
      match_invites: [] as any[],
    };
  },
  apollo: {
    $subscribe: {
      match_invites: {
        query: typedGql("subscription")({
          match_invites: [
            {
              where: {
                match_id: {
                  _eq: $("matchId", "uuid!"),
                },
              },
            },
            {
              id: true,
              player: {
                ...playerFields,
              },
              invited_by: {
                ...playerFields,
              },
            },
          ],
        }),
        variables: function (): { matchId: string } {
          return {
            matchId: (this as any).$route.params.id,
          };
        },
        result: function ({ data }: { data: any }) {
          (this as any).match_invites = data.match_invites;
        },
      },
    },
  },
  methods: {
    canDeleteInvite(invite: any): boolean {
      return this.me && this.me.steam_id === invite.invited_by.steam_id;
    },
    async deleteInvite(inviteId: string) {
      try {
        await (this as any).$apollo.mutate({
          mutation: generateMutation({
            delete_match_invites_by_pk: [
              {
                id: inviteId,
              },
              {
                __typename: true,
              },
            ],
          }),
        });

        toast({
          title: this.$t("match.invites.deleted_success"),
        });
      } catch (error) {
        toast({
          title: this.$t("match.invites.delete_error"),
          variant: "destructive",
        });
      }
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
  },
};
</script>
