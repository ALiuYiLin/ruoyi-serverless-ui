<script setup lang="ts">
import Flex from "@/components/Flex/Flex.vue";
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <Flex justify="space-between" >
    <Flex direction="column" :gap="5">
      <h1 class="page-title">耳机音频</h1>
      <p class="page-subtitle">
        <!-- 数码 3C / 耳机音频 · 共 96 件商品 · 最近更新于 2 小时前 -->
      </p>
    </Flex>
    <Flex direction="column-reverse">
      <Flex :gap="10">
        <Button variant="outline" radius="md">新增</Button>
        <!-- <Button variant="outline" radius="md">导入</Button> -->
        <!-- <Button variant="outline" radius="md">导出</Button> -->
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
