<template>
  <div class="main-layout">
    <div class="content-wrapper">
      <!-- 左侧垂直导航栏 -->
      <VerticalNav class="vertical-nav" />
      
      <!-- 根据路由 meta 判断显示不同布局 -->
      <template v-if="route.meta?.layout === 'full'">
        <div class="full-content">
          <!-- 顶部导航栏 -->
          <Navbar class="navbar" />
          <!-- 内容区域 -->
          <div class="full-page-content">
            <router-view @close-tab="handleCloseTab"></router-view>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="default-content">
          <!-- 菜单设置区域 -->
          <Sidebar class="sidebar" />
          
          <div class="main-content">
            <!-- 顶部导航栏 -->
            <Navbar class="navbar" />
            
            <!-- 标签页 -->
            <TabBar ref="tabBarRef" class="tab-bar" />
            
            <!-- 页面内容 -->
            <div class="page-content">
              <div class="content-scroll">
                <router-view v-slot="{ Component }">
                  <keep-alive>
                    <component :is="Component" @close-tab="handleCloseTab" />
                  </keep-alive>
                </router-view>
              </div>
              <div class="beian-footer">
                <span>公安备案号：xxx</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabStore } from '@/stores/tabs'
import VerticalNav from './components/VerticalNav.vue'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import TabBar from './components/TabBar.vue'

const route = useRoute()
const router = useRouter()
const tabsStore = useTabStore()
const tabBarRef = ref()

// 处理关闭标签页
const handleCloseTab = (path: string) => {
  // 使用 store 中的方法关闭标签页
  tabsStore.removeTab(path)
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  background-color: var(--bg-color);
}

.content-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.vertical-nav {
  flex-shrink: 0;
}

.full-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
}

.full-page-content {
  flex: 1;
  overflow: auto;
  width: 100%;
  /* padding: 10px; */
}

.default-content {
  flex: 1;
  display: flex;
  width: 0;
  min-width: 0;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-color);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 0;
  min-width: 0;
}

.navbar {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
}

.tab-bar {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-color);
  width: 100%;
}

.content-scroll {
  flex: 1;
  padding: 0;
  overflow: auto;
  width: 100%;
  /* padding: 10px; */
}

.beian-footer {
  flex-shrink: 0;
  height: 25px;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-primary);
}
</style> 