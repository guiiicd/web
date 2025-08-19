<script setup lang="ts">
import { LucideCloud, LucideDownload, LucideUpload } from "lucide-vue-next";

definePageMeta({
  layout: "application-settings",
});
</script>

<template>
  <div class="mb-8 p-4 bg-muted rounded-lg">
    <h3 class="text-lg font-semibold mb-2">
      {{ $t("pages.settings.application.demo_settings.current_storage") }}
    </h3>
    <div>
      <p class="text-sm text-muted-foreground">
        {{ $t("pages.settings.application.demo_settings.used_storage") }}
      </p>
      <p class="text-2xl font-bold">~{{ currentStorage }} GB</p>
    </div>
  </div>

  <div class="mb-8 p-4 bg-muted rounded-lg flex flex-col gap-2">
    <h3 class="text-lg font-semibold">
      {{ $t("pages.settings.application.demo_settings.test_s3_title") }}
    </h3>
    <div>
      <p class="text-sm text-muted-foreground">
        {{ $t("pages.settings.application.demo_settings.test_s3_description") }}
      </p>
    </div>
    <div class="flex gap-4">
      <Button
        class="rounded-full px-6 py-2 font-medium shadow transition hover:bg-primary/90 flex items-center gap-2"
        @click="testUpload"
      >
        <LucideUpload class="w-4 h-4" />
        {{ $t("pages.settings.application.demo_settings.test_upload") }}
      </Button>
      <Button
        class="rounded-full px-6 py-2 font-medium shadow transition hover:bg-primary/90 flex items-center gap-2"
        @click="testDownload"
      >
        <LucideDownload class="w-4 h-4" />
        {{ $t("pages.settings.application.demo_settings.test_download") }}
      </Button>
    </div>
  </div>

  <form @submit.prevent="updateSettings" class="grid gap-4">
    <FormField v-slot="{ componentField }" name="s3_min_retention">
      <FormItem>
        <FormLabel>{{
          $t("pages.settings.application.demo_settings.min_retention")
        }}</FormLabel>
        <FormDescription>{{
          $t(
            "pages.settings.application.demo_settings.min_retention_description",
          )
        }}</FormDescription>
        <Input type="number" v-bind="componentField"></Input>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="s3_max_storage">
      <FormItem>
        <FormLabel>{{
          $t("pages.settings.application.demo_settings.max_storage")
        }}</FormLabel>
        <FormDescription>{{
          $t("pages.settings.application.demo_settings.max_storage_description")
        }}</FormDescription>
        <Input type="number" v-bind="componentField"></Input>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="cloudflare_worker_url">
      <FormItem>
        <FormLabel>{{
          $t("pages.settings.application.demo_settings.cloudflare_worker_url")
        }}</FormLabel>
        <FormDescription>
          {{
            $t(
              "pages.settings.application.demo_settings.cloudflare_worker_url_description",
            )
          }}
          <a
            href="https://docs.5stack.gg/s3/backblaze"
            target="_blank"
            class="text-primary hover:underline"
          >
            https://docs.5stack.gg/s3/backblaze
          </a>
        </FormDescription>
        <Input v-bind="componentField"></Input>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button
        type="submit"
        :disabled="Object.keys(form.errors).length > 0"
        class="my-3"
      >
        {{ $t("pages.settings.application.demo_settings.update") }}
      </Button>
    </div>
  </form>
</template>

<script lang="ts">
import { settings_constraint, settings_update_column } from "~/generated/zeus";
import { generateMutation } from "~/graphql/graphqlGen";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import { generateQuery } from "~/graphql/graphqlGen";

export default {
  apollo: {
    match_map_demos_aggregate: {
      query: generateQuery({
        match_map_demos_aggregate: {
          aggregate: {
            sum: {
              size: true,
            },
          },
        },
      }),
    },
  },
  data() {
    return {
      form: useForm({
        validationSchema: toTypedSchema(
          z.object({
            s3_min_retention: z.number().int().min(1).optional().default(1),
            s3_max_storage: z.number().int().min(1).default(10),
            cloudflare_worker_url: z.string().url().optional(),
          }),
        ),
      }),
    };
  },
  watch: {
    settings: {
      immediate: true,
      handler(newVal) {
        for (const setting of newVal) {
          if (
            setting.name === "s3_min_retention" ||
            setting.name === "s3_max_storage"
          ) {
            this.form.setFieldValue(setting.name, parseInt(setting.value));
            continue;
          }

          this.form.setFieldValue(setting.name, setting.value);
        }
      },
    },
  },
  methods: {
    async testUpload() {
      const {
        data: {
          testUpload: { error },
        },
      } = await this.$apollo.mutate({
        mutation: generateMutation({
          testUpload: {
            error: true,
          },
        }),
      });

      if (!error) {
        toast({
          title: this.$t(
            "pages.settings.application.demo_settings.test_upload_success",
          ),
        });
        return;
      }

      toast({
        title: `${this.$t("pages.settings.application.demo_settings.test_upload_failed")} ${error}`,
        variant: "destructive",
      });
    },
    async testDownload() {
      const {
        data: {
          getTestUploadLink: { link, error },
        },
      } = await this.$apollo.mutate({
        mutation: generateMutation({
          getTestUploadLink: {
            link: true,
            error: true,
          },
        }),
      });

      if (error) {
        toast({
          title: `${this.$t("pages.settings.application.demo_settings.test_download_failed")} ${error}`,
          variant: "destructive",
        });
        return;
      }

      window.open(link, "_blank");
    },
    async updateSettings() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_settings: [
            {
              objects: [
                {
                  name: "s3_min_retention",
                  value: this.form.values.s3_min_retention?.toString(),
                },
                {
                  name: "s3_max_storage",
                  value: this.form.values.s3_max_storage?.toString(),
                },
                {
                  name: "cloudflare_worker_url",
                  value: this.form.values.cloudflare_worker_url,
                },
              ],
              on_conflict: {
                constraint: settings_constraint.settings_pkey,
                update_columns: [settings_update_column.value],
              },
            },
            {
              __typename: true,
            },
          ],
        }),
      });

      toast({
        title: "Updated S3 Settings",
      });
    },
  },
  computed: {
    settings() {
      return useApplicationSettingsStore().settings;
    },
    currentStorage() {
      const size = this.match_map_demos_aggregate?.aggregate.sum.size;
      if (!size) {
        return;
      }

      return (size / 1024 / 1024 / 1024).toFixed(2);
    },
  },
};
</script>
