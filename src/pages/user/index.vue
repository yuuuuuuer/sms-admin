<script lang="ts" setup>
import type { DeptItem } from "@@/apis/dept/type"
import type { UserListItem, UserRole } from "@@/apis/users/type"
import type { FormInstance, FormRules } from "element-plus"
import { getDeptListApi } from "@@/apis/dept"
import { createUserApi, getUserListApi, resetUserPasswordApi, toggleUserStatusApi, updateUserApi, updateUserDepartmentApi } from "@@/apis/users"
import { useUserStore } from "@/pinia/stores/user"

interface CreateForm {
  username: string
  password: string
  department: string
  role: UserRole
  snType: 0 | 1
}

interface EditForm {
  id: number
  username: string
  password: string
}

interface DeptForm {
  id: number
  department: string
}

const userStore = useUserStore()

const NEW_DEPT_VALUE = "__NEW_DEPT__"
const lastCreateDept = ref<string>("")

const tableLoading = ref(false)
const userList = ref<UserListItem[]>([])

const pagination = reactive({
  pageNumber: 1,
  pageSize: 20,
  total: 0
})

const deptOptions = ref<DeptItem[]>([])

const createDialogVisible = ref(false)
const createDeptDialogVisible = ref(false)
const newDeptName = ref("")
const createFormRef = useTemplateRef<FormInstance>("createFormRef")
const createForm = reactive<CreateForm>({
  username: "",
  password: "",
  department: "",
  role: "user",
  snType: 1
})

const editDialogVisible = ref(false)
const editFormRef = useTemplateRef<FormInstance>("editFormRef")
const editForm = reactive<EditForm>({
  id: 0,
  username: "",
  password: ""
})

const deptDialogVisible = ref(false)
const deptForm = reactive<DeptForm>({
  id: 0,
  department: ""
})

const createRules: FormRules<CreateForm> = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" }
  ],
  department: [{ required: true, message: "请选择部门", trigger: "change" }],
  role: [{ required: true, message: "请选择权限", trigger: "change" }],
  snType: [{ required: true, message: "请选择状态", trigger: "change" }]
}

const editRules: FormRules<EditForm> = {
  password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" }
  ]
}

const deptRules: FormRules<DeptForm> = {
  department: [{ required: true, message: "请选择部门", trigger: "change" }]
}

const roleLabelMap: Record<UserRole, string> = {
  superadmin: "超级管理员",
  admin: "管理员",
  user: "普通用户"
}

function getRoleLabel(role: string) {
  return roleLabelMap[role as UserRole] ?? role
}

const showAdminActions = computed(() => userStore.isAdminOrHigher)
const showSuperAdminActions = computed(() => userStore.isSuperAdmin)

function formatOnlineMinutes(minutes?: number) {
  if (!minutes || minutes <= 0) return "-"
  const hours = Math.floor(minutes / 60)
  const remain = minutes % 60
  if (hours && remain) return `${hours}小时${remain}分钟`
  if (hours) return `${hours}小时`
  return `${remain}分钟`
}

async function fetchDeptOptions() {
  if (!userStore.isSuperAdmin) return
  const res = await getDeptListApi()
  const list = res.data ?? []
  deptOptions.value = list
  if (!createForm.department && list.length) {
    createForm.department = list[0].name
  }
}

async function fetchUserList() {
  tableLoading.value = true
  try {
    const { data } = await getUserListApi({
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize
    })
    userList.value = data?.list ?? []
    pagination.total = data?.total ?? 0
  } finally {
    tableLoading.value = false
  }
}

function handlePageChange(page: number) {
  pagination.pageNumber = page
  fetchUserList()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.pageNumber = 1
  fetchUserList()
}

function openCreateDialog() {
  createDialogVisible.value = true
  Object.assign(createForm, {
    username: "",
    password: "",
    department: createForm.department || (deptOptions.value[0]?.name ?? ""),
    role: "user" as UserRole,
    snType: 1 as 0 | 1
  })
  lastCreateDept.value = createForm.department
}

function handleCreateDeptChange(value: string) {
  if (value !== NEW_DEPT_VALUE) {
    lastCreateDept.value = value
    return
  }

  // 选择「新建部门」，还原为上一次有效部门并打开新建弹窗
  createForm.department = lastCreateDept.value
  newDeptName.value = ""
  createDeptDialogVisible.value = true
}

function handleCreateDeptCancel() {
  createDeptDialogVisible.value = false
  newDeptName.value = ""
}

function handleCreateDeptConfirm() {
  const name = newDeptName.value.trim()
  if (!name) {
    ElMessage.warning("请输入新部门名称")
    return
  }

  const exists = deptOptions.value.some(item => item.name === name)
  if (!exists) {
    deptOptions.value.push({
      // 仅前端使用的临时 ID，后端不依赖该字段
      id: Date.now(),
      name
    } as DeptItem)
  }

  createForm.department = name
  lastCreateDept.value = name
  createDeptDialogVisible.value = false
  newDeptName.value = ""
}

function submitCreate() {
  createFormRef.value?.validate(async (valid) => {
    if (!valid) return
    await createUserApi({
      username: createForm.username,
      password: createForm.password,
      department: createForm.department,
      role: createForm.role,
      snType: createForm.snType
    })
    ElMessage.success("新增用户成功")
    createDialogVisible.value = false
    fetchUserList()
  })
}

function openEditDialog(row: UserListItem) {
  editDialogVisible.value = true
  Object.assign(editForm, {
    id: row.id,
    username: row.username,
    password: ""
  })
}

function submitEdit() {
  editFormRef.value?.validate(async (valid) => {
    if (!valid) return
    await updateUserApi({
      id: editForm.id,
      password: editForm.password
    })
    ElMessage.success("密码修改成功")
    editDialogVisible.value = false
    fetchUserList()
  })
}

async function handleToggleStatus(row: UserListItem) {
  const nextStatus = row.snType === 1 ? 0 : 1
  const actionText = nextStatus === 1 ? "启用" : "禁用"
  await ElMessageBox.confirm(`确认${actionText}用户「${row.username}」吗？`, "提示", {
    type: "warning"
  })
  await toggleUserStatusApi(row.id, nextStatus)
  ElMessage.success(`${actionText}成功`)
  fetchUserList()
}

async function handleResetPassword(row: UserListItem) {
  await ElMessageBox.confirm(`确认将用户「${row.username}」的密码重置为 123456 吗？`, "提示", {
    type: "warning"
  })
  await resetUserPasswordApi(row.id)
  ElMessage.success("密码已重置为 123456")
}

function handleDeptClick(row: UserListItem) {
  if (!userStore.isSuperAdmin) return
  deptDialogVisible.value = true
  Object.assign(deptForm, {
    id: row.id,
    department: row.department
  })
}

async function submitDeptChange() {
  if (!userStore.isSuperAdmin) return
  await updateUserDepartmentApi({
    id: deptForm.id,
    department: deptForm.department
  })
  ElMessage.success("部门修改成功")
  deptDialogVisible.value = false
  fetchUserList()
}

const roleOptions: Array<{ label: string, value: UserRole }> = [
  { label: "超级管理员", value: "superadmin" },
  { label: "管理员", value: "admin" },
  { label: "普通用户", value: "user" }
]

const statusOptions = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 }
]

onMounted(async () => {
  await Promise.all([fetchUserList(), fetchDeptOptions()])
})
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="left">
          <el-button type="primary" @click="fetchUserList">
            刷新
          </el-button>
          <el-button v-if="showSuperAdminActions" type="success" @click="openCreateDialog">
            新增用户
          </el-button>
        </div>
        <div class="right">
          <span>共有 {{ pagination.total }} 名用户</span>
        </div>
      </div>
      <el-table
        v-loading="tableLoading"
        :data="userList"
        border
      >
        <el-table-column prop="id" label="用户ID" width="90" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column label="部门" min-width="120">
          <template #default="{ row }">
            <span
              :class="{ 'dept-editable': showSuperAdminActions }"
              @click="handleDeptClick(row)"
            >
              {{ row.department || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="权限" min-width="120">
          <template #default="{ row }">
            <el-tag>{{ getRoleLabel(row.role) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="snType" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.snType === 1 ? 'success' : 'danger'">
              {{ row.snType === 1 ? "正常" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="onlineMinutes" label="在线时间" min-width="140">
          <template #default="{ row }">
            {{ formatOnlineMinutes(row.onlineMinutes) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="showAdminActions" type="primary" link @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button
              v-if="showAdminActions"
              :type="row.snType === 1 ? 'danger' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.snType === 1 ? "禁用" : "启用" }}
            </el-button>
            <el-button v-if="showAdminActions" type="warning" link @click="handleResetPassword(row)">
              重置密码
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="pagination.pageNumber"
        :page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        background
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <!-- 新增用户 -->
    <el-dialog v-model="createDialogVisible" title="新增用户" width="480px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="createForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.trim="createForm.password" placeholder="请输入密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select
            v-model="createForm.department"
            placeholder="请选择部门"
            @change="handleCreateDeptChange"
          >
            <el-option
              v-for="dept in deptOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
            <el-option
              v-if="showSuperAdminActions"
              :key="NEW_DEPT_VALUE"
              label="新建部门"
              :value="NEW_DEPT_VALUE"
            >
              <span style="color: var(--el-color-primary)">+ 新建部门</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限" prop="role">
          <el-select v-model="createForm.role" placeholder="请选择权限">
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="snType">
          <el-radio-group v-model="createForm.snType">
            <el-radio-button
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitCreate">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 新建部门（仅前端选项） -->
    <el-dialog
      v-model="createDeptDialogVisible"
      title="新建部门"
      width="400px"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="部门名称">
          <el-input
            v-model.trim="newDeptName"
            placeholder="请输入新部门名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCreateDeptCancel">
          取消
        </el-button>
        <el-button type="primary" @click="handleCreateDeptConfirm">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑密码 -->
    <el-dialog v-model="editDialogVisible" title="编辑用户" width="420px" destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model.trim="editForm.password" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitEdit">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改部门 -->
    <el-dialog v-model="deptDialogVisible" title="修改部门" width="420px" destroy-on-close>
      <el-form :model="deptForm" :rules="deptRules" label-width="90px">
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="deptForm.department" placeholder="请选择部门">
            <el-option
              v-for="dept in deptOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deptDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="submitDeptChange">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  .left {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
  }
  .right {
    color: var(--el-text-color-secondary);
  }
}

.dept-editable {
  cursor: pointer;
  color: var(--el-color-primary);
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
