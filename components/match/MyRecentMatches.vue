<script lang="ts" setup>
import SimpleMatchDisplay from "~/components/SimpleMatchDisplay.vue";
</script>
<template>
  <div class="flex gap-4 overflow-x-auto" v-if="matches?.length > 0">
    <SimpleMatchDisplay
      :match="match"
      v-for="match of matches"
      :key="match.id"
      class="flex-shrink-0"
    ></SimpleMatchDisplay>
  </div>
  <Separator class="my-4" v-if="matches?.length > 0" />
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { simpleMatchFields } from "~/graphql/simpleMatchFields";
import { $, e_match_status_enum, order_by } from "~/generated/zeus";

export default {
  data() {
    return {
      matches: [],
    };
  },
  apollo: {
    $subscribe: {
      matches: {
        query: typedGql("subscription")({
          matches: [
            {
              limit: $("limit", "Int!"),
              where: {
                is_in_lineup: {
                  _eq: true,
                },
                status: {
                  _nin: $("statuses", "[e_match_status_enum]"),
                },
              },
              order_by: [
                {},
                {
                  created_at: $("order_by", "order_by"),
                },
              ],
            },
            simpleMatchFields,
          ],
        }),
        variables: function () {
          return {
            limit: 10,
            order_by: order_by.desc_nulls_last,
            statuses: [
              e_match_status_enum.Live,
              e_match_status_enum.Veto,
              e_match_status_enum.Canceled,
              e_match_status_enum.Scheduled,
              e_match_status_enum.PickingPlayers,
              e_match_status_enum.WaitingForCheckIn,
            ],
          };
        },
        result: function ({ data }) {
          this.matches = data.matches;
        },
      },
    },
  },
};
</script>
