import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export interface TabItem {
  key: string
  title: string
  path: string
  closable: boolean
  customTitle?: boolean  // 添加标记，表示是否使用自定义标题
}

export const useTabStore = defineStore('tabs', () => {
  const tabs = ref<TabItem[]>([
    { key: '/home/dashboard', title: '工作台', path: '/home/dashboard', closable: false }
  ])
  const activeTab = ref('/home/dashboard')

  const addTab = (route: RouteLocationNormalized) => {
    const { path, meta, query } = route
    const existingTab = tabs.value.find(tab => tab.path === path)
    
    // 构建标题
    let title = meta.title as string
    if (query.name) {
      title = `${query.name} - ${title}`
    }
    
    if (!existingTab) {
      tabs.value.push({
        key: path,
        title: title,
        path: path,
        closable: true
      })
    } else if (!existingTab.customTitle) {
      // 只有在不是自定义标题的情况下才更新
      existingTab.title = title
    }
    activeTab.value = path
  }

  const removeTab = (targetKey: string) => {
    const targetIndex = tabs.value.findIndex(tab => tab.key === targetKey)
    if (targetIndex === -1) return
    
    tabs.value.splice(targetIndex, 1)
    if (activeTab.value === targetKey) {
      activeTab.value = tabs.value[targetIndex - 1]?.key || tabs.value[0].key
    }
  }

  // 修改更新标题的方法
  const updateTabTitle = (path: string, title: string) => {
    const tab = tabs.value.find(tab => tab.path === path)
    if (tab) {
      tab.title = title
      tab.customTitle = true  // 标记为自定义标题
    }
  }

  return {
    tabs,
    activeTab,
    addTab,
    removeTab,
    updateTabTitle
  }
}) 