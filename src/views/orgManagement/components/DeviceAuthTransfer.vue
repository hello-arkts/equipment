<template>
  <div class="device-auth-transfer">
    <!-- Left Panel: Unassigned Devices (Tree) -->
    <div class="transfer-panel left-panel">
      <div class="panel-header">
        <span>未绑定仪器</span>
        <span class="count">{{ leftCheckedCount }}/{{ leftTotalCount }}</span>
      </div>
      <div class="panel-body">
        <el-input
          v-model="filterText"
          placeholder="搜索仪器"
          prefix-icon="Search"
          clearable
          class="filter-input"
        />
        <el-tree
          ref="treeRef"
          :data="treeData"
          show-checkbox
          node-key="key"
          default-expand-all
          :filter-node-method="filterNode"
          @check="onTreeCheck"
          height="300px"
          class="transfer-tree"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node" :class="{ 'is-disabled': data.disabled }">
              <span>{{ node.label }}</span>
              <span v-if="data.isDevice" class="device-tag">
                {{ data.code ? `(${data.code})` : '' }}
              </span>
              <span v-if="data.disabled" class="disabled-tag">
                (无插件)
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- Actions -->
    <div class="transfer-actions">
      <el-button
        type="primary"
        :disabled="leftCheckedKeys.length === 0"
        @click="addToTarget"
      >
        <el-icon><ArrowRight /></el-icon>
      </el-button>
      <el-button
        type="primary"
        :disabled="rightCheckedRows.length === 0"
        @click="removeFromTarget"
      >
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
    </div>

    <!-- Right Panel: Assigned Devices (List) -->
    <div class="transfer-panel right-panel">
      <div class="panel-header">
        <span>已绑定仪器</span>
        <span class="count">{{ rightCheckedRows.length }}/{{ targetList.length }}</span>
      </div>
      <div class="panel-body">
        <el-table
          :data="targetList"
          height="100%"
          @selection-change="onRightSelectionChange"
          style="width: 100%"
          :show-header="true"
          stripe
        >
          <el-table-column type="selection" width="40" />
          <el-table-column prop="label" label="名称" show-overflow-tooltip />
          <el-table-column prop="manufacturer" label="厂家" width="100" show-overflow-tooltip />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowRight, ArrowLeft, Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  allDevices: {
    type: Array,
    default: () => [] // Expected: { id, name, code, manufacturerId, manufacturerName }
  },
  manufacturers: {
    type: Array,
    default: () => [] // Expected: { id, name }
  }
})

console.log(props,'xixi')

const emit = defineEmits(['update:modelValue'])

const filterText = ref('')
const treeRef = ref(null)
const leftCheckedKeys = ref([]) // Keys checked in tree
const rightCheckedRows = ref([]) // Rows checked in table

// 1. Build Tree Data for Left Panel (Unassigned)
const treeData = computed(() => {
  // Get IDs currently selected (in right panel)
  const selectedIds = new Set(props.modelValue)

  // Group unassigned devices by manufacturer
  const groups = {}
  
  // Initialize groups with all manufacturers to ensure they appear even if empty?
  // User req: "Unauthorized devices to be displayed as a tree under manufacturers"
  // If a manufacturer has no unauthorized devices, maybe we skip it?
  // Let's iterate manufacturers first to keep order/structure
  props.manufacturers.forEach(m => {
    groups[m.id] = {
      key: `m_${m.id}`,
      label: m.name,
      children: [],
      isDevice: false
    }
  })

  // Distribute devices
  props.allDevices.forEach(d => {
    // Skip if already authorized
    if (selectedIds.has(d.id)) return

    const mId = d.manufacturerId
    // If device has no manufacturer or unknown manufacturer, maybe put in "Other"?
    // For now, only add if manufacturer exists in map (or create if missing?)
    // Creating if missing to be safe
    if (!groups[mId]) {
      // Use manufacturerName if available, else "Unknown"
      groups[mId] = {
        key: `m_${mId || 'unknown'}`,
        label: d.manufacturerName || '未知厂家',
        children: [],
        isDevice: false
      }
    }

    groups[mId].children.push({
      key: d.id, // Device ID
      label: d.name,
      code: d.code,
      isDevice: true,
      raw: d,
      disabled: d.pluginCount === 0 // Disable if pluginCount is 0
    })
  })

  // Convert map to array and filter out empty groups
  return Object.values(groups).filter(g => g.children.length > 0)
})

