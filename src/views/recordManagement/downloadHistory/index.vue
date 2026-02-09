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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import recordServers from '../../../api/servers/recordServers.js'

const loading = ref(false)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)

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
</style>
