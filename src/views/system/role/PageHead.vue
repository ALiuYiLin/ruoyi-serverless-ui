<script setup lang="ts">
import { Plus } from '@lucide/vue'

import Button from '@/components/ui/button/Button.vue'
import useSystemRoleStore from '@/store/system/role'

const roleStore = useSystemRoleStore()
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex flex-col gap-[5px]">
      <h1 class="text-[21px] leading-normal font-semibold tracking-[-0.2px] whitespace-nowrap text-foreground">
        角色管理
      </h1>
      <p class="text-[12.5px] leading-normal whitespace-nowrap text-muted-foreground">
        <!--  -->
      </p>
    </div>
    <div class="flex gap-[10px]">
      <Button color="primary" radius="md" size="lg" @click="roleStore.openAddForm()">
        <Plus />
        新增
      </Button>
    </div>
  </div>
</template>
