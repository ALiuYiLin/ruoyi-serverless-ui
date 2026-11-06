<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <Form></Form>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';

import Flex from '@/components/Flex/Flex.vue';
import useSystemUserStore from '@/store/system/user';
import FilterBar from './FilterBar.vue';
import Form from './Form.vue';
import PageHead from './PageHead.vue';
import Table from './Table.vue';

const userStore = useSystemUserStore();

onMounted(() => userStore.getList());
</script>
