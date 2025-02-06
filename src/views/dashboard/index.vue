<template>
  <div class="dashboard-container full-width">
    <!-- 顶部轮播图 -->
    <a-card :bordered="false" class="carousel-card">
      <div class="recent-visits">
        <div class="recent-header">
          <span class="recent-title">最近访问</span>
          <div class="recent-list">
            <div 
              v-for="menu in recentVisits" 
              :key="menu.key" 
              class="recent-item"
              @click="handleNavClick(menu)"
            >
              <component :is="menu.icon" class="recent-icon"/>
              <span class="recent-name">{{ menu.title }}</span>
            </div>
          </div>
        </div>
      </div>
      <a-carousel autoplay>
        <div v-for="banner in banners" :key="banner.id" class="carousel-item">
          <img :src="banner.image" :alt="banner.title">
        </div>
      </a-carousel>
    </a-card>

    <!-- 顶部数据卡片 -->
    <a-row :gutter="[16, 16]" class="data-cards">
      <a-col :xs="24" :sm="12" :md="6" v-for="card in cards" :key="card.title">
        <a-card :bordered="false" class="data-card" :class="card.type">
          <div class="card-content">
            <div class="meta">
              <span class="title">{{ card.title }}</span>
              <component :is="card.icon" class="icon"/>
            </div>
            <div class="data">
              <span class="number">{{ card.number }}</span>
              <span class="trend" :class="card.trend > 0 ? 'up' : 'down'">
                {{ Math.abs(card.trend) }}%
                <component :is="card.trend > 0 ? 'rise-outlined' : 'fall-outlined'" />
              </span>
            </div>
            <div class="footer">对比昨日</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷导航区域 -->
    <a-row :gutter="[16, 16]" class="nav-container">
      <a-col :span="24">
        <a-card :bordered="false" title="功能导航" class="nav-card">
          <!-- 遍历一级菜单 -->
          <div v-for="menu in mainMenus" :key="menu.key" class="menu-section">
            <div class="menu-category">{{ menu.title }}</div>
            <a-row :gutter="[16, 16]">
              <!-- 显示当前一级菜单本身 -->
              <!-- <a-col :xs="24" :sm="12" :md="8" :lg="6">
                <div class="nav-item" @click="handleNavClick(menu)">
                  <component :is="menu.icon" class="nav-icon"/>
                  <span class="nav-title">{{ menu.title }}</span>
                </div>
              </a-col> -->
              <!-- 递归显示所有子菜单 -->
              <template v-if="menu.children && menu.children.length">
                <a-col 
                  :xs="24" 
                  :sm="12" 
                  :md="8" 
                  :lg="6" 
                  v-for="submenu in getAllSubMenus(menu.children)" 
                  :key="submenu.key"
                >
                  <div class="nav-item" @click="handleNavClick(submenu)">
                    <component :is="submenu.icon" class="nav-icon"/>
                    <span class="nav-title">{{ submenu.title }}</span>
                  </div>
                </a-col>
              </template>
            </a-row>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 底部数据表格和活动列表 -->
    <!-- <a-row :gutter="[16, 16]" class="bottom-container">
      <a-col :span="16">
        <a-card :bordered="false" title="最近交易" class="table-card">
          <a-table :columns="columns" :data-source="tableData" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.statusColor">{{ record.status }}</a-tag>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      
      <a-col :span="8">
        <a-card :bordered="false" title="系统动态" class="activity-card">
          <a-timeline>
            <a-timeline-item v-for="item in activities" :key="item.id" :color="item.color">
              <template #dot>
                <component :is="item.icon" style="font-size: 16px" />
              </template>
              <div class="activity-item">
                <div class="activity-title">{{ item.title }}</div>
                <div class="activity-time">{{ item.time }}</div>
              </div>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { menuConfig } from '@/config/menu'
