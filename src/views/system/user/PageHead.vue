<script setup lang="ts">
import { Plus } from "@lucide/vue";
import Flex from "@/components/Flex/Flex.vue";
import Button from "@/components/ui/button/Button.vue";
import useSystemUserStore from "@/store/system/user";

const userStore = useSystemUserStore();
</script>

<template>
  <Flex justify="space-between" >
    <Flex direction="column" :gap="5">
      <h1 class="page-title">用户管理</h1>
      <p class="page-subtitle">
        <!--  -->
      </p>
    </Flex>
    <Flex direction="column-reverse">
      <Flex :gap="10">
        <Button color="primary" radius="md" @click="userStore.openAddForm()" size="lg">
          <Plus />
          新增
        </Button>
      </Flex>
    </Flex>
  </Flex>
</template>

<style scoped>
.page-header {
  justify-content: space-between;
}
.page-title {
  box-sizing: border-box;
  color: #101828;
  font-size: 21px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: -0.2px;
  line-height: normal;
  text-align: left;
  white-space: nowrap;
}
.page-subtitle {
  box-sizing: border-box;
  color: #667085;
  font-size: 12.5px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: normal;
  text-align: left;
  white-space: nowrap;
}
</style>
