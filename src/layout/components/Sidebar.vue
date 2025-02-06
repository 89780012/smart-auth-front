<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <span class="header-title">菜单设置</span>
      <a-button
        type="text"
        class="collapse-btn"
        @click="toggleCollapse"
      >
        <MenuFoldOutlined v-if="!isCollapsed" />
        <MenuUnfoldOutlined v-else />
      </a-button>
    </div>
    <div class="sidebar-content">
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="light"
        :inline-collapsed="isCollapsed"
        @select="onSelect"
      >
        <template v-for="item in filteredSubMenus" :key="item.key">
          <template v-if="!item.children || item.children.length === 0">
            <a-menu-item :key="item.path">
              <template #icon>
                <component :is="item.icon" v-if="item.icon" />
              </template>
              <span>{{ item.title }}</span>
            </a-menu-item>
          </template>
          <template v-else>
            <a-sub-menu :key="item.key">
              <template #icon>
                <component :is="item.icon" v-if="item.icon" />
              </template>
              <template #title>{{ item.title }}</template>
              <template v-for="child in item.children" :key="child.key">
                <a-menu-item>
                  <!-- <template #icon>
                    <component :is="child.icon" v-if="child.icon" />
                  </template> -->
                  <span>{{ child.title }}</span>
                </a-menu-item>
              </template>
            </a-sub-menu>
          </template>
        </template>
      </a-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()

const isCollapsed = ref(false)
const openKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])

// 从 store 获取当前导航信息
const currentNavItem = computed(() => menuStore.currentNavItem)
const currentSubMenus = computed(() => menuStore.currentSubMenus)

// 添加一个计算属性来过滤菜单
const filteredSubMenus = computed(() => {
  return currentSubMenus.value.map(item => {
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        // 过滤掉 hidden 为 true 的子菜单
        children: item.children.filter(child => !child.hidden)
      }
    }
    // 如果当前项 hidden 为 true 或者没有子菜单，返回原始项
    return item.hidden ? null : item
  }).filter(Boolean) // 过滤掉 null 项
})

// 根据当前路由自动展开对应的子菜单
const initOpenKeys = () => {
  const matched = route.matched
  const keys = matched.map(item => item.meta?.menuKey).filter(Boolean)
  openKeys.value = keys as string[]
}

// 初始化菜单状态
const initMenuState = () => {
  // 根据当前路由路径初始化菜单状态
  const currentPath = route.path
  const pathSegments = currentPath.split('/')
  if (pathSegments.length > 2) {
    // 如果是二级或更深层级的路由，需要设置对应的导航项
    const mainPath = `/${pathSegments[1]}`
    menuStore.setCurrentNavByPath(mainPath)
  }
  initOpenKeys()
}

// 监听路由变化,同步到selectedKeys
watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]
})

// 组件挂载时初始化
onMounted(() => {
  initMenuState()
  selectedKeys.value = [route.path] // 初始化selectedKeys
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  if (isCollapsed.value) {
    openKeys.value = []
  } else {
    initOpenKeys()
  }
}

const onSelect = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  height: 100%;
  background-color: var(--primary-color);
  border-right: 1px solid var(--border-color);
  box-shadow: 1px 0 0 0 var(--border-color);
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-container {
  box-sizing: border-box;
  height: 100%;
  border-right: 1px solid var(--border-color);
}

.sidebar-header {
  box-sizing: border-box;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  width: 100%;
}

.sidebar-content {
  box-sizing: border-box;
  height: calc(100% - 35px);
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

:deep(.ant-menu) {
  border-right: none !important;
}



.sidebar.collapsed {
  width: 50px;
  overflow: hidden;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 35px;
}

.collapse-btn {
  padding: 0 4px;
  font-size: 14px;
  color: var(--text-primary);
}

.collapsed {
  .header-title {
    display: none;
  }

  .sidebar-header {
    padding: 0;
    justify-content: center;
  }
  
  :deep(.ant-menu-item) {
    padding: 0 !important;
    text-align: center;
    min-width: 50px !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  :deep(.ant-menu-item .ant-menu-item-icon) {
    margin-right: 0;
    font-size: 16px;
  }

  :deep(.ant-menu-title-content) {
    display: none;
  }
}

:deep(.ant-menu-inline-collapsed) {
  width: 50px !important;
}

:deep(.ant-menu-inline-collapsed .ant-menu-item),
:deep(.ant-menu-inline-collapsed .ant-menu-submenu-title) {
  padding: 0 !important;
  min-width: 50px !important;
  width: 50px !important;
  overflow: hidden;
}

:deep(.ant-menu) {
  border-right: none;
}

:deep(.ant-menu-item) {
  margin: 0 !important;
  padding: 0 16px !important;
  border-radius: 0 !important;
  line-height: 40px !important;
  color: var(--text-primary);
  background-color: var(--menu-bg-color);
}

:deep(.ant-menu-inline .ant-menu-item) {
  width: 100% !important;
  margin: 0 !important;
}

:deep(.ant-menu-item-active) {
  background-color: var(--menu-hover-bg-color) !important;
  color: var(--menu-active-text-color) !important;
}


:deep(.ant-menu-item-selected) {
  background-color: var(--menu-active-bg-color) !important;
  border-right: 3px solid var(--menu-active-text-color) !important;
}

:deep(.ant-menu-submenu-title) {
  margin: 0 !important;
  padding: 0 16px !important;
  border-radius: 0 !important;
  line-height: 40px !important;
}


.collapsed {
  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    padding: 0 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    
    .anticon {
      margin: 0 !important;
      line-height: 40px !important;
    }
  }
  
  :deep(.ant-menu-submenu-title .ant-menu-title-content) {
    display: none;  /* 折叠时隐藏文字 */
  }
}

/* 调整子菜单项的缩进，使其与二级菜单文字对齐 */
:deep(.ant-menu-sub .ant-menu-item) {
  padding-left: 40px !important; 
}

/* 确保折叠状态下的样式正常 */
.collapsed {
  :deep(.ant-menu-sub .ant-menu-item),
  :deep(.ant-menu-sub .ant-menu-sub .ant-menu-item) {
    padding-left: 0 !important;
    text-align: center;
  }
}

.collapsed {
  :deep(.ant-menu-submenu-title) {
    padding: 0 !important;
    width: 50px !important;
    min-width: 50px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    overflow: hidden;
    
    .anticon {
      margin: 0 !important;
      line-height: 40px !important;
    }
  }
  
  :deep(.ant-menu-submenu-title .ant-menu-title-content) {
    display: none;  /* 折叠时隐藏文字 */
  }
}
</style> 