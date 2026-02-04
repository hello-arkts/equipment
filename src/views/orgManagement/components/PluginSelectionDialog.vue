<template>
  <el-dialog
    v-model="visible"
    title="切换插件"
    width="800px"
    draggable
    @close="onClose"
    class="plugin-selection-dialog"
  >
    <div class="plugin-content">
      <el-alert
        title="请选择要切换的插件"
        type="info"
        show-icon
        :closable="false"
        class="mb-4"
      />
      <el-table :data="plugins" border stripe style="width: 100%; height: 100%; flex: 1" class="flex-1" v-loading="loading">
        <el-table-column prop="jarName" label="插件名称" min-width="150" />
        <el-table-column prop="version" label="版本号" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.id === defaultPluginId" type="success" size="small">默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="onSelect(row)"
              :disabled="row.id === currentPluginId"
            >
              {{ row.id === currentPluginId ? '当前使用' : '切换' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import pluginsServer from '../../../api/servers/pluginsServer.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  device: {
    type: Object,
    default: () => ({})
  },
  currentPluginId: {
    type: [String, Number],
    default: ''
  },
  defaultPluginId: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const plugins = ref([])
const loading = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadPlugins()
  }
})

const onClose = () => {
  emit('update:modelValue', false)
}

const loadPlugins = async () => {
  if (!props.device || !props.device.id) return
  
  loading.value = true
  try {
    const res = await pluginsServer.pluginsPage({
      deviceId: props.device.id,
      pageNum: 1,
      pageSize: 9999
    })
    if (res.code === 200) {
      plugins.value = res.data?.records || []
    } else {
      plugins.value = []
    }
  } catch (e) {
    console.error(e)
    plugins.value = []
    ElMessage.error('加载插件列表失败')
  } finally {
    loading.value = false
  }
}

const onSelect = (plugin) => {
  ElMessageBox.confirm(
    `确定将仪器「${props.device.deviceName}」切换到插件「${plugin.name || plugin.jarName}」吗？`, 
    '切换确认', 
    {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  ).then(() => {
    emit('confirm', plugin)
  }).catch(() => {})
}
</script>

<style scoped>
:deep(.plugin-selection-dialog) {
  height: 70vh;
  display: flex;
  flex-direction: column;
}
:deep(.plugin-selection-dialog .el-dialog__body) {
  flex: 1;
  overflow: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.plugin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 50vh;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
