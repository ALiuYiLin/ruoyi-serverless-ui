<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <JobForm :scene="jobStore.formScene"></JobForm>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemJobStore from '@/store/system/job'
import FilterBar from './FilterBar.vue'
import JobForm from './JobForm.vue'
import PageHead from './PageHead.vue'
import Table from './Table.vue'

const jobStore = useSystemJobStore()

onMounted(() => jobStore.getList())
</script>
