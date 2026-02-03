<template>
  <div class="common-page">
    <h1>{{ routeName }}</h1>
    <div class="content-box">
      <el-empty description="页面开发中..." />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const routeName = computed(() => route.meta.title || 'Unknown Page')
</script>

<style scoped>
.common-page {
  padding: 20px;
}
.content-box {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  min-height: 400px;
}
</style>