import { 
  UserOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

// 获取菜单(过滤掉 dashboard 和 hidden 为 true 的菜单)
const mainMenus = computed(() => {
  const filterHiddenMenus = (menus: any[]) => {
    return menus.filter(menu => {
      // 过滤掉 hidden 为 true 的菜单
      if (menu.hidden) {
        return false
      }
      // 递归处理子菜单
      if (menu.children && menu.children.length) {
        menu.children = filterHiddenMenus(menu.children)
      }
      return true
    })
  }
  
  return filterHiddenMenus(menuConfig.filter(menu => menu.key !== '/home/dashboard'))
})

// 递归获取所有子菜单
const getAllSubMenus = (menus: any[]) => {
  const result: any[] = []
  const traverse = (items: any[]) => {
    items.forEach(item => {
      if (!item.hidden) {
        result.push(item)
        if (item.children && item.children.length) {
          traverse(item.children)
        }
      }
    })
  }
  traverse(menus)
  return result
}

// 最近访问记录
const recentVisits = ref<any[]>([])

// 添加图标映射对象
const iconMap: Record<string, any> = {
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined
}

// 修改从本地存储加载最近访问记录的逻辑
onMounted(() => {
  const stored = localStorage.getItem('recentVisits')
  if (stored) {
    const parsedVisits = JSON.parse(stored)
    // 恢复图标组件引用
    recentVisits.value = parsedVisits.map((visit: any) => ({
      ...visit,
      icon: iconMap[visit.iconName] // 使用图标名称获取对应的组件
    }))
  }
})

// 更新处理导航点击的方法
const handleNavClick = (menu: any) => {
  // 更新最近访问记录
  updateRecentVisits(menu)
  
  // 原有的路由跳转逻辑
  if (menu.redirect) {
    router.push(menu.redirect)
  } else if (menu.path) {
    router.push(menu.path)
  }
}

// 修改更新最近访问记录的方法
const updateRecentVisits = (menu: any) => {
  // 获取图标组件的名称
  const iconName = Object.keys(iconMap).find(key => iconMap[key] === menu.icon) || 'HomeOutlined'
  
  // 创建新的访问记录
  const newVisit = {
    key: menu.key,
    title: menu.title,
    icon: menu.icon,
    iconName: iconName, // 保存图标名称用于序列化
    path: menu.path,
    redirect: menu.redirect
  }

  // 从现有列表中移除相同的项（如果存在）
  const filtered = recentVisits.value.filter(item => item.key !== menu.key)
  
  // 将新访问添加到开头
  filtered.unshift(newVisit)
  
  // 只保留最近的5个访问记录
  recentVisits.value = filtered.slice(0, 5)
  
  // 保存到本地存储（只保存必要的数据）
  const storageData = recentVisits.value.map(visit => ({
    key: visit.key,
    title: visit.title,
    iconName: visit.iconName,
    path: visit.path,
    redirect: visit.redirect
  }))
  
  localStorage.setItem('recentVisits', JSON.stringify(storageData))
}

// 顶部卡片数据
const cards = ref([
  {
    title: '总用户数',
    number: '12,831',
    icon: UserOutlined,
    type: 'primary',
    trend: 15.4
  },
  {
    title: '总销售额',
    number: '¥43,296',
    icon: DollarOutlined,
    type: 'success',
    trend: 8.2
  },
  {
    title: '订单总数',
    number: '1,483',
    icon: ShoppingCartOutlined,
    type: 'warning',
    trend: -2.4
  },
  {
    title: '任务完成率',
    number: '96.8%',
    icon: ProfileOutlined,
    type: 'danger',
    trend: 3.1
  }
])

// 表格配置
const columns = [
  { title: '订单编号', dataIndex: 'id', key: 'id' },
  { title: '客户名称', dataIndex: 'customer', key: 'customer' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '时间', dataIndex: 'time', key: 'time' }
]

// const tableData = ref([
//   { id: 'DD20240301001', customer: '张三', amount: '¥2,341', status: '已完成', statusColor: 'success', time: '2024-03-01 10:23' },
//   { id: 'DD20240301002', customer: '李四', amount: '¥1,234', status: '处理中', statusColor: 'processing', time: '2024-03-01 09:12' },
//   { id: 'DD20240301003', customer: '王五', amount: '¥5,678', status: '已完成', statusColor: 'success', time: '2024-03-01 08:45' },
//   { id: 'DD20240301004', customer: '赵六', amount: '¥891', status: '待支付', statusColor: 'warning', time: '2024-03-01 08:23' }
// ])

// 活动列表
const activities = ref([
  { id: 1, title: '系统更新完成', time: '10分钟前', icon: CheckCircleOutlined, color: 'green' },
  { id: 2, title: '新用户注册: 张三', time: '30分钟前', icon: UserOutlined, color: 'blue' },
  { id: 3, title: '待处理订单提醒', time: '1小时前', icon: ClockCircleOutlined, color: 'orange' },
  { id: 4, title: '收到新的反馈', time: '2小时前', icon: MessageOutlined, color: 'purple' }
])

// 轮播图数据
const banners = ref([
  {
    id: 1,
    title: '新品上市',
    desc: '2024春季新品系列重磅来袭',
    image: 'https://www.xhdzx.com/u/20210825/79ca97b3857846a3ae2a12bdcd03f7eb.png'
  },
  {
    id: 2, 
    title: '限时特惠',
    desc: '精选商品低至5折',
    image: 'https://www.xhdzx.com/u/20210825/79ca97b3857846a3ae2a12bdcd03f7eb.png'
  },
  {
    id: 3,
    title: '会员专享',
    desc: '会员专享权益升级',
    image: 'https://www.xhdzx.com/u/20210825/79ca97b3857846a3ae2a12bdcd03f7eb.png'
  }
])
</script>

<style scoped>
.dashboard-container {
  min-height: 100%;
  width: 100%;
  padding: 16px;
}

/* 轮播图样式 */
.carousel-card {
  position: relative;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
}

.carousel-card :deep(.ant-card-body) {
  padding: 0;
}

.carousel-card :deep(.ant-carousel) {
  width: 100%;
  height: 100%;
}

.recent-visits {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 10;
  padding: 12px 24px;
  background: transparent;
  width: 100%;
  backdrop-filter: none;
}

.recent-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.recent-title {
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.recent-list {
  display: flex;
  flex-direction: row;
  gap: 12px;
  overflow-x: auto;
  flex: 1;
  padding: 4px;
}

.recent-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.recent-item:nth-child(3n+1) .recent-icon {
  color: rgba(255, 255, 255, 0.95);
}

.recent-item:nth-child(3n+2) .recent-icon {
  color: rgba(255, 255, 255, 0.9);
}

.recent-item:nth-child(3n+3) .recent-icon {
  color: rgba(255, 255, 255, 0.85);
}

.recent-item:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.recent-item:hover .recent-icon {
  transform: scale(1.1);
}

.recent-icon {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 6px;
  transition: all 0.3s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.recent-name {
  color: rgba(255, 255, 255, 0.95);
  font-size: 12px;
  text-align: center;
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  height: 280px;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-content {
  display: none;
}

.data-cards .data-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.data-cards .data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.data-cards .data-card.primary .icon { 
  color: #1890ff; 
}

.data-cards .data-card.success .icon { 
  color: #52c41a; 
}

.data-cards .data-card.warning .icon { 
  color: #faad14; 
}

.data-cards .data-card.danger .icon { 
  color: #f5222d; 
}

.data-cards .data-card .card-content .meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.data-cards .data-card .card-content .meta .title {
  font-size: 14px;
  color: var(--text-secondary);
}

.data-cards .data-card .card-content .meta .icon {
  font-size: 24px;
}

.data-cards .data-card .card-content .data {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.data-cards .data-card .card-content .data .number {
  font-size: 24px;
  font-weight: 500;
  margin-right: 16px;
}

.data-cards .data-card .card-content .data .trend {
  font-size: 14px;
}

.data-cards .data-card .card-content .data .trend.up { 
  color: #52c41a; 
}

.data-cards .data-card .card-content .data .trend.down { 
  color: #f5222d; 
}

.data-cards .data-card .card-content .footer {
  font-size: 12px;
  color: var(--text-secondary);
}

.charts-container {
  margin-top: 24px;
}

.charts-container .chart-card {
  border-radius: 8px;
}

.charts-container .chart-card .chart {
  height: 300px;
}

.bottom-container {
  margin-top: 24px;
}

.bottom-container .table-card,
.bottom-container .activity-card {
  border-radius: 8px;
}

.bottom-container .activity-item .activity-title {
  font-size: 14px;
  color: rgba(0,0,0,0.85);
}

.bottom-container .activity-item .activity-time {
  font-size: 12px;
  color: rgba(0,0,0,0.45);
  margin-top: 4px;
}

/* 导航样式 */
.nav-container {
  margin-top: 24px;
}

.nav-card {
  border-radius: 8px;
}

.menu-section {
  margin-bottom: 24px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.menu-category {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid #1890ff;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--primary-color);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-item:hover {
  background: var(--menu-hover-bg-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.09);
}

.nav-icon {
  font-size: 20px;
  color: #1890ff;
  margin-right: 12px;
}

.nav-title {
  font-size: 14px;
  color: var(--text-primary);
  flex: 1;
}

/* 自定义滚动条样式 */
.recent-list::-webkit-scrollbar {
  display: none;
}

.recent-list {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style> 