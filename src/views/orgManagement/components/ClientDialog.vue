<template>
  <el-dialog
    v-model="visible"
    title="客户端信息"
    width="500px"
    draggable
    @close="onClose"
    append-to-body
  >
    <div v-loading="loading" class="client-info-container">
      <el-empty v-if="!clientInfo && !loading" description="暂无客户端信息" />
      
      <div v-else-if="clientInfo" class="info-content">
        <div class="info-item">
          <span class="label">客户端名称：</span>
          <span class="value">{{ clientInfo.fileName || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ clientInfo.createTime || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">更新时间：</span>
          <span class="value">{{ clientInfo.updateTime || '-' }}</span>
        </div>
      </div>

      <div class="actions">
        <el-button 
            type="primary" 
            :icon="Download" 
            v-if="clientInfo"
            @click="handleDownload"
        >
            下载客户端
        </el-button>
        <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleUpload"
            accept=".zip,.exe"
        >
            <el-button type="success" :icon="Upload">上传/更新客户端</el-button>
        </el-upload>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'
import clientServers from '../../../api/servers/clientServers'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const loading = ref(false)
const clientInfo = ref(null)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    fetchClientInfo()
  }
})

const onClose = () => {
  emit('update:modelValue', false)
}

const fetchClientInfo = async () => {
  loading.value = true
  try {
    const res = await clientServers.clientInfo()
    if (res.code === 200) {
      clientInfo.value = res.data
    } else {
      clientInfo.value = null
    }
  } catch (error) {
    console.error(error)
    clientInfo.value = null
  } finally {
    loading.value = false
  }
}

const handleDownload = async () => {
  try {
    const res = await clientServers.clientDownload()
    if (!res) return

    const blob = res.data
    let fileName = 'client.zip'

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('开始下载')
  } catch (error) {
    console.error(error)
    ElMessage.error('下载失败')
  }
}

const handleUpload = async (file) => {
  ElMessageBox.confirm('确定要上传该客户端文件吗？', '更新客户端', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
     const formData = new FormData()
     formData.append('file', file.raw)
     
     try {
        const res = await clientServers.clientUpload(formData)
        if (res.code === 200) {
            ElMessage.success('上传成功')
            fetchClientInfo()
        } else {
            ElMessage.error(res.message || '上传失败')
        }
     } catch (e) {
         console.error(e)
         ElMessage.error('上传请求失败')
     }
  }).catch(() => {
      // 取消上传
  })
}
</script>

<style scoped>
.client-info-container {
  padding: 10px;
}

.info-content {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.5;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  width: 100px;
  color: #606266;
  font-weight: 500;
  text-align: right;
}

.value {
  flex: 1;
  color: #303133;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}
</style>
