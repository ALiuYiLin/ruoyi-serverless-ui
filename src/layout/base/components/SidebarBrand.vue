<script setup lang="ts">
import Flex from "@/components/Flex/Flex.vue";
import type { Component } from "vue";
import { ref } from "vue";
import useUserStore from "@/store/modules/user";

const props = defineProps<{
  teams: {
    name: string;
    logo: Component;
    plan: string;
  }[];
}>();

const userStore = useUserStore();
const activeTeam = ref(props.teams[0]!);
</script>

<template>
  <Flex direction="row" :gap="10" class="border-b-2" :padding-y="10">
    <Flex class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
      <component :is="activeTeam.logo" class="size-4" />
    </Flex>
    <Flex class="grid flex-1 text-left text-sm leading-tight">
      <span class="truncate font-medium">若依</span>
      <span class="truncate text-xs">{{ userStore.deptName || '未分配部门' }}</span>
    </Flex>
  </Flex>
</template>
