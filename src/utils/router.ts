import { RouteRecordRaw } from 'vue-router'
import { MenuConfig } from '@/config/menu'
import MainLayout from '@/layout/MainLayout.vue'

export function generateRoutes(menuConfig: MenuConfig[]): RouteRecordRaw[] {
  const mainRoute: RouteRecordRaw = {
    path: '/',
    component: MainLayout,
    redirect: '/home/dashboard',
    children: []
  }

  function menuToRoute(menu: MenuConfig, parentLayout?: 'full' | 'default'): RouteRecordRaw {
    const route: RouteRecordRaw = {
      path: menu.path,
      name: menu.key,
      meta: {
        title: menu.title,
        layout: menu.layout || parentLayout || 'default'
      }
    }

    if (menu.component) {
      route.component = menu.component
    }

    if (menu.redirect) {
      route.redirect = menu.redirect
    }

    if (menu.children?.length) {
      route.children = menu.children.map(child => 
        menuToRoute(child, route.meta.layout as 'full' | 'default')
      )
    }

    return route
  }

  // 处理顶层路由
  menuConfig.forEach(menu => {
    const route = menuToRoute(menu)
    if (route.path.startsWith('/')) {
      route.path = route.path.slice(1)
    }
    mainRoute.children.push(route)
  })

  return [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/index.vue'),
      meta: { title: '登录' }
    },
    mainRoute
  ]
} 