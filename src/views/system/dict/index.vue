<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <DictTypeForm :scene="dictStore.formScene"></DictTypeForm>
    <DictDataDrawer></DictDataDrawer>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemDictTypeStore from '@/store/system/dict'
import DictDataDrawer from './DictDataDrawer.vue'
import DictTypeForm from './DictTypeForm.vue'
import FilterBar from './FilterBar.vue'
import PageHead from './PageHead.vue'
import Table from './Table.vue'

const dictStore = useSystemDictTypeStore()

onMounted(() => dictStore.getList())
</script>
