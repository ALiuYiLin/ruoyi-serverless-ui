<template>
  <Flex direction="column" :gap="14">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table></Table>
  </Flex>
</template>
<script lang="ts" setup>
import Flex from '@/components/Flex/Flex.vue';
import FilterBar from './FilterBar.vue';
import PageHead from './PageHead.vue';
import Table from './Table.vue';

</script>
