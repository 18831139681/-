import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './style.css'

// 引入高德地图API
import AMapLoader from '@amap/amap-jsapi-loader'

// 引入mock数据，生产环境下注释掉
import './mock'

// 创建Pinia实例
const pinia = createPinia()

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 全局配置高德地图
app.config.globalProperties.$AMapLoader = AMapLoader

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化检查登录状态
import { useUserStore } from './stores/user'
const userStore = useUserStore(pinia)
userStore.checkLogin()

app.mount('#app')
