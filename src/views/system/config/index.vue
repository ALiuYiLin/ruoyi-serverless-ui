<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <ConfigForm :scene="configStore.formScene"></ConfigForm>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemConfigStore from '@/store/system/config'
import ConfigForm from './ConfigForm.vue'
import FilterBar from './FilterBar.vue'
import PageHead from './PageHead.vue'
import Table from './Table.vue'

const configStore = useSystemConfigStore()

onMounted(() => configStore.getList())
</script>
