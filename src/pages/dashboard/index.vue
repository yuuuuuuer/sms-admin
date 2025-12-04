<script lang="ts" setup>
import { getDashboardSummaryApi, getDeptSummaryApi } from "@@/apis/dashboard"
import { Collection, Message, OfficeBuilding, UserFilled } from "@element-plus/icons-vue"
import { useUserStore } from "@/pinia/stores/user"

interface SummaryState {
  userTotal: number
  smsConfigTotal: number
  logTotal: number
  deptTotal: number
  lastLoginTime: string
  username: string
  role: string
}

const userStore = useUserStore()

const loading = ref(false)

const summary = reactive<SummaryState>({
  userTotal: 0,
  smsConfigTotal: 0,
  logTotal: 0,
  deptTotal: 0,
  lastLoginTime: "",
  username: "",
  role: ""
})

const cards = computed(() => {
  const base = [
    {
      label: "用户总数",
      value: summary.userTotal,
      icon: UserFilled,
      color: "#1d4ed8"
    },
    {
      label: "短信配置",
      value: summary.smsConfigTotal,
      icon: Message,
      color: "#ea580c"
    },
    {
      label: "操作记录",
      value: summary.logTotal,
      icon: Collection,
      color: "#0f766e"
    }
  ]
  if (userStore.isSuperAdmin) {
    base.push({
      label: "部门数量",
      value: summary.deptTotal,
      icon: OfficeBuilding,
      color: "#7c3aed"
    })
  }
  return base
})

const welcomeInfo = computed(() => [
  {
    label: "当前登录用户",
    value: summary.username || userStore.username || "-"
  },
  {
    label: "用户角色",
    value: summary.role || userStore.roles.join(" / ") || "-"
  },
  {
    label: "登录时间",
    value: summary.lastLoginTime || userStore.loginTime || "-"
  }
])

async function fetchSummary() {
  loading.value = true
  try {
    const { data } = await getDashboardSummaryApi()
    summary.userTotal = data.userTotal
    summary.smsConfigTotal = data.smsConfigTotal
    summary.logTotal = data.logTotal
    summary.lastLoginTime = data.lastLoginTime
    summary.username = data.username
    summary.role = data.role
    if (userStore.isSuperAdmin) {
      const deptRes = await getDeptSummaryApi()
      summary.deptTotal = deptRes.data.deptTotal
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSummary()
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <el-row :gutter="20" class="summary-row">
      <el-col
        v-for="card in cards"
        :key="card.label"
        :xs="24"
        :sm="12"
        :lg="6"
      >
        <el-card shadow="hover" class="summary-card">
          <div class="card-icon" :style="{ backgroundColor: `${card.color}20`, color: card.color }">
            <component :is="card.icon" />
          </div>
          <div class="card-content">
            <p class="card-label">
              {{ card.label }}
            </p>
            <p class="card-value">
              {{ card.value }}
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" shadow="never">
      <h3>欢迎使用管理系统</h3>
      <el-row :gutter="20">
        <el-col v-for="item in welcomeInfo" :key="item.label" :xs="24" :sm="12" :lg="8">
          <div class="welcome-item">
            <span class="label">{{ item.label }}：</span>
            <span class="value">{{ item.value }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  padding: 16px;
}

.summary-row {
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  min-height: 120px;
  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    margin-right: 16px;
  }
  .card-content {
    .card-label {
      margin: 0;
      color: var(--el-text-color-secondary);
    }
    .card-value {
      margin: 8px 0 0;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

.welcome-card {
  h3 {
    margin: 0 0 16px;
    font-weight: 600;
  }
  .welcome-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    .label {
      color: var(--el-text-color-secondary);
      margin-right: 8px;
    }
    .value {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
}
</style>
