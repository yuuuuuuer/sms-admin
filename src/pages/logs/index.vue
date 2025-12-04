<script lang="ts" setup>
import type { LogRecord } from "@@/apis/logs/type"
import { getLogsApi } from "@@/apis/logs"
import dayjs from "dayjs"

const tableLoading = ref(false)
const logList = ref<LogRecord[]>([])

const pagination = reactive({
  pageNumber: 1,
  pageSize: 20,
  total: 0
})

const summary = reactive({
  sendTotal: 0,
  captureNumber: 0,
  sendSuccess: 0,
  userTotal: 0
})

const searchRange = ref<[string, string]>(getDefaultRange())

function getDefaultRange(): [string, string] {
  const end = dayjs()
  const start = end.subtract(6, "day")
  return [start.format("YYYY-MM-DD 00:00:00"), end.format("YYYY-MM-DD 23:59:59")]
}

const cards = computed(() => [
  { label: "推送数量", value: summary.sendTotal },
  { label: "捕获数量", value: summary.captureNumber },
  { label: "次数数量", value: pagination.total },
  { label: "发送数量", value: summary.sendSuccess },
  { label: "成功率", value: formatRate(summary.sendSuccess, summary.sendTotal) },
  { label: "用户数量", value: summary.userTotal }
])

function formatRate(sendSuccess: number, sendTotal: number) {
  if (!sendTotal) return "0%"
  return `${((sendSuccess / sendTotal) * 100).toFixed(2)}%`
}

function buildTimeParams() {
  const [start, end] = searchRange.value || []
  if (!start || !end) {
    return null
  }
  return {
    startTime: start,
    endTime: end
  }
}

async function fetchLogs() {
  const timeParams = buildTimeParams()
  if (!timeParams) {
    ElMessage.warning("请选择查询时间范围")
    return
  }
  tableLoading.value = true
  try {
    const { data } = await getLogsApi({
      ...timeParams,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize
    })
    logList.value = data.list
    pagination.total = data.total
    summary.sendTotal = data.summary.sendTotal
    summary.captureNumber = data.summary.captureNumber
    summary.sendSuccess = data.summary.sendSuccess
    summary.userTotal = data.summary.userTotal
  } finally {
    tableLoading.value = false
  }
}

function handleQuery() {
  pagination.pageNumber = 1
  fetchLogs()
}

function handleReset() {
  searchRange.value = getDefaultRange()
  pagination.pageNumber = 1
  fetchLogs()
}

function handlePageChange(page: number) {
  pagination.pageNumber = page
  fetchLogs()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.pageNumber = 1
  fetchLogs()
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="app-container">
    <el-card class="filter-card" shadow="never">
      <el-form inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            查询
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="stats-row">
      <el-col v-for="card in cards" :key="card.label" :xs="12" :sm="8" :md="4">
        <el-card class="stat-card" shadow="hover">
          <p class="label">
            {{ card.label }}
          </p>
          <p class="value">
            {{ card.value }}
          </p>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <el-table
        v-loading="tableLoading"
        :data="logList"
        border
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="operateTime" label="操作时间" min-width="200" />
        <el-table-column prop="operateType" label="操作类型" min-width="160" />
      </el-table>
      <el-pagination
        :current-page="pagination.pageNumber"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        background
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.filter-card {
  margin-bottom: 16px;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
  .label {
    margin: 0;
    color: var(--el-text-color-secondary);
  }
  .value {
    margin: 6px 0 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
