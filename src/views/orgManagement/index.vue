<template>
  <div class="org-layout">
    <el-splitter class="main-splitter">
      <el-splitter-panel size="20%">
        <div class="left-pane">
          <div class="pane-header">
            <el-input v-model="orgSearch" placeholder="搜索机构" clearable />
          </div>
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="defaultProps"
            highlight-current
            node-key="id"
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
                   <el-button v-if="!data.id" type="primary" link size="small" @click="startAddOrg">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <template v-else>
                    <el-button type="primary" link size="small" @click="startEditOrg(data)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="danger" link size="small" @click="deleteOrg(data)">
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
            <div class="flex items-center gap-4">
               <el-button-group class="rounded-full">
                  <el-button 
                    :type="activeTab === 'devices' ? 'primary' : ''" 
                    :plain="activeTab !== 'devices'"
                    class="rounded-l-full"
                    @click="activeTab = 'devices'"
                  >仪器列表</el-button>
                  <el-button 
                    :type="activeTab === 'auth' ? 'primary' : ''" 
                    :plain="activeTab !== 'auth'"
                    class="rounded-r-full"
                    @click="activeTab = 'auth'"
                  >机构详情</el-button>
               </el-button-group>
               <span v-if="activeNode" class="text-gray-500 text-sm">({{ activeNode }})</span>
            </div>
            <div v-if="activeTab === 'devices'">
              <el-button type="primary" @click="openAssignDeviceDialog">仪器绑定</el-button>
            </div>
            <div v-else>
              <el-button type="primary" @click="openLicenseDialog">机构授权</el-button>
            </div>
          </div>
          <div class="content-wrapper">
            <AuthDeviceList
               v-if="activeTab === 'devices'" 
               :rows="authDeviceList" 
               @switch-plugin="onSwitchPlugin"
               @delete="onDeleteAuth"
            />
            <AuthInfo 
               v-else 
               :info="{ orgName: activeNode, expireTime: licenseForm.expireTime, licenseKey: licenseForm.licenseKey }" 
               @save="onSaveLicense"
            />
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>
    
    <!-- 机构弹窗 -->
    <el-dialog
      v-model="orgDialogVisible"
      :title="orgDialogTitle"
      width="500px"
      draggable
      @close="closeOrgDialog"
    >
      <el-form :model="orgForm" label-width="80px">
        <el-form-item label="机构名称">
          <el-input v-model="orgForm.name" placeholder="请输入机构名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeOrgDialog">取消</el-button>
          <el-button type="primary" @click="saveOrg">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 仪器授权弹窗 -->
    <el-dialog
      v-model="assignDeviceDialogVisible"
      title="仪器绑定"
      width="800px"
      draggable
      @close="closeAssignDeviceDialog"
    >
       <div style="height: 400px; display: flex; flex-direction: column;">
          <div style="margin-bottom: 10px; font-weight: bold;">
             当前机构：{{ activeNode }}
          </div>
          <DeviceAuthTransfer
             v-model="selectedDeviceIds"
             :all-devices="allDevices"
             :manufacturers="allManufacturers"
             style="flex: 1"
          />
       </div>
       <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAssignDeviceDialog">取消</el-button>
          <el-button type="primary" @click="saveDeviceAuth">保存绑定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 有效期设置弹窗 -->
    <el-dialog v-model="licenseDialogVisible" title="机构授权" width="400px" draggable>
        <el-form :model="licenseForm" label-width="80px">
            <el-form-item label="过期时间">
              <el-date-picker
                v-model="licenseForm.expireTime"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          <el-form-item label="授权码">
            <el-input v-model="licenseForm.licenseKey" disabled placeholder="系统自动生成" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="licenseDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveLicense">确定</el-button>
          </div>
        </template>
    </el-dialog>

    <!-- 插件选择弹窗 -->
    <PluginSelectionDialog
      v-model="pluginSelectionDialogVisible"
      :device="currentSwitchDevice"
      :current-plugin-id="currentSwitchDevice?.pluginId"
      :default-plugin-id="currentSwitchDevice?.defaultPluginId"
      @confirm="handlePluginSwitch"
    />
  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted, watch} from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import orgManagementServer from '../../api/servers/orgManagementServer.js'
import deviceManagementServer from '../../api/servers/deviceManagementServer.js'
import AuthDeviceList from './components/AuthDeviceList.vue'
import AuthInfo from './components/AuthInfo.vue'
import PluginSelectionDialog from './components/PluginSelectionDialog.vue'
import DeviceAuthTransfer from './components/DeviceAuthTransfer.vue'

const orgSearch = ref('')
const activeNode = ref('')
const activeOrgId = ref('')
const activeTab = ref('devices')
const leftTableData = ref([])
const treeRef = ref(null)
const defaultProps = { children: 'children', label: 'label' }

