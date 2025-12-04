import { getProfileApi } from "@@/apis/auth"
import { setToken as _setToken, getToken, removeToken } from "@@/utils/cache/cookies"
import { computed } from "vue"
import { pinia } from "@/pinia"
import { resetRouter } from "@/router"
import { routerConfig } from "@/router/config"
import { useSettingsStore } from "./settings"
import { useTagsViewStore } from "./tags-view"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")

  const roles = ref<string[]>([])

  const username = ref<string>("")

  const department = ref<string>("")

  const loginTime = ref<string>("")

  const tagsViewStore = useTagsViewStore()

  const settingsStore = useSettingsStore()

  // 设置 Token
  const setToken = (value: string) => {
    _setToken(value)
    token.value = value
  }

  // 获取用户详情
  const getInfo = async () => {
    const { data } = await getProfileApi()
    if (!data) {
      username.value = ""
      department.value = ""
      loginTime.value = ""
      roles.value = routerConfig.defaultRoles
      return
    }
    username.value = data.username ?? ""
    department.value = data.department ?? ""
    loginTime.value = data.loginTime ?? ""
    // 兼容后端返回 roles 或 role 字段，且可能为 string 或 string[]
    const source = data as unknown as { roles?: string | string[], role?: string | string[] }
    const rawRoles = source.roles ?? source.role
    const roleArray = Array.isArray(rawRoles)
      ? rawRoles
      : rawRoles
        ? [rawRoles]
        : []
    const normalizedRoles = roleArray.map(role => role.toLowerCase())
    // 验证返回的 roles 是否为一个非空数组，否则塞入一个没有任何作用的默认角色，防止路由守卫逻辑进入无限循环
    roles.value = normalizedRoles.length > 0 ? normalizedRoles : routerConfig.defaultRoles
  }

  // 模拟角色变化
  const changeRoles = (role: string) => {
    const newToken = `token-${role}`
    token.value = newToken
    _setToken(newToken)
    // 用刷新页面代替重新登录
    location.reload()
  }

  // 登出
  const logout = () => {
    removeToken()
    token.value = ""
    roles.value = []
    department.value = ""
    loginTime.value = ""
    resetRouter()
    resetTagsView()
    location.reload()
  }

  // 重置 Token
  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = []
    department.value = ""
    loginTime.value = ""
  }

  // 重置 Visited Views 和 Cached Views
  const resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  const isSuperAdmin = computed(() => roles.value.includes("superadmin"))

  const isAdminOrHigher = computed(() => roles.value.some(role => ["admin", "superadmin"].includes(role)))

  return {
    token,
    roles,
    username,
    department,
    loginTime,
    isSuperAdmin,
    isAdminOrHigher,
    setToken,
    getInfo,
    changeRoles,
    logout,
    resetToken
  }
})

/**
 * @description 在 SPA 应用中可用于在 pinia 实例被激活前使用 store
 * @description 在 SSR 应用中可用于在 setup 外使用 store
 */
export function useUserStoreOutside() {
  return useUserStore(pinia)
}