// 2. Build List for Right Panel (Assigned)
const targetList = computed(() => {
  const selectedIds = new Set(props.modelValue)
  
  // Create a map of manufacturers for quick lookup
  const manufacturerMap = new Map(props.manufacturers.map(m => [m.id, m.name]))

  return props.allDevices
    .filter(d => selectedIds.has(d.id))
    .map(d => ({
      id: d.id,
      label: `${d.name} ${d.code ? `(${d.code})` : ''}`,
      manufacturer: manufacturerMap.get(d.manufacturerId) || d.manufacturerName || '',
      raw: d
    }))
})

// Stats
const leftTotalCount = computed(() => {
  return treeData.value.reduce((acc, curr) => acc + curr.children.length, 0)
})

const leftCheckedCount = computed(() => {
  // Only count devices, not manufacturers
  // treeRef.value.getCheckedNodes(true) gets only leaf nodes if configured?
  // But we rely on manual check logic mostly for stats
  // Let's just use the length of keys that correspond to devices
  // Since keys for manufacturers are 'm_', we can filter
  return leftCheckedKeys.value.filter(k => typeof k !== 'string' || !k.startsWith('m_')).length
})

// Filter
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  const label = data.label || ''
  const code = data.code || ''
  const lowerVal = value.toLowerCase()
  return label.toLowerCase().includes(lowerVal) || code.toLowerCase().includes(lowerVal)
}

// Events
const onTreeCheck = (node, { checkedKeys, checkedNodes }) => {
  // We want to capture only device IDs
  // Filter out manufacturer keys (start with 'm_')
  const deviceKeys = checkedNodes
    .filter(n => n.isDevice)
    .map(n => n.key)
  leftCheckedKeys.value = deviceKeys
}

const onRightSelectionChange = (selection) => {
  rightCheckedRows.value = selection
}

const addToTarget = () => {
  const newIds = [...props.modelValue, ...leftCheckedKeys.value]
  // Deduplicate just in case
  const uniqueIds = Array.from(new Set(newIds))
  emit('update:modelValue', uniqueIds)
  
  // Clear selection
  treeRef.value?.setCheckedKeys([])
  leftCheckedKeys.value = []
}

const removeFromTarget = () => {
  const idsToRemove = new Set(rightCheckedRows.value.map(r => r.id))
  const newIds = props.modelValue.filter(id => !idsToRemove.has(id))
  emit('update:modelValue', newIds)
  
  // Clear selection (table handles it automatically if rows disappear, but good to reset)
  rightCheckedRows.value = []
}
</script>

<style scoped>
.device-auth-transfer {
  display: flex;
  align-items: center;
  height: 400px;
  gap: 16px;
}

.transfer-panel {
  flex: 1;
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 0;
}

.panel-header {
  height: 40px;
  line-height: 40px;
  background: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #303133;
}

.count {
  color: #909399;
  font-size: 12px;
}

.panel-body {
  flex: 1;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.filter-input {
  margin-bottom: 10px;
}

.transfer-tree {
  flex: 1;
  overflow: auto;
}

.transfer-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-tag {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

.disabled-tag {
  color: #f56c6c;
  font-size: 12px;
  margin-left: 4px;
}

.custom-tree-node.is-disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

:deep(.el-tree-node__content) {
  height: auto;
  min-height: 26px;
  padding: 4px 0;
}
</style>
