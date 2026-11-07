<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <RoleForm :scene="roleStore.formScene"></RoleForm>
    <DataScopeDialog></DataScopeDialog>
    <AuthUserDialog></AuthUserDialog>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemRoleStore from '@/store/system/role'
import AuthUserDialog from './AuthUserDialog.vue'
import DataScopeDialog from './DataScopeDialog.vue'
import FilterBar from './FilterBar.vue'
import PageHead from './PageHead.vue'
import RoleForm from './RoleForm.vue'
import Table from './Table.vue'

const roleStore = useSystemRoleStore()

onMounted(() => roleStore.getList())
</script>
