import { createRouter, createWebHashHistory, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTabStore } from '@/stores/tabs'
import { menuConfig } from '@/config/menu'
import { generateRoutes } from '@/utils/router'

const routes = generateRoutes(menuConfig)
import { useMenuStore } from '@/stores/menu'

console.log(routes)

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue')
    },
    ...routes
  ]
  
})

// 白名单路由(无需登录即可访问)
const whiteList = ['/login']

// 路由守卫
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  const tabStore = useTabStore()

  // 优先从cookie获取token,如果没有则从localStorage获取
  let token = document.cookie.split(';').find(item => item.trim().startsWith('token='))?.split('=')[1]
  if (!token) {
    token = localStorage.getItem('token')
  }

  // 更新store中的token
  if (token) {
    userStore.setToken(token)
    // 确保token同时存在于cookie和localStorage中
    if (!document.cookie.includes('token=')) {
      document.cookie = `token=${token};path=/;max-age=86400`  // 设置cookie过期时间为1天
    }
  }

  if (token) { //登录状态下
    if (to.path === '/login') {
      next({ path: '/home' })
    } else {

      const menuStore = useMenuStore()
      // 检查并确保菜单数据已加载
      if (!menuStore.getMenuList.length) {
        await menuStore.initMenu()
      }
      if (to.meta.title) {
        tabStore.addTab(to)
      }
      next()
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 在免登录白名单中,直接进入
      next()
      if (to.meta.title) {
        tabStore.addTab(to)
      }
    } else {
      // 其他没有访问权限的页面将重定向到登录页面
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router 