import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers['token'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 401 || res.code === 403) {
      // token无效,清除token并跳转登录页
      localStorage.removeItem('token')
      // 清除cookie - 设置过期时间为过去时间并匹配原配置
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict; Secure;'
      message.error('登录已过期,请重新登录')
      router.push('/login')
      return Promise.reject(new Error('登录已过期'))
    } else if (res.code !== 200) {
      // 其他业务错误
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    message.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service 