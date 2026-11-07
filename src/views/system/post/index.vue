<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar></FilterBar>
    <Table class="flex-1"></Table>
    <PostForm :scene="postStore.formScene"></PostForm>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import Flex from '@/components/Flex/Flex.vue'
import useSystemPostStore from '@/store/system/post'
import FilterBar from './FilterBar.vue'
import PageHead from './PageHead.vue'
import PostForm from './PostForm.vue'
import Table from './Table.vue'

const postStore = useSystemPostStore()

onMounted(() => postStore.getList())
</script>
