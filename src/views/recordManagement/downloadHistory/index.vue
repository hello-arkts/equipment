<template>
  <div class="download-history-container">
    <div class="content">
      <el-table 
        v-loading="loading"
        :data="tableData" 
        border 
        stripe 
        style="width: 100%; height: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="organizationName" label="机构名称" show-overflow-tooltip />
        <el-table-column prop="downloadTime" label="下载时间" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button 
              type="primary" 
              link 
              size="small" 
              :loading="downloadingId === row.id"
              @click="handleDownload(row)"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="footer">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="下载详情"
      direction="rtl"
      size="600px"
      class="detail-drawer"
    >
      <div class="drawer-content">
        <el-descriptions title="基础信息" :column="1" border class="mb-4">
          <el-descriptions-item label="机构名称">{{ currentDetail?.organizationName }}</el-descriptions-item>
          <el-descriptions-item label="下载时间">{{ currentDetail?.downloadTime }}</el-descriptions-item>
        </el-descriptions>

        <div class="device-list-section">
          <h4 class="section-title">设备列表</h4>
          <div class="table-wrapper">
            <el-table :data="currentDetail?.deviceList || []" border stripe style="width: 100%; height: 100%">
              <el-table-column prop="deviceName" label="设备名称" show-overflow-tooltip />
              <el-table-column prop="deviceModel" label="设备型号" show-overflow-tooltip />
              <el-table-column prop="pluginJar" label="插件文件" show-overflow-tooltip />
              <el-table-column prop="pluginVersion" label="版本" width="100" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import recordServers from '../../../api/servers/recordServers.js'
import pluginsServer from '../../../api/servers/pluginsServer.js'

const loading = ref(false)
const downloadingId = ref(null)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const drawerVisible = ref(false)
const currentDetail = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await recordServers.downloadsRecords({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      tableData.value = res.data?.records || []
      total.value = Number(res.data.total)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  fetchData()
}

const handleDetail = (row) => {
  currentDetail.value = row
  drawerVisible.value = true
}

const handleDownload = async (row) => {
  if (downloadingId.value) return // 防止重复点击
  downloadingId.value = row.id
  try {
    const res = await pluginsServer.pluginsDownloadArchive(row.id)
    if (!res) return

    const blob = res.data
    // 尝试从 content-disposition 获取文件名
    let fileName = `archive_${row.id}.zip`
    const disposition = res.headers['content-disposition']
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      const matches = filenameRegex.exec(disposition)
      if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '')
        fileName = decodeURIComponent(fileName)
      }
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('下载开始')
  } catch (e) {
    console.error(e)
    ElMessage.error('下载失败')
  } finally {
    downloadingId.value = null
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.download-history-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 8px;
  box-sizing: border-box;
}

.content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.footer {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

:deep(.detail-drawer .el-drawer__body) {
  padding: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键属性，允许flex子项收缩 */
  margin-top: 20px;
}

.section-title {
  margin-bottom: 10px;
  font-weight: bold;
  color: #303133;
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1;
  min-height: 0; /* 关键属性，允许内部滚动 */
}
</style>
