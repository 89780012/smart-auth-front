import { defineStore } from 'pinia'

export interface TabItem {
  title: string
  path: string
  name: string
}

interface TabState {
  tabs: TabItem[]
}

export const useTabStore = defineStore({
  id: 'tab',
  state: (): TabState => ({
    tabs: []
  }),
  
  actions: {
    addTab(tab: TabItem) {
      if (!this.tabs.find(item => item.path === tab.path)) {
        this.tabs.push(tab)
      }
    },
    
    closeTab(tab: TabItem) {
      const index = this.tabs.findIndex(item => item.path === tab.path)
      if (index > -1) {
        this.tabs.splice(index, 1)
      }
    }
  }
}) 