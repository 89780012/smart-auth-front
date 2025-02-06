<template>
  <div class="statistics-container">
    <!-- 顶部统计卡片 -->
    <a-row :gutter="[16, 16]" class="data-cards">
      <a-col :xs="24" :sm="12" :md="6" v-for="card in statisticsCards" :key="card.title">
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
            <div class="footer">{{ card.compare }}</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="chart-container">
      <!-- 左侧趋势图 -->
      <a-col :span="16">
        <a-card :bordered="false" title="访问趋势" class="chart-card">
          <div ref="trendChartRef" class="chart"></div>
        </a-card>
      </a-col>
      
      <!-- 右侧饼图 -->
      <a-col :span="8">
        <a-card :bordered="false" title="用户分布" class="chart-card">
          <div ref="pieChartRef" class="chart"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据表格 -->
    <a-card :bordered="false" title="详细数据" class="table-card">
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'trend'">
            <span :class="record.trend > 0 ? 'up' : 'down'">
              {{ record.trend > 0 ? '+' : '' }}{{ record.trend }}%
            </span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import * as echarts from 'echarts'
import { 
  UserOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons-vue'

// 统计卡片数据
const statisticsCards = ref([
  {
    title: '今日访问',
    number: '2,851',
    icon: EyeOutlined,
    type: 'primary',
    trend: 12.5,
    compare: '较昨日'
  },
  {
    title: '新增用户',
    number: '321',
    icon: UserOutlined,
    type: 'success',
    trend: 23.4,
    compare: '较上周'
  },
  {
    title: '活跃用户',
    number: '1,283',
    icon: TeamOutlined,
    type: 'warning',
    trend: -5.2,
    compare: '较上月'
  },
  {
    title: '转化率',
    number: '32.8%',
    icon: ShoppingCartOutlined,
    type: 'danger',
    trend: 8.4,
    compare: '较平均'
  }
])

// 图表实例
const trendChartRef = ref()
const pieChartRef = ref()
let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null

// 初始化趋势图
const initTrendChart = () => {
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['访问量', '用户量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        smooth: true,
        data: [820, 932, 901, 934, 1290, 1330, 1320]
      },
      {
        name: '用户量',
        type: 'line',
        smooth: true,
        data: [420, 532, 501, 534, 690, 730, 620]
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  pieChart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '企业用户' },
          { value: 735, name: '个人用户' },
          { value: 580, name: 'VIP用户' },
          { value: 484, name: '游客' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  pieChart.setOption(option)
}

// 表格配置
const columns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '访问量', dataIndex: 'visits', key: 'visits' },
  { title: '用户数', dataIndex: 'users', key: 'users' },
  { title: '转化率', dataIndex: 'conversion', key: 'conversion' },
  { title: '环比', dataIndex: 'trend', key: 'trend' }
]

const tableData = ref([
  { 
    key: '1',
    date: '2024-03-01',
    visits: 2851,
    users: 321,
    conversion: '32.8%',
    trend: 12.5
  },
  {
    key: '2', 
    date: '2024-03-02',
    visits: 2923,
    users: 389,
    conversion: '35.2%',
    trend: -5.2
  },
  // 更多数据...
])

// 分页配置
const pagination = computed<TablePaginationConfig>(() => ({
  total: 100,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`
}))

// 表格变化处理
const handleTableChange = (pag: TablePaginationConfig) => {
  console.log('分页变化:', pag)
  // 这里处理分页逻辑
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
}

onMounted(() => {
  initTrendChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

</script>

<style scoped>
.statistics-container {
  padding: 16px;
  min-height: 100%;
}

/* 复用 dashboard/index.vue 的卡片样式 */
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

/* 图表样式 */
.chart-container {
  margin-top: 16px;
}

.chart-card {
  border-radius: 8px;
}

.chart {
  height: 400px;
}

/* 表格样式 */
.table-card {
  margin-top: 16px;
  border-radius: 8px;
}

.up {
  color: #52c41a;
}

.down {
  color: #f5222d;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-container .ant-col {
    width: 100%;
  }
}
</style>