// Org Dialog
const orgDialogVisible = ref(false)
const orgDialogMode = ref('add') // 'add' or 'edit'
const orgDialogTitle = computed(() => orgDialogMode.value === 'add' ? '添加机构' : '编辑机构')
const orgForm = reactive({
  id: '',
  name: '',
})

// Auth Dialog
const licenseForm = reactive({
  expireTime: '',
  licenseKey: ''
})
const allDevices = ref([])
const allManufacturers = ref([])
const selectedDeviceIds = ref([])

const authDeviceList = ref([])

const assignDeviceDialogVisible = ref(false)
const pluginSelectionDialogVisible = ref(false)
const currentSwitchDevice = ref(null)
const licenseDialogVisible = ref(false)

const treeData = computed(() => [
  {
    label: '全部机构',
    children: (leftTableData.value || []).map(m => ({
      label: m.name,
      id: m.id,
    }))
  }
])

const onNodeClick = async (node) => {
  if (!node || !node.id) return
  activeOrgId.value = node.id
  activeNode.value = node.label || ''
  Object.assign(orgForm, {
    id: node.id,
    name: node.label || '',
  })
  
  // Fetch authorization info for the right panel list
   try {
     const res = await orgManagementServer.authorizationsPage({
         organizationId: node.id,
     })
     if (res.code === 200) {
       const data = res.data || {}
       // 处理仪器列表: 将返回的 devices 数组映射到 authDeviceList
       authDeviceList.value = (data.devices || []).map(d => ({
         id: d.id,
         pluginId: d.pluginId,
         defaultPluginId: d.plugin.id, // Store default plugin ID from API
         deviceName: d.name,
         deviceCode: d.code,
         createTime: d.createTime,
         ordName:d.manufacturer.name,
         deviceModel:d.model,
         jarName:d.plugin.jarName,
         pluginVersion:d.plugin.version,
         // 如果接口返回的数据中没有过期时间，可能需要从 authorization 对象或其他地方获取，这里暂且留空或根据业务逻辑调整
         expireTime: data.authorization ? data.authorization.expireTime : '' 
       }))

       console.log(authDeviceList.value,'xixi')
       
       // 处理授权信息
       const authInfo = data.authorization || {}
       licenseForm.expireTime = authInfo.expireTime || ''
       licenseForm.licenseKey = authInfo.licenseKey || ''
       
       // 更新已选设备ID列表，用于授权弹窗回显
       selectedDeviceIds.value = (data.devices || []).map(d => d.id)
    } else {
       authDeviceList.value = []
       licenseForm.expireTime = ''
       licenseForm.licenseKey = ''
       selectedDeviceIds.value = []
    }
  } catch (e) {
    console.error(e)
    authDeviceList.value = []
    licenseForm.expireTime = ''
    licenseForm.licenseKey = ''
    selectedDeviceIds.value = []
  }
}

const filterNode = (value, data) => {
  if (!value) return true
  return String(data.label || '').toLowerCase().includes(String(value).toLowerCase())
}

const getOrgsPage = async (name = '', autoSelect = false) => {
  const res = await orgManagementServer.orgsPage({
    pageNum: 1,
    pageSize: 9999,
    name
  })
  if(res.code == 200){
    leftTableData.value = res.data.records
    if (autoSelect) {
      const firstOrg = leftTableData.value[0]
      if (firstOrg) {
        // We need to wait for tree to render to set current key
        setTimeout(() => {
          if (treeRef.value) {
            treeRef.value.setCurrentKey(firstOrg.id)
            onNodeClick({ id: firstOrg.id, label: firstOrg.name })
          }
        }, 0)
      }
    }
  }
}

onMounted(() => {
  getOrgsPage('', true)
})

let orgSearchTimer = null
watch(orgSearch, (val) => {
  if (orgSearchTimer) clearTimeout(orgSearchTimer)
  orgSearchTimer = setTimeout(() => {
    getOrgsPage(val, false)
  }, 300)
})

const openLicenseDialog = () => {
  if (!activeOrgId.value) {
     ElMessage.warning('请先选择一个机构')
     return
  }
  licenseDialogVisible.value = true
}

const onSaveLicense = async (expireTime) => {
  licenseForm.expireTime = expireTime
  await saveLicense()
}

// Org Actions
const startAddOrg = () => {
  orgDialogMode.value = 'add'
  Object.keys(orgForm).forEach(k => orgForm[k] = '')
  orgDialogVisible.value = true
}

const startEditOrg = (data) => {
  const target = data || (activeOrgId.value ? {
       id: activeOrgId.value,
       name: activeNode.value,
   } : null)

   if (!target || !target.id) {
       ElMessage.warning('请先选择一个机构')
       return
   }
   
   orgDialogMode.value = 'edit'
   Object.assign(orgForm, {
       id: target.id,
       name: target.name || target.label,
   })
  orgDialogVisible.value = true
}


