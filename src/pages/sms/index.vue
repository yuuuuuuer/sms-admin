<script lang="ts" setup>
import type { SmsRecordItem } from "@@/apis/sms-records/type"
import type { UserListItem } from "@@/apis/users/type"
import type { FormInstance, FormRules } from "element-plus"
import { createSmsRecordApi, deleteSmsRecordApi, getSmsRecordListApi, updateSmsRecordApi } from "@@/apis/sms-records"
import { getUserListApi } from "@@/apis/users"
import { useUserStore } from "@/pinia/stores/user"

interface SmsForm {
  id?: number
  userId: number | null
  type: number | null
  smsNumber: string
  smsMsg: string
}

const userStore = useUserStore()

const tableLoading = ref(false)
const smsList = ref<SmsRecordItem[]>([])
const userOptions = ref<UserListItem[]>([])

const pagination = reactive({
  pageNumber: 1,
  pageSize: 20,
  total: 0
})

const dialogVisible = ref(false)
const smsFormRef = useTemplateRef<FormInstance>("smsFormRef")
const smsForm = reactive<SmsForm>({
  id: undefined,
  userId: null,
  type: null,
  smsNumber: "",
  smsMsg: ""
})

const formRules: FormRules<SmsForm> = {
  userId: [{ required: true, message: "请选择所属用户", trigger: "change" }],
  type: [{ required: true, message: "请选择短信类型", trigger: "change" }],
  smsNumber: [{ required: true, message: "请输入短信号码", trigger: "blur" }],
  smsMsg: [{ required: true, message: "请输入短信内容", trigger: "blur" }]
}

const typeOptions = [
  { label: "强显", value: 0 },
  { label: "短信", value: 1 }
]

function getTypeLabel(type: string | number): string {
  const typeNum = typeof type === "string" ? Number.parseInt(type, 10) : type
  return typeNum === 0 ? "强显" : typeNum === 1 ? "短信" : String(type)
}

const dialogTitle = computed(() => (smsForm.id ? "编辑短信配置" : "新增短信配置"))

const showActions = computed(() => userStore.isAdminOrHigher)

async function fetchSmsList() {
  tableLoading.value = true
  try {
    const { data } = await getSmsRecordListApi({
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize
    })
    smsList.value = data?.list ?? []
    pagination.total = data?.total ?? 0
  } finally {
    tableLoading.value = false
  }
}

async function fetchUserOptions() {
  const { data } = await getUserListApi({
    pageNumber: 1,
    pageSize: 500
  })
  userOptions.value = data?.list ?? []
}

function handlePageChange(page: number) {
  pagination.pageNumber = page
  fetchSmsList()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.pageNumber = 1
  fetchSmsList()
}

function openDialog(record?: SmsRecordItem) {
  dialogVisible.value = true
  const typeValue = record?.type ? (typeof record.type === "string" ? Number.parseInt(record.type, 10) : record.type) : null
  Object.assign(smsForm, {
    id: record?.id,
    userId: record?.userId ?? null,
    type: typeValue,
    smsNumber: record?.smsNumber ?? "",
    smsMsg: record?.smsMsg ?? ""
  })
}

function submitForm() {
  smsFormRef.value?.validate(async (valid) => {
    if (!valid || smsForm.userId == null || smsForm.type == null) return
    const payload = {
      id: smsForm.id,
      userId: smsForm.userId,
      type: String(smsForm.type),
      smsNumber: smsForm.smsNumber,
      smsMsg: smsForm.smsMsg
    }
    if (smsForm.id) {
      await updateSmsRecordApi(payload)
      ElMessage.success("更新成功")
    } else {
      await createSmsRecordApi(payload)
      ElMessage.success("新增成功")
    }
    dialogVisible.value = false
    fetchSmsList()
  })
}

async function handleDelete(record: SmsRecordItem) {
  await ElMessageBox.confirm(`确定删除「${record.username}」的短信配置吗？`, "提示", { type: "warning" })
  await deleteSmsRecordApi(record.id)
  ElMessage.success("删除成功")
  fetchSmsList()
}

onMounted(async () => {
  await Promise.all([fetchSmsList(), fetchUserOptions()])
})
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="left">
          <el-button type="primary" @click="fetchSmsList">
            刷新
          </el-button>
          <el-button v-if="showActions" type="success" @click="openDialog()">
            新增配置
          </el-button>
        </div>
        <div class="right">
          <span>共 {{ pagination.total }} 条记录</span>
        </div>
      </div>

      <el-table
        v-loading="tableLoading"
        :data="smsList"
        border
      >
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="type" label="类型" min-width="120">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="smsNumber" label="短信号码" min-width="160" />
        <el-table-column prop="smsMsg" label="短信内容" min-width="260" show-overflow-tooltip />
        <el-table-column v-if="showActions" label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form ref="smsFormRef" :model="smsForm" :rules="formRules" label-width="90px">
        <el-form-item label="所属用户" prop="userId">
          <el-select v-model="smsForm.userId" placeholder="请选择用户">
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.username}（${user.department}）`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="短信类型" prop="type">
          <el-select v-model="smsForm.type" placeholder="请选择短信类型">
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="短信号码" prop="smsNumber">
          <el-input v-model.trim="smsForm.smsNumber" placeholder="请输入短信号码" />
        </el-form-item>
        <el-form-item label="短信内容" prop="smsMsg">
          <el-input
            v-model="smsForm.smsMsg"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 6 }"
            placeholder="请输入短信内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitForm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 16px;
  .left {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
  }
  .right {
    color: var(--el-text-color-secondary);
  }
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
