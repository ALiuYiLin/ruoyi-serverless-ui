<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemOnlineStore from '@/store/system/online'
import FilterBar from './FilterBar.vue'
import PageHead from './PageHead.vue'
import Table from './Table.vue'

const onlineStore = useSystemOnlineStore()

onMounted(() => onlineStore.getList())
</script>
