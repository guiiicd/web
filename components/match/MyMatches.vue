<script lang="ts" setup>
import Pagination from "~/components/Pagination.vue";
import MatchesTable from "~/components/MatchesTable.vue";
</script>
<template>
  <MatchesTable
    class="p-3"
    :matches="myMatches"
    v-if="myMatches"
  ></MatchesTable>

  <Teleport defer to="#pagination">
    <Pagination
      :page="page"
      :per-page="perPage"
      @page="
        (_page) => {
          page = _page;
        }
      "
      :total="myMatchesAggregate?.aggregate?.count"
      v-if="myMatchesAggregate"
    ></Pagination>
  </Teleport>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { simpleMatchFields } from "~/graphql/simpleMatchFields";
import { $, order_by } from "~/generated/zeus/index";

export default {
  data() {
    return {
      page: 1,
      perPage: 10,
      myMatches: [],
      myMatchesAggregate: undefined,
    };
  },
  apollo: {
    $subscribe: {
      matches: {
        query: typedGql("subscription")({
          matches: [
            {
              limit: $("limit", "Int!"),
              offset: $("offset", "Int!"),
              where: {
                is_in_lineup: {
                  _eq: true,
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
            limit: this.perPage,
            offset: (this.page - 1) * this.perPage,
            statuses: this.statuses,
            order_by: order_by.desc,
          };
        },
        result: function ({ data }) {
          this.myMatches = data.matches;
        },
      },
      myMatchesAggregate: {
        query: typedGql("subscription")({
          matches_aggregate: [
            {
              where: {
                is_in_lineup: {
                  _eq: true,
                },
              },
            },
            {
              aggregate: {
                count: true,
              },
            },
          ],
        }),
        variables: function () {
          return {
            statuses: this.statuses,
          };
        },
        result: function ({ data }) {
          this.myMatchesAggregate = data.matches_aggregate;
        },
      },
    },
  },
};
</script>
