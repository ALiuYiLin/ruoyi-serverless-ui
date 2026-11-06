<template>
  <Flex direction="column" :gap="14" class="h-full">
    <PageHead></PageHead>
    <FilterBar @search="handleSearch" @reset="handleReset"></FilterBar>
    <Table
      class="flex-1"
      :rows="userList"
      :total="total"
      :loading="loading"
      :page="queryParams.pageNum ?? 1"
      :page-size="queryParams.pageSize ?? 10"
      @update:page="handlePageChange"
      @update:pageSize="handleSizeChange"
    ></Table>
  </Flex>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';

import Flex from '@/components/Flex/Flex.vue';
import { listUser } from '@/api/system/user';
import type { SysUser, UserQueryParams } from '@/types';
import FilterBar from './FilterBar.vue';
import PageHead from './PageHead.vue';
import Table from './Table.vue';
import type { UserFilter } from './types';

const queryParams = reactive<UserQueryParams>({
  pageNum: 1,
  pageSize: 10,
});

const userList = ref<SysUser[]>([]);
const total = ref(0);
const loading = ref(false);
/** 请求序号，避免快速切换时旧请求覆盖新数据 */
let requestSeq = 0;

async function getList() {
  const seq = ++requestSeq;
  loading.value = true;
  try {
    const res = await listUser(queryParams);
    if (seq !== requestSeq) {
      return;
    }
    userList.value = res.rows;
    total.value = res.total;

    // 每页条数变化后，当前页可能超出最大页数，回退到最后一页
    const maxPage = Math.max(1, Math.ceil(res.total / (queryParams.pageSize || 10)));
    if (queryParams.pageNum && queryParams.pageNum > maxPage) {
      queryParams.pageNum = maxPage;
      await getList();
    }
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
    }
  }
}

function applyFilter(filter: UserFilter) {
  queryParams.userName = filter.userName || undefined;
  queryParams.phonenumber = filter.phonenumber || undefined;
  queryParams.status = filter.status || undefined;
  queryParams.params = {
    beginTime: filter.beginTime || undefined,
    endTime: filter.endTime || undefined,
  };
  queryParams.pageNum = 1;
}

function handleSearch(filter: UserFilter) {
  applyFilter(filter);
  getList();
}

function handleReset() {
  applyFilter({});
  getList();
}

function handlePageChange(page: number) {
  if (page === queryParams.pageNum) {
    return;
  }
  queryParams.pageNum = page;
  getList();
}

function handleSizeChange(size: number) {
  if (size === queryParams.pageSize) {
    return;
  }
  const previousSize = queryParams.pageSize ?? 10;
  queryParams.pageSize = size;
  // 数据已全部加载过（每页条数都不小于总数）时，改变条数无需重新请求
  if (queryParams.pageNum === 1 && total.value <= Math.min(previousSize, size)) {
    return;
  }
  queryParams.pageNum = 1;
  getList();
}

onMounted(getList);
</script>
