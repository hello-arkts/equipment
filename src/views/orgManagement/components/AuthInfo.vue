<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  info: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save'])

const form = ref({
  orgName: '',
  expireTime: '',
  licenseKey: '',
  licenseContent:''
})

watch(() => props.info, (val) => {
  if (val) {
    form.value.orgName = val.orgName || ''
    form.value.expireTime = val.expireTime || ''
    form.value.licenseKey = val.licenseKey || ''
    form.value.licenseContent = val.licenseContent || ''
  }
}, { immediate: true, deep: true })

const expireTagType = computed(() => {
  if (!form.value.expireTime) return 'info'
  
  const expireDate = new Date(form.value.expireTime)
  const now = new Date()
  const diffTime = expireDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'danger' // 已超时，红色
  if (diffDays < 30) return 'warning' // 少于10天，黄色
  return 'success' // 正常，绿色
})

</script>

<template>
  <div class="auth-info-container">
    <el-descriptions title="机构授权详情" :column="1" border label-width="200px">
      <el-descriptions-item label="机构名称">{{ form.orgName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="当前有效期">
        <el-tag v-if="form.expireTime" :type="expireTagType">{{ form.expireTime ? form.expireTime.split(' ')[0] : '' }}</el-tag>
        <span v-else class="text-gray-400">暂未设置</span>
      </el-descriptions-item>
      <el-descriptions-item label="激活码">
        <span class="license-key">
            {{ form.licenseContent || '-' }}
        </span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style scoped lang="scss">
.auth-info-container {
  padding: 16px;
  background: #fff;
  height: 100%;
  overflow-y: auto;
}
.license-key {
  font-family: monospace;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #606266;
  display: inline-block;
  word-break: break-all;
  white-space: pre-wrap;
  max-width: 100%;
  
  &:hover {
    background: #e9e9eb;
    color: #409eff;
  }
}
</style>