<script setup lang="ts">
defineProps({
  rows: {
    type: Array,
    default: () => []
  }
})
defineEmits(['switch-plugin', 'delete'])
</script>

<template>
  <el-table :data="rows" border style="width: 100%; height: 100%" class="w-full h-full">
    <el-table-column type="index" label="#" width="50" align="center" />
    <el-table-column prop="deviceName" label="仪器名称" min-width="150" />
    <el-table-column prop="deviceCode" label="仪器编码" min-width="150" />
    <el-table-column prop="createTime" label="授权时间" width="180" />
    <el-table-column prop="expireTime" label="到期时间" width="180" />
    <el-table-column label="操作" width="200" align="center" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link size="small" @click="$emit('switch-plugin', row)">切换插件</el-button>
        <el-button type="danger" link size="small" @click="$emit('delete', row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">

</style>