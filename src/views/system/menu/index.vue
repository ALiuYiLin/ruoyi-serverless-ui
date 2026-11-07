<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <MenuForm :scene="menuStore.formScene"></MenuForm>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemMenuStore from '@/store/system/menu'
import FilterBar from './FilterBar.vue'
import MenuForm from './MenuForm.vue'
import PageHead from './PageHead.vue'
import Table from './Table.vue'

const menuStore = useSystemMenuStore()

onMounted(() => menuStore.getList())
</script>
