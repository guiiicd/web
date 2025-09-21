<script setup lang="ts">
import PageHeading from "~/components/PageHeading.vue";
import Separator from "~/components/ui/separator/Separator.vue";
import OtherMatches from "~/components/match/OtherMatches.vue";
import { e_match_status_enum } from "~/generated/zeus";
</script>

<template>
  <PageHeading>
    <template #title>{{ $t("pages.watch.title") }}</template>
    <template #description>{{ $t("pages.watch.description") }}</template>
  </PageHeading>

  <Separator class="my-4" />

  <Card class="p-4">
    <Tabs default-value="live-matches">
      <TabsList>
        <TabsTrigger value="live-matches">{{
          $t("pages.watch.live_matches")
        }}</TabsTrigger>
        <TabsTrigger value="upcoming-matches">{{
          $t("pages.watch.upcoming_matches")
        }}</TabsTrigger>
        <TabsTrigger value="finished-matches">{{
          $t("pages.watch.finished_matches")
        }}</TabsTrigger>
      </TabsList>

      <TabsContent value="live-matches">
        <OtherMatches
          :is-in-lineup="true"
          :statuses="[
            e_match_status_enum.Live,
            e_match_status_enum.WaitingForCheckIn,
            e_match_status_enum.WaitingForServer,
            e_match_status_enum.Veto,
          ]"
        ></OtherMatches>
      </TabsContent>
      <TabsContent value="upcoming-matches">
        <OtherMatches
          :is-in-lineup="true"
          :statuses="[e_match_status_enum.Scheduled]"
        ></OtherMatches>
      </TabsContent>
      <TabsContent value="finished-matches">
        <OtherMatches
          :is-in-lineup="true"
          :statuses="[e_match_status_enum.Finished]"
        ></OtherMatches>
      </TabsContent>
    </Tabs>
  </Card>

  <div id="pagination"></div>
</template>

<script lang="ts">
export default {
  computed: {
    canCreateMatch() {
      return useApplicationSettingsStore().canCreateMatch;
    },
  },
};
</script>
