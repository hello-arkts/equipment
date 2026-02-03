<template>
  <div class="split-layout">
    <el-splitter class="main-splitter">
      <el-splitter-panel size="20%">
        <div class="left-pane">
          <div class="pane-header">
            <el-input v-model="manufacturerSearch" placeholder="搜索厂家" clearable />
          </div>
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="defaultProps"
            highlight-current
            :expand-on-click-node="false"
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="onNodeClick"
            class="custom-tree"
          >
             <template #default="{ node, data }">
              <span class="custom-tree-node flex flex-1 justify-between items-center pr-2">
                <span>{{ node.label }}</span>
                <span class="node-actions" @click.stop>
                   <el-button v-if="!data.id" type="primary" link size="small" @click="startAddManufacturer">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <template v-else>
                    <el-button type="primary" link size="small" @click="startEditManufacturer(data)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="danger" link size="small" @click="deleteManufacturer(data)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </template>
                </span>
              </span>
            </template>
          </el-tree>
        </div>
      </el-splitter-panel>

      <el-splitter-panel>
        <div class="right-pane">
          <div class="pane-header">
            <el-input v-model="deviceSearch" placeholder="搜索仪器" clearable style="width: 250px"/>
            <el-button type="primary" @click="onAddDevice">添加仪器</el-button>
          </div>
          <div class="table-wrapper">
            <DeviceTable
              :rows="filteredTableData"
              @edit="onEditDevice"
              @delete="onDeleteDevice"
              @plugin-detail="onPluginDetail"
            />
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>
    <el-dialog
      v-model="manufacturerDialogVisible"
      :title="manufacturerDialogTitle"
      width="500px"
      @close="closeManufacturerDialog"
    >
      <el-form :model="manufacturerForm" label-width="80px">
        <el-form-item label="厂家名称">
          <el-input v-model="manufacturerForm.name" placeholder="请输入厂家名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeManufacturerDialog">取消</el-button>
          <el-button type="primary" @click="saveManufacturer">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="deviceDialogVisible"
      :title="deviceDialogTitle"
      width="500px"
      @close="closeDeviceDialog"
    >
      <el-form :model="deviceForm" label-width="80px">
        <el-form-item label="生产厂家">
           <el-input v-model="activeNode" disabled />
        </el-form-item>
        <el-form-item label="仪器名称">
          <el-input v-model="deviceForm.name" placeholder="请输入仪器名称" />
        </el-form-item>
        <el-form-item label="仪器编码">
          <el-input v-model="deviceForm.code" placeholder="请输入仪器编码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDeviceDialog">取消</el-button>
          <el-button type="primary" @click="saveDevice">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <PluginDetailDialog
      v-model="pluginDetailVisible"
      :device="activeDevice"
    />
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, watch} from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import deviceManagementServer from '../../api/servers/deviceManagementServer.js'
import DeviceTable from './components/DeviceTable.vue'
import PluginDetailDialog from './components/PluginDetailDialog.vue'

const manufacturerSearch = ref('')
const activeNode = ref('')
const manufacturerEditing = ref(false)
const activeManufacturerId = ref('')
const leftTableData = ref([])
const defaultProps = { children: 'children', label: 'label' }

// Manufacturer Dialog
const manufacturerDialogVisible = ref(false)
const manufacturerDialogMode = ref('add') // 'add' or 'edit'
const manufacturerDialogTitle = computed(() => manufacturerDialogMode.value === 'add' ? '添加厂家' : '编辑厂家')
const manufacturerForm = reactive({
  id: '',
  name: '',
})
const deviceDialogVisible = ref(false)
const deviceDialogMode = ref('add') // 'add' or 'edit'
const deviceDialogTitle = computed(() => deviceDialogMode.value === 'add' ? '添加仪器' : '编辑仪器')
const deviceForm = reactive({
  id: '',
  name: '',
  code: '',
  manufacturerId: ''
})

const pluginDetailVisible = ref(false)
const activeDevice = ref({})

const treeData = computed(() => [
  {
    label: '全部厂家',
    children: (leftTableData.value || []).map(m => ({
      label: m.name,
      id: m.id,
    }))
  }
])

const onNodeClick = async (node) => {
  if (!node || !node.id) return
  activeManufacturerId.value = node.id
  activeNode.value = node.label || ''
  Object.assign(manufacturerForm, {
    id: node.id,
    name: node.label || '',
  })
  await getDevicesPage(node.id, node.label, deviceSearch.value)
}

const deviceSearch = ref('')
const tableData = ref([])
const filteredTableData = computed(() => {
  let rows = tableData.value
  if (activeNode.value) {
    rows = rows.filter(r => r.manufacturer === activeNode.value)
  }
  return rows
})

const filterNode = (value, data) => {
  if (!value) return true
  return String(data.label || '').toLowerCase().includes(String(value).toLowerCase())
}

const getManufacturersPage = async (name = '', autoSelect = false) => {
  const res = await deviceManagementServer.manufacturersPage({
    pageNum: 1,
    pageSize: 9999,
    name
  })
  if(res.code == 200){
    leftTableData.value = res.data.records
    if (autoSelect) {
      const first = leftTableData.value[0]
      if (first) {
        activeManufacturerId.value = first.id
        activeNode.value = first.name || ''
        Object.assign(manufacturerForm, {
            id: first.id,
            name: first.name || '',
        })
        manufacturerEditing.value = false
        await getDevicesPage(first.id, first.name, deviceSearch.value)
      }
    }
  }
}

const getDevicesPage = async (manufacturerId = '', manufacturerName = '', name = '') => {
  const res = await deviceManagementServer.devicesPage({
    pageNum: 1,
    pageSize: 9999,
    manufacturerId,
    manufacturerName,
    name
  })
  if (res.code === 200) {
    const list = res.data?.records || []
    tableData.value = list.map(item => ({
      ...item,
      manufacturer: item.manufacturer || manufacturerName
    }))
  }
}

onMounted(() => {
  getManufacturersPage('', true)
})

let manufacturerSearchTimer = null
watch(manufacturerSearch, (val) => {
  if (manufacturerSearchTimer) clearTimeout(manufacturerSearchTimer)
  manufacturerSearchTimer = setTimeout(() => {
    getManufacturersPage(val, false)
  }, 300)
})

let deviceSearchTimer = null
watch(deviceSearch, (val) => {
  if (deviceSearchTimer) clearTimeout(deviceSearchTimer)
  deviceSearchTimer = setTimeout(() => {
    const id = activeManufacturerId.value || ''
    const name = activeNode.value || ''
    getDevicesPage(id, name, val)
  }, 300)
})

const onAddDevice = () => {
  if (!activeManufacturerId.value) {
    ElMessage.warning('请先选择一个厂家')
    return
  }
  deviceDialogMode.value = 'add'
  deviceForm.id = ''
  deviceForm.name = ''
  deviceForm.code = ''
  deviceForm.manufacturerId = activeManufacturerId.value
  deviceDialogVisible.value = true
}

const onEditDevice = (row) => {
  deviceDialogMode.value = 'edit'
  deviceForm.id = row.id
  deviceForm.name = row.name
  deviceForm.code = row.code || ''
  deviceForm.manufacturerId = activeManufacturerId.value
  deviceDialogVisible.value = true
}

const closeDeviceDialog = () => {
  deviceDialogVisible.value = false
}

const saveDevice = async () => {
  try {
    const params = {
      id: deviceForm.id,
      name: deviceForm.name,
      code: deviceForm.code,
      manufacturerId: deviceForm.manufacturerId
    }
    let res
    if (deviceDialogMode.value === 'add') {
      res = await deviceManagementServer.devicesAdd(params)
    } else {
      res = await deviceManagementServer.devicesPut(params)
    }
    if (res.code === 200) {
      ElMessage.success(deviceDialogMode.value === 'add' ? '添加成功' : '修改成功')
      deviceDialogVisible.value = false
      const id = activeManufacturerId.value || ''
      const name = activeNode.value || ''
      getDevicesPage(id, name, deviceSearch.value)
    }
  } catch (e) {
    console.error(e)
  }
}

const onDeleteDevice = (row) => {
  ElMessageBox.confirm(`确定删除仪器「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  }).then(async () => {
    const res = await deviceManagementServer.devicesDelete(row.id)
    if (res.code === 200) {
      ElMessage.success('已删除')
      const id = activeManufacturerId.value || ''
      const name = activeNode.value || ''
      getDevicesPage(id, name, deviceSearch.value)
    }
  }).catch(() => {})
}

const onPluginDetail = (row) => {
  activeDevice.value = row
  pluginDetailVisible.value = true
}

// Manufacturer Actions
const startAddManufacturer = () => {
  manufacturerDialogMode.value = 'add'
  Object.keys(manufacturerForm).forEach(k => manufacturerForm[k] = '')
  manufacturerDialogVisible.value = true
}

const startEditManufacturer = (data) => {
  const target = data || (activeManufacturerId.value ? {
       id: activeManufacturerId.value,
       name: activeNode.value,
   } : null)

   if (!target || !target.id) {
       ElMessage.warning('请先选择一个厂家')
       return
   }
   
   manufacturerDialogMode.value = 'edit'
   Object.assign(manufacturerForm, {
       id: target.id,
       name: target.name || target.label,
   })
  manufacturerDialogVisible.value = true
}


const deleteManufacturer = (data) => {
  const targetId = data?.id || activeManufacturerId.value
  const targetName = data?.name || data?.label || activeNode.value

  if (!targetId) {
      ElMessage.warning('请先选择一个厂家')
      return
  }
  ElMessageBox.confirm(`确定删除厂家「${targetName}」及其关联仪器吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  }).then(async () => {
    try {
        const res = await deviceManagementServer.manufacturersDelete(targetId)
        if (res.code === 200) {
            ElMessage.success('厂家已删除')
            if (activeManufacturerId.value === targetId) {
                activeManufacturerId.value = ''
                activeNode.value = ''
            }
            getManufacturersPage('', true)
        }
    } catch (e) {
        console.error(e)
    }
  }).catch(() => {})
}

const closeManufacturerDialog = () => {
  manufacturerDialogVisible.value = false
}

const saveManufacturer = async () => {
  try {
    let res
    if (manufacturerDialogMode.value === 'add') {
      res = await deviceManagementServer.manufacturersAdd(manufacturerForm)
    } else {
      res = await deviceManagementServer.manufacturersPut(manufacturerForm)
    }
    if (res.code === 200) {
      ElMessage.success(manufacturerDialogMode.value === 'add' ? '添加成功' : '保存成功')
      manufacturerDialogVisible.value = false
      getManufacturersPage(manufacturerSearch.value, false)
    }
  } catch (e) {
    console.error(e)
  }
}

</script>

<style scoped lang="scss">
.split-layout {
  flex: 1;
  min-height: 0;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}
:deep(.main-splitter) {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}
:deep(.el-splitter-panel) {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
:deep(.el-splitter-panel:first-child) {
  width: 20%;
  min-width: 200px;
}
:deep(.el-splitter-panel:last-child) {
  flex: 1;
  min-width: 0;
}
.left-pane {
  display: flex;
  flex: 1;
  flex-direction: column;
  background: #fff;
  height: 100%;
  padding: 8px;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
  min-height: 0;
}
.right-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  background: #fff;
  overflow: hidden; /* Ensure inner scroll works */
}
.pane-header {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0; /* Prevent header from shrinking */
}
.table-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.custom-tree {
  flex: 1;
  overflow: auto;
  min-height: 0;
  width: 100%;
}
</style>
