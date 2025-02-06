<template>
  <div class="vertical-nav">
    <!-- Logo区域 -->
    <div class="logo-container">
      <img src="@/assets/logo.png" alt="logo" class="logo" />
    </div>
    <!-- 添加分割线 -->
    <div class="nav-divider"></div>

    <!-- 导航项 -->
    <div class="nav-list">
      <div 
        class="nav-item" 
        v-for="(item, index) in navItems" 
        :key="index"
        :class="{ active: activeNavIndex === index }"
        @click="handleNavClick(index)"
      >
        <a-tooltip :title="item.title" placement="right">
          <div class="nav-inner">
            <div class="nav-content">
              <div class="icon-wrapper">
                <component :is="item.icon" />
              </div>
              <!-- <div class="nav-text">{{ formatTitle(item.title) }}</div> -->
            </div>
          </div>
        </a-tooltip>
      </div>
    </div>
    <!-- 主题切换按钮 -->
    <div class="theme-switch">
      <a-tooltip :title="isDarkTheme ? '切换亮色主题' : '切换暗色主题'" placement="right">
        <div class="switch-inner" @click="toggleTheme">
          <component :is="isDarkTheme ? BulbFilled : BulbOutlined" />
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { menuConfig } from '@/config/menu'
import { useMenuStore } from '@/stores/menu'
import { BulbOutlined, BulbFilled } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const menuStore = useMenuStore()

const activeNavIndex = computed(() => menuStore.activeNavIndex)

const isDarkTheme = ref(false)

// 只获取一级菜单项
const navItems = menuConfig.map(item => ({
  icon: item.icon,
  title: item.title,
  path: item.path || item.children?.[0]?.path // 如果没有path,使用第一个子菜单的path
}))

const handleNavClick = (index: number) => {
  menuStore.setActiveNavIndex(index)
  const targetPath = navItems[index].path
  if (targetPath) {
    router.push(targetPath)
  }
}

const formatTitle = (title: string) => {
  return title.length > 3 ? title.slice(0, 2) : title;
};

// 监听路由变化，更新activeNavIndex
watch(
  () => route.path,
  (newPath) => {
    const index = navItems.findIndex(item => newPath.startsWith(item.path))
    if (index !== -1) {
      menuStore.setActiveNavIndex(index)
    }
  },
  { immediate: true }
)

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
}
</script>

<style scoped>
.vertical-nav {
  width: 50px;
  height: 100%;
  background-color: var(--menu-bg-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  /* width: 32px; */
  height: 32px;
}

.nav-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-item {
  height: 35px;
  width: 35px;
  margin-top: 12px;
  cursor: pointer;
  position: relative;
}

.nav-inner {
  height: 100%;
  border-radius: 6px;
  backdrop-filter: blur(2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 2px 0;
}

.icon-wrapper {
  font-size: 16px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: var(--menu-text-color);
}

.nav-text {
  font-size: 10px;
  color: var(--menu-text-color);
  margin-top: 2px;
  transition: all 0.3s;
  text-align: center;
  width: 100%;
  line-height: 1;
}

.nav-item:hover .nav-inner {
  background-color: var(--menu-hover-bg-color);
}

.nav-item:hover:not(.active) .icon-wrapper,
.nav-item:hover:not(.active) .nav-text {
  color: var(--menu-text-color);
}


.nav-item.active .nav-inner {
  background-color: var(--menu-active-bg-color);
}

.nav-item.active .icon-wrapper,
.nav-item.active .nav-text {
  color:  var(--menu-active-text-color);
}

.nav-divider {
  height: 1px;
  background-color: var(--border-color);
}


.theme-switch {
  padding: 8px 4px 12px;
  display: flex;
  justify-content: center;
}

.switch-inner {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.3s;
}

.switch-inner:hover {
  background-color: var(--menu-hover-bg-color);
  color: var(--text-primary);
}

.switch-inner .anticon {
  font-size: 16px;
  transition: transform 0.3s;
}

.switch-inner:hover .anticon {
  transform: scale(1.1);
}
</style> 