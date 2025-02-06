import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import 'ant-design-vue/dist/reset.css'
import './style/index.css'
import Particles from "particles.vue3"
import {ReloadOutlined, SettingOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined, LoadingOutlined, FileOutlined, FileExcelOutlined, RightOutlined ,PlusOutlined, CameraOutlined, UserOutlined} from '@ant-design/icons-vue'
const icons = {
    ReloadOutlined,
    SettingOutlined, 
    UploadOutlined,
    DownloadOutlined,
    DeleteOutlined,
    LoadingOutlined,
    FileOutlined,
    FileExcelOutlined,
    RightOutlined,
    PlusOutlined,
    CameraOutlined,
    UserOutlined
  }

const pinia = createPinia()
pinia.use(piniaPluginPersist)

const app = createApp(App)
app.use(Particles)
app.use(pinia)
app.use(router)
app.use(Antd)
// 全局注册图标
Object.keys(icons).forEach((key) => {
  app.component(key, icons[key as keyof typeof icons])
})

app.mount('#app')