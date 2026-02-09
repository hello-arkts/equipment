<template>
  <el-table :data="rows" border style="width: 100%; height: 100%" class="w-full h-full">
    <el-table-column type="index" label="序号" width="60" align="center" />
    <el-table-column prop="name" label="设备名称" show-overflow-tooltip />
    <el-table-column prop="code" label="设备编码" show-overflow-tooltip />
    <el-table-column prop="model" label="设备型号" show-overflow-tooltip />
    <el-table-column prop="manufacturer" label="生产厂家" show-overflow-tooltip />
    <el-table-column prop="pluginCount" label="插件数量" show-overflow-tooltip />

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
