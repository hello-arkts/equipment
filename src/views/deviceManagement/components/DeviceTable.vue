<template>
  <el-table :data="rows" border style="width: 100%; height: 100%" class="w-full h-full">
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="name" label="设备名称" />
    <el-table-column prop="code" label="设备编码" />
    <el-table-column prop="manufacturer" label="生产厂家" />

    <el-table-column label="操作" width="200" align="center" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="$emit('plugin-detail', row)">插件详情</el-button>
        <el-button type="primary" link @click="$emit('edit', row)">编辑</el-button>
        <el-button type="danger" link @click="$emit('delete', row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  rows: {
    type: Array,
    default: () => []
  }
})
defineEmits(['edit', 'delete', 'plugin-detail'])
</script>
