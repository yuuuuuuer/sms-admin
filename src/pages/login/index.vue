<script lang="ts" setup>
import type { FormRules } from "element-plus"
import { loginAppApi } from "@@/apis/auth"
import ThemeSwitch from "@@/components/ThemeSwitch/index.vue"
import { Lock, User } from "@element-plus/icons-vue"
import { useSettingsStore } from "@/pinia/stores/settings"
import { useUserStore } from "@/pinia/stores/user"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

interface LoginForm {
  username: string
  password: string
}

const loginFormRef = useTemplateRef("loginFormRef")
const loading = ref(false)

const loginFormData = reactive<LoginForm>({
  username: "",
  password: ""
})

const loginFormRules: FormRules<LoginForm> = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
}

function handleLogin() {
  loginFormRef.value?.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await loginAppApi({
        username: loginFormData.username,
        password: loginFormData.password
      })
      userStore.setToken(res.token)
      const redirectPath = route.query.redirect ? decodeURIComponent(route.query.redirect as string) : "/dashboard"
      router.push(redirectPath)
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div class="login-container">
    <ThemeSwitch v-if="settingsStore.showThemeSwitch" class="theme-switch" />
    <div class="login-card">
      <h2 class="title">
        管理系统登录
      </h2>
      <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
        <el-form-item prop="username">
          <el-input
            v-model.trim="loginFormData.username"
            placeholder="请输入用户名"
            type="text"
            tabindex="1"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model.trim="loginFormData.password"
            placeholder="请输入密码"
            type="password"
            tabindex="2"
            :prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>
        <el-button :loading="loading" type="primary" size="large" @click.prevent="handleLogin">
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  padding: 20px;
  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }
}

.login-card {
  width: 420px;
  max-width: 100%;
  padding: 40px 35px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  background-color: var(--el-bg-color);
  .title {
    margin: 0 0 30px;
    text-align: center;
    font-weight: 600;
    font-size: 26px;
    color: var(--el-text-color-primary);
  }
  .el-form-item {
    margin-bottom: 20px;
  }
  .el-button {
    width: 100%;
    margin-top: 10px;
    letter-spacing: 4px;
  }
}
</style>
