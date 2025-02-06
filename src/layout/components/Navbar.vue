<template>
  <div class="navbar">
    <div class="left">
      <a-breadcrumb>
        <template v-for="item in breadcrumbs" :key="item.path">
          <a-breadcrumb-item>
            <component v-if="item.icon" :is="item.icon" />
            <span style="margin-left: 4px">{{ item.title }}</span>
          </a-breadcrumb-item>
        </template>
      </a-breadcrumb>
    </div>
    
    <div class="right">
      <a-badge :dot="true" class="notification-badge">
        <BellOutlined class="notification-icon" @click="showDrawer"/>
      </a-badge>

      <a-dropdown>
        <span class="user-info">
          <a-avatar :size="28" src="https://xiaonuo.cc/upload/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240705141104.jpg" />
          <span class="username">管理员</span>
        </span>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="handleProfile">个人信息</a-menu-item>
            <a-menu-item @click="handleLogout">退出登录</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <a-drawer
        title="通知中心"
        placement="right"
        :visible="drawerVisible"
        @close="closeDrawer"
        width="380"
      >
        <template #extra>
          <a-space>
            <a-button type="link" size="small" @click="markAllRead">
              全部已读
            </a-button>
            <a-button type="link" size="small" @click="clearAll">
              清空
            </a-button>
          </a-space>
        </template>

        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="all" tab="全部">
            <div class="notification-list">
              <div 
                v-for="notice in notifications" 
                :key="notice.id" 
                class="notification-item"
                :class="{ 'unread': !notice.read }"
              >
                <div class="notification-icon-wrapper">
                  <InfoCircleOutlined v-if="notice.type === 'info'" class="type-icon info" />
                  <WarningOutlined v-if="notice.type === 'warning'" class="type-icon warning" />
                  <CheckCircleOutlined v-if="notice.type === 'success'" class="type-icon success" />
                </div>
                <div class="notification-content-wrapper">
                  <div class="notification-header">
                    <span class="notification-title">{{ notice.title }}</span>
                    <span class="notification-time">{{ notice.time }}</span>
                  </div>
                  <div class="notification-content">{{ notice.content }}</div>
                  <div class="notification-footer">
                    <a-space>
                      <a-button 
                        type="link" 
                        size="small"
                        @click="markRead(notice.id)"
                        v-if="!notice.read"
                      >
                        标记已读
                      </a-button>
                      <a-button 
                        type="link" 
                        size="small" 
                        @click="deleteNotice(notice.id)"
                      >
                        删除
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>
          <a-tab-pane key="unread" tab="未读">
            <!-- 未读消息列表 -->
          </a-tab-pane>
        </a-tabs>
      </a-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { menuConfig } from '@/config/menu'
import { useUserStore } from '@/stores/user'

import { 
  BellOutlined, 
  InfoCircleOutlined, 
  WarningOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons-vue'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 计算面包屑数据
const breadcrumbs = computed(() => {
  const path = route.path
  const result = []
  
  // 查找一级菜单
  const mainMenu = menuConfig.find(item => 
    path.startsWith(item.path) && item.path !== '/'
  )
  
  if (mainMenu) {
    result.push({
      title: mainMenu.title,
      path: mainMenu.path,
      icon: mainMenu.icon
    })
    
    // 查找二级菜单
    if (mainMenu.children) {
      const subMenu = mainMenu.children.find(item => 
        path === item.path
      )
      if (subMenu) {
        result.push({
          title: subMenu.title,
          path: subMenu.path,
          icon: subMenu.icon
        })
      }
    }
  }
  
  return result
})

const handleProfile = () => {
  // 处理个人信息
}

const handleLogout = async () => {
  await userStore.logout()
  router.push("/")
}

// 添加通知相关的数据和方法
const drawerVisible = ref(false)

// 添加 activeTab 状态
const activeTab = ref('all')

// 更新通知数据结构
const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: '系统通知',
    content: '您有一个新的任务待处理',
    time: '2024-03-19 10:30',
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: '待办提醒',
    content: '请及时更新项目进度报告',
    time: '2024-03-19 09:15',
    read: false
  },
  {
    id: 3,
    type: 'success',
    title: '消息提醒',
    content: '张三给您发送了一条消息',
    time: '2024-03-18 18:20',
    read: true
  }
])

// 添加通知操作方法
const markRead = (id: number) => {
  const notice = notifications.value.find(n => n.id === id)
  if (notice) {
    notice.read = true
  }
}

const markAllRead = () => {
  notifications.value.forEach(notice => {
    notice.read = true
  })
}

const deleteNotice = (id: number) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const clearAll = () => {
  notifications.value = []
}

const showDrawer = () => {
  drawerVisible.value = true
}

const closeDrawer = () => {
  drawerVisible.value = false
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 35px;
  padding: 0 16px;
  background-color: var(--primary-color);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.right {
  margin-left: auto;
  display: flex;
  align-items: center;
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.username {
  font-size: 14px;
  line-height: 1;
  color: var(--text-primary);
}

.ant-breadcrumb span + span {
  margin-left: 4px;
  color: var(--text-primary);
}

:deep(.ant-breadcrumb-separator) {
  color: var(--text-primary);
}

:deep(.ant-breadcrumb-link) {
  color: var(--text-primary);
}

ant-breadcrumb-link
.notification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 32px;
}


.notification-icon {
  font-size: 18px;
  cursor: pointer;
  color: var(--text-primary);
  padding: 4px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.notification-icon:hover {
  color: #1890ff;
  background: rgba(0,0,0,0.04);
  border-radius: 4px;
}

.notification-list {
  .notification-item {
    display: flex;
    padding: 16px;
    margin-top: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #fafafa;
    }
    
    &.unread {
      background-color: #f0f7ff;
    }
  }

  .notification-icon-wrapper {
    margin-right: 12px;
    padding-top: 4px;
  }

  .type-icon {
    font-size: 20px;
    
    &.info {
      color: #1890ff;
    }
    
    &.warning {
      color: #faad14;
    }
    
    &.success {
      color: #52c41a;
    }
  }

  .notification-content-wrapper {
    flex: 1;
  }

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .notification-title {
    font-weight: 500;
    font-size: 14px;
  }

  .notification-time {
    color: #999;
    font-size: 12px;
  }

  .notification-content {
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .notification-footer {
    display: flex;
    justify-content: flex-end;
  }
}

:deep(.ant-tabs-nav) {
  margin-bottom: 8px;
}

:deep(.ant-drawer-header) {
  padding: 16px 24px;
}

:deep(.ant-drawer-body) {
  padding: 0;
}

:deep(.ant-badge-dot) {
  top: 8px;
  right: 8px;
}
</style> 