const deleteOrg = (data) => {
  const targetId = data?.id || activeOrgId.value
  const targetName = data?.name || data?.label || activeNode.value

  if (!targetId) {
      ElMessage.warning('请先选择一个机构')
      return
  }
  ElMessageBox.confirm(`确定删除机构「${targetName}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  }).then(async () => {
    try {
        const res = await orgManagementServer.orgsDelete(targetId)
        if (res.code === 200) {
            ElMessage.success('机构已删除')
            if (activeOrgId.value === targetId) {
                activeOrgId.value = ''
                activeNode.value = ''
            }
            getOrgsPage('', true)
        }
    } catch (e) {
        console.error(e)
    }
  }).catch(() => {})
}

const closeOrgDialog = () => {
  orgDialogVisible.value = false
}

const saveOrg = async () => {
  try {
    let res
    if (orgDialogMode.value === 'add') {
      res = await orgManagementServer.orgsAdd(orgForm)
    } else {
      res = await orgManagementServer.orgsPut(orgForm, orgForm.id)
    }
    if (res.code === 200) {
      ElMessage.success(orgDialogMode.value === 'add' ? '添加成功' : '保存成功')
      orgDialogVisible.value = false
      getOrgsPage(orgSearch.value, false)
    }
  } catch (e) {
    console.error(e)
  }
}

const openAssignDeviceDialog = async () => {
  if (!activeOrgId.value) {
     ElMessage.warning('请先选择一个机构')
     return
  }
  await getOrgAuthorization(activeOrgId.value)
  await getAllManufacturers()
  await getAllDevices()
  assignDeviceDialogVisible.value = true
}

const closeAssignDeviceDialog = () => {
  assignDeviceDialogVisible.value = false
}

// Auth Actions
const closeAuthDialog = () => {
  // Not used anymore
}

const getOrgAuthorization = async (orgId) => {
  try {
    const res = await orgManagementServer.authorizationsPage({ orgId, pageNum: 1, pageSize: 9999 })
    if (res.code === 200) {
       const authData = res.data?.records?.[0] || {}
       licenseForm.expireTime = authData.expireTime || ''
       selectedDeviceIds.value = res.data?.records?.map(item => item.deviceId) || []
       licenseForm.licenseKey = authData.licenseKey || 'LICENSE-KEY-EXAMPLE-123456'
    }
  } catch (e) {
    console.error(e)
  }
}

const getAllDevices = async () => {
  try {
    const res = await deviceManagementServer.devicesPage({ pageNum: 1, pageSize: 9999 })
    if (res.code === 200) {
      allDevices.value = res.data?.records || []
    }
  } catch (e) {
    console.error(e)
  }
}

const getAllManufacturers = async () => {
  try {
    const res = await deviceManagementServer.manufacturersPage({ pageNum: 1, pageSize: 9999 })
    if (res.code === 200) {
      allManufacturers.value = res.data?.records || []
    }
  } catch (e) {
    console.error(e)
  }
}

const onSwitchPlugin = (row) => {
  currentSwitchDevice.value = row
  pluginSelectionDialogVisible.value = true
}

const handlePluginSwitch = async (plugin) => {
  if (!currentSwitchDevice.value || !activeOrgId.value) return

  try {
    const res = await orgManagementServer.authorizationsSetDefault({
      organizationId: Number(activeOrgId.value),
      deviceId: Number(currentSwitchDevice.value.id),
      pluginId: Number(plugin.id)
    })
    
    if (res.code === 200) {
      ElMessage.success(`已切换到插件: ${plugin.name}`)
      pluginSelectionDialogVisible.value = false
      // 刷新列表
      getOrgAuthorization(activeOrgId.value)
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('切换插件失败')
  }
}

const onDeleteAuth = (row) => {
  ElMessageBox.confirm(`确定取消授权仪器「${row.deviceName}」吗？`, '取消授权', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    // TODO: 实现取消授权逻辑
    // 暂时模拟删除，实际应调用后端接口
    // const res = await orgManagementServer.authorizationsDelete(...)
    ElMessage.success('授权已取消')
    // 刷新列表
    getOrgAuthorization(activeOrgId.value)
  }).catch(() => {})
}

const saveLicense = async () => {
  try {
    const res = await orgManagementServer.usersLicense({
      orgId: activeOrgId.value,
      expireTime: licenseForm.expireTime
    })
    if (res.code === 200) {
      ElMessage.success('有效期设置成功')
    }
  } catch (e) {
    console.error(e)
  }
}

const saveDeviceAuth = async () => {
  try {
    const res = await orgManagementServer.authorizationsDevices({
      organizationId: activeOrgId.value,
      deviceIds: selectedDeviceIds.value
    })
    if (res.code === 200) {
      ElMessage.success('仪器授权保存成功')
      assignDeviceDialogVisible.value = false
      // Refresh list
      getOrgAuthorization(activeOrgId.value)
    }
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped lang="scss">
.org-layout {
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
.custom-tree {
  flex: 1;
  overflow: auto;
  min-height: 0;
  width: 100%;
}
.right-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  background: #fff;
  overflow: hidden;
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.content-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
</style>
