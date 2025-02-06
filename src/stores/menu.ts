import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCurrentMenuConfig, loadDynamicMenu } from '@/config/dynamicMenu'
import { MenuConfig } from '@/config/menu'
export const useMenuStore = defineStore('menu', () => {
  // 当前激活的一级菜单索引
  const activeNavIndex = ref(0)
  
  // 菜单列表数据
  const menuList = ref<MenuConfig[]>([])
  
  // 获取当前激活的一级菜单项
  const currentNavItem = computed(() => getCurrentMenuConfig()[activeNavIndex.value])
  
  // 获取当前二级菜单列表
  const currentSubMenus = computed(() => currentNavItem.value?.children || [])
  
  // 获取菜单列表
  const getMenuList = computed(() => menuList.value)
  
  // 设置当前激活的导航索引
  function setActiveNavIndex(index: number) {
    activeNavIndex.value = index
  }

  // 根据路径设置当前导航
  function setCurrentNavByPath(path: string) {
    const menuConfig = getCurrentMenuConfig()
    const navItem = menuConfig.find(item => item.path === path)
    if (navItem) {
      const index = menuConfig.findIndex(item => item.path === path)
      if (index !== -1) {
        activeNavIndex.value = index
      }
    }
  }

  // 初始化菜单
  async function initMenu() {
    const menus = await loadDynamicMenu()
    menuList.value = menus // 保存菜单数据到store
  }

  return {
    activeNavIndex,
    currentNavItem,
    currentSubMenus,
    getMenuList, // 导出getter
    setActiveNavIndex,
    setCurrentNavByPath,
    initMenu
  }
}) 