<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <DeptForm :scene="deptStore.formScene"></DeptForm>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemDeptStore from '@/store/system/dept'
import DeptForm from './DeptForm.vue'
import FilterBar from './FilterBar.vue'
import PageHead from './PageHead.vue'
import Table from './Table.vue'

const deptStore = useSystemDeptStore()

onMounted(() => deptStore.getList())
</script>
