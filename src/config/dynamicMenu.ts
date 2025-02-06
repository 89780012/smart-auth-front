import * as Icons from '@ant-design/icons-vue'
import { MenuConfig } from './menu'
// 创建动态菜单配置存储
import { ref } from 'vue'
import { getUserMenu } from '@/api/user'
import { menuConfig as staticMenuConfig } from './menu'
import { useUserStore } from '@/stores/user'

// 菜单来源类型
export type MenuSourceType = 'config' | 'api'
/** 菜单控制 */
const menuSource = ref<MenuSourceType>('config')   //默认值
const dynamicMenuConfig = ref<MenuConfig[]>([])
// 资源项接口
export interface ResourceItem {
  resourceId: number
  resourceName: string
  resourceType: string
  parentId: number
  path: string
  component: string
  icon: string
  layout: 'default' | 'full'
  sort_order: number
  hidden: number
  redirect: string
  isActive: number
  createdAt: string
  updatedAt: string
}

// 将扁平资源列表转换为树形结构
export function buildMenuTree(resources: ResourceItem[]): MenuConfig[] {
  // 按照 sort_order 排序
  const sortedResources = [...resources].sort((a, b) => a.sort_order - b.sort_order)
  
  // 构建父子关系映射
  const menuMap = new Map<number, MenuConfig>()
  
  // 转换资源项为菜单配置
  function resourceToMenu(item: ResourceItem): MenuConfig {
    // 动态获取图标组件
    const icon = (Icons as any)[item.icon]
    
    return {
      key: item.path,
      title: item.resourceName,
      icon: icon,
      path: item.path,
      component: item.component ? () => import(/* @vite-ignore */ item.component) : undefined,
      redirect: item.redirect || undefined,
      layout: item.layout,
      hidden: item.hidden === 1,
      children: []
    }
  }

  // 第一次遍历:创建所有菜单项
  sortedResources.forEach(item => {
    menuMap.set(item.resourceId, resourceToMenu(item))
  })

  // 第二次遍历:建立父子关系
  const result: MenuConfig[] = []
  sortedResources.forEach(item => {
    const menuItem = menuMap.get(item.resourceId)
    if (item.parentId === 0) {
      // 顶级菜单
      result.push(menuItem!)
    } else {
      // 子菜单
      const parentMenu = menuMap.get(item.parentId)
      if (parentMenu) {
        if (!parentMenu.children) {
          parentMenu.children = []
        }
        parentMenu.children.push(menuItem!)
      }
    }
  })
  return result
}

// 加载动态菜单
export async function loadDynamicMenu() {
  if (menuSource.value === 'api') {
    try {
      const userStore = useUserStore()
      const currentUser = userStore.getUserInfo

      const res = await getUserMenu({userId: currentUser.userId})
      if (res.code === 200 && Array.isArray(res.data)) {
        dynamicMenuConfig.value = buildMenuTree(res.data)
        console.log(dynamicMenuConfig.value)
      }
    } catch (error) {
      console.error('加载动态菜单失败:', error)
      // 加载失败时使用静态配置
      dynamicMenuConfig.value = staticMenuConfig
    }
  } else {
    dynamicMenuConfig.value = staticMenuConfig
  }
  return dynamicMenuConfig.value
}

// 切换菜单来源
export function toggleMenuSource(source: MenuSourceType) {
  menuSource.value = source
  return loadDynamicMenu()
}

// 获取当前菜单配置
export function getCurrentMenuConfig() {
  return dynamicMenuConfig.value
}