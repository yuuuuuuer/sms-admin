## 技术栈

Vue3：采用 Vue3 + script setup 最新的 Vue3 组合式 API、 Element Plus：Element UI 的 Vue3 版本、Pinia、Vite、Vue Router、TypeScript、pnpm、Scss、CSS 变量、ESLint：代码校验与格式化、Axios：发送网络请求（已封装好）、UnoCSS：具有高性能且极具灵活性的即时原子化 CSS 引擎 ##目录结构：

# v3-admin-vite 5.0

├─ .husky # commit 时进行代码校验和格式化
├─ .vscode # vscode 配置和插件
├─ public
│ ├─ favicon.ico # 网站头像
│ ├─ app-loading.css # 首屏 loading 动画
│ └─ detect-ie.js # 检测 ie
├─ src
│ ├─ common # 通用目录
│ │ ├─ apis # 通用目录 - 接口
│ │ ├─ assets # 通用目录 - 静态资源
│ │ ├─ components # 通用目录 - 组件
│ │ ├─ composables # 通用目录 - 组合式函数
│ │ ├─ constants # 通用目录 - 常量
│ │ └─ utils # 通用目录 - 工具函数
│ ├─ http # 网络请求
│ ├─ layouts # 布局
│ ├─ pages # 页面
│ │ └─ login # 登录模块
│ │ ├─ apis # 登录模块 - 私有接口
│ │ ├─ components # 登录模块 - 私有组件
│ │ ├─ composables # 登录模块 - 私有组合式函数
│ │ ├─ images # 登录模块 - 私有图片
│ │ └─ index.vue # 登录模块 - 页面
│ ├─ pinia # 状态管理
│ ├─ plugins # 插件（全局组件、自定义指令等）
│ ├─ router # 路由
│ ├─ App.vue # 入口页面
│ └─ main.ts # 入口文件
├─ tests # 单元测试
├─ types # 类型声明
├─ .editorconfig # 编辑器配置
├─ .env # 所有环境
├─ .env.development # 开发环境
├─ .env.production # 生产环境
├─ .env.staging # 预发布环境
├─ eslint.config.js # eslint 配置
├─ tsconfig.json # ts 配置
├─ uno.config.ts # unocss 配置
└─ vite.config.ts # vite 配置

## 配置项

/\*\*

- @description 设置为 noRedirect 的时候该路由在面包屑导航中不可被点击
  \*/
  redirect: "noRedirect"

/\*\*

- @description 动态路由必须设定路由的 name，不然重置路由可能会出问题
- @description 如果要在标签栏中展示，也必须填 name
  \*/
  name: "router-name"

meta: {
/\*\*

- @description 设置该路由在侧边栏和面包屑中展示的名字
  \*/
  title?: string
  /\*\*
- @description 设置该路由的图标，记得将 svg 导入 src/common/assets/icons
  \*/
  svgIcon?: SvgName
  /\*\*
- @description 设置该路由的图标，直接使用 Element Plus 的 Icon（与 svgIcon 同时设置时，svgIcon 将优先生效）
  \*/
  elIcon?: ElementPlusIconsName
  /\*\*
- @description 默认 false，设置 true 的时候该路由不会在侧边栏出现
  \*/
  hidden?: boolean
  /\*\*
- @description 设置能进入该路由的角色，支持多个角色叠加
  \*/
  roles?: string[]
  /\*\*
- @description 默认 true，如果设置为 false，则不会在面包屑中显示
  \*/
  breadcrumb?: boolean
  /\*\*
- @description 默认 false，如果设置为 true，它则会固定在 tags-view 中
  \*/
  affix?: boolean
  /\*\*
- @description 当一个路由的 children 属性中声明的非隐藏子路由只有 1 个且该子路由为叶子节点时，会将这个子路由当做父路由显示在侧边栏
- @description 当大于 1 个时，会恢复成嵌套模式
- @description 如果想不管个数总是显示父路由，可以在父路由上设置 alwaysShow: true
  \*/
  alwaysShow?: boolean
  /\*\*
- @description 示例: activeMenu: "/xxx/xxx"，
- @description 当设置了该属性进入路由时，则会高亮 activeMenu 属性对应的侧边栏
- @description 该属性适合使用在有 hidden: true 属性的路由上
  \*/
  activeMenu?: string
  /\*\*
- @description 是否缓存该路由页面
- @description 默认为 false，为 true 时代表需要缓存，此时该路由和该页面都需要设置一致的 Name
  \*/
  keepAlive?: boolean
  }

## 动态路由

constantRoutes：把不需要判断权限的路由放置在常驻路由里面，如 /login、/dashboard
dynamicRoutes：放置需要动态判断权限并通过 addRoute 动态添加的路由

## 注意：动态路由必须配置 name 属性，不然重置路由时，会漏掉没有该属性的动态路由，可能会导致业务 BUG

## 侧边栏和面包屑

#侧边栏
侧边栏 @/layouts/components/Sidebar 是通过读取路由并结合权限判断而动态生成的（换句话说就是常驻路由 + 有权限的动态路由）

面包屑 @/layouts/components/BreadCrumb 也是根据路由动态生成的，为路由设置 breadcrumb: false 时该路由将不会出现在面包屑中，设置 redirect: "noRedirect" 时该路由在面包屑中不能被点击

## 权限

登录时通过获取当前用户的权限（角色）去比对路由表，生成当前用户具有的权限可访问的路由表，通过 addRoute 动态挂载到 router 上 ##页面权限
控制代码都在路由守卫 @/router/guard.ts 中，这里可根据具体的业务做相应的修改：##权限指令
简单快速的实现按钮级别的权限判断（v-permission 已注册到全局，可直接使用）：
<el-button v-permission="['admin', 'editor']">
admin 和 editor
</el-button>
但 Element Plus 的 el-tab-pane 和 el-table-column 以及其它动态渲染 DOM 的场景不适合使用 v-permission

这种情况下你可以通过 v-if + checkPermission 来实现

## 通用 API 模块

src/common/apis 目录存放通用的接口，而非某个页面固定使用的接口

## 私有 API 模块

某个页面固定使用的接口，应该在当前页面目录下建立一个 apis 文件夹，用来存放私有接口
参考登录页 src/pages/login/apis

## 封装的 Axios

src/http/axios.ts 是基于 axios 的封装，封装了全局 request 拦截器、response 拦截器、统一的错误处理、统一的超时处理、baseURL 设置等

## 打包构建

项目开发完成，打包构建代码时，内置两种环境：

# 打包构建预发布环境

pnpm build:staging

# 打包构建生产环境

pnpm build ##环境变量
在 .env.production 等形如 .env.xxx 文件中，配置了该环境对应的一些环境变量，例如：

## 后端接口地址（如果解决跨域问题采用反向代理就只需写相对路径）

VITE_BASE_URL = /api/v1

## 开发环境域名和静态资源公共路径（一般 / 或 ./ 都可以）

VITE_PUBLIC_PATH = /

## ESLint

规范代码很重要！

配置项在 eslint.config.js 文件中
推荐安装 VSCode 的 ESLint 插件，它可在写代码时，将不符合规范的代码标红，并且在你保存代码时自动修复一些简单的标红的代码
手动校验和格式化命令 pnpm lint（提交代码前可以执行该命令）

##代码提交校验
项目采用 husky + lint-staged 的方式，在提交代码的时候，进行全局 ts 类型检查和 eslint 校验
husky 会自动初始化，如果发现没有正常初始化，也可以通过命令 pnpm prepare 初始化 husky

# 跨域

## 反向代理

vite.config 里有 proxy 进行反向代理，与之对应的生产环境，则可以使用 nginx 来做反向代理
proxy: {
"/api/v1": {
target: "https://xxxxxx",
// 是否为 WebSocket
ws: false,
// 是否允许跨域
changeOrigin: true
}
}

# SVG

## 使用全局 SvgIcon 组件

unplugin-svg-component 插件提供的能力！

把下载好的 SVG 图标存放在 src/common/assets/icons 目录下，无需在页面中引入 SvgIcon 组件，即可直接使用：

<!-- name 为 svg 文件名 -->
<!-- 通过 class 修改默认样式 -->
<SvgIcon name="search" class="svg-icon" />
这种方式一般用来处理将 svg 当做 icon 的场景，比如侧边栏导航菜单
## 将 SVG 文件导入为 Vue 组件
vite-svg-loader 插件提供的的能力！
比如 404 页面：
```vue
<script lang="ts" setup>
import Layout from "./components/Layout.vue"
import Svg404 from "./images/404.svg?component" // vite-svg-loader 插件的功能
</script>

<template>
  <Layout>
    <Svg404 />
  </Layout>
</template>
```

这种方式一般用来处理将 svg 当做图片展示的场景，比如 404 页面的大图
