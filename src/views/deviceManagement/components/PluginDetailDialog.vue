<template>
  <el-dialog
    v-model="visible"
    title="插件详情"
    width="800px"
    draggable
    @close="onClose"
    class="plugin-dialog"
  >
    <div class="plugin-content">
      <div class="mb-4 flex justify-end">
        <el-button type="primary" @click="onAddPlugin">添加插件</el-button>
      </div>
      <el-table :data="plugins" border stripe style="width: 100%; height: 100%; flex: 1" class="flex-1">
        <el-table-column prop="jarName" label="插件名称" min-width="150" />
        <el-table-column prop="version" label="版本号" width="120" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="onEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="onDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 插件编辑弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editMode === 'add' ? '添加插件' : '编辑插件'"
      width="500px"
      draggable
      append-to-body
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="版本号">
          <el-input v-model="form.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="插件文件" required>
          <el-upload
            class="w-full"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="onUploadChange"
            :on-remove="onRemoveFile"
            :file-list="fileList"
            accept=".jar"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 .jar 文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSave">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import pluginsServer from '../../../api/servers/pluginsServer.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  device: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const plugins = ref([]) // 模拟插件数据
const editDialogVisible = ref(false)
const editMode = ref('add')
const fileList = ref([])
const form = reactive({
  id: '',
  name: '',
  version: '',
  description: '',
  file: null
})

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
  try {
    const res = await pluginsServer.pluginsPage({
      deviceId: props.device.id,
      pageNum: 1,
      pageSize: 9999
    })
    if (res.code === 200) {
      plugins.value = res.data?.records || []
    }
  } catch (e) {
    console.error(e)
    plugins.value = []
  }
}

const onAddPlugin = () => {
  editMode.value = 'add'
  form.id = ''
  form.name = ''
  form.version = ''
  form.description = ''
  form.file = null
  fileList.value = []
  editDialogVisible.value = true
}

const onEdit = (row) => {
  editMode.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.version = row.version
  form.description = row.description
  form.file = null
  fileList.value = []
  editDialogVisible.value = true
}

const onDelete = (row) => {
  ElMessageBox.confirm(`确定删除插件「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await pluginsServer.pluginsDelete(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadPlugins()
      }
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const onUploadChange = (file) => {
  const isJar = file.name.endsWith('.jar')
  if (!isJar) {
    ElMessage.error('只能上传 .jar 文件')
    fileList.value = []
    form.file = null
    return
  }
  form.file = file.raw
  fileList.value = [file]
}

const onRemoveFile = () => {
  form.file = null
  fileList.value = []
}

const onSave = async () => {
  // 校验文件
  if (editMode.value === 'add' && !form.file) {
    ElMessage.warning('请上传插件文件 (.jar)')
    return
  }

  try {
    const params = new FormData()
    params.append('version', form.version)
    params.append('description', form.description)
    params.append('deviceId', props.device.id)
    
    // 如果是编辑模式且没有新文件，只传基本信息
    if (editMode.value === 'edit') {
      params.append('id', form.id)
    }
    
    // 如果有文件，添加到参数中
    if (form.file) {
      params.append('file', form.file)
    }

    let res
    if (editMode.value === 'add') {
      res = await pluginsServer.pluginsAdd(params)
    } else {
      res = await pluginsServer.pluginsPut(params, form.id)
    }

    if (res.code === 200) {
      ElMessage.success(editMode.value === 'add' ? '添加成功' : '保存成功')
      editDialogVisible.value = false
      loadPlugins()
    }
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
:deep(.plugin-dialog) {
  height: 70vh;
  display: flex;
  flex-direction: column;
}
:deep(.plugin-dialog .el-dialog__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 20px;
}
.plugin-content {
  height: 50vh;
  display: flex;
  flex-direction: column;
}
</style>
