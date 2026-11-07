<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <NoticeForm :scene="noticeStore.formScene"></NoticeForm>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemNoticeStore from '@/store/system/notice'
import FilterBar from './FilterBar.vue'
import NoticeForm from './NoticeForm.vue'
import PageHead from './PageHead.vue'
import Table from './Table.vue'

const noticeStore = useSystemNoticeStore()

onMounted(() => noticeStore.getList())
</script>
