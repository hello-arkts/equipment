<script setup lang="ts">
import { ref, watch } from 'vue'
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

const onSave = () => {
  emit('save', form.value.expireTime)
}

const copyLicenseKey = async () => {
  if (!form.value.licenseContent) return
  try {
    await navigator.clipboard.writeText(form.value.licenseContent)
    ElMessage.success('授权码已复制')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}
</script>

<template>
  <div class="auth-info-container">
    <el-descriptions title="机构授权详情" :column="1" border>
      <el-descriptions-item label="机构名称">{{ form.orgName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="激活码">
        <el-tooltip content="双击复制" placement="top">
          <span 
            class="license-key" 
            @dblclick="copyLicenseKey"
          >
            {{ form.licenseContent || '-' }}
          </span>
        </el-tooltip>
      </el-descriptions-item>
      <el-descriptions-item label="当前有效期">
        <el-tag v-if="form.expireTime" type="success">{{ form.expireTime }}</el-tag>
        <span v-else class="text-gray-400">暂未设置</span>
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
  cursor: pointer;
  font-family: monospace;
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #606266;
  user-select: none;
  
  &:hover {
    background: #e9e9eb;
    color: #409eff;
  }
}
</style>