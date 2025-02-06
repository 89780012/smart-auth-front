<template>
  <div class="strategy-container">
    <div class="strategy-header">
      <h2>量化策略</h2>
      <a-button type="primary" @click="createStrategy">
        <template #icon><plus-outlined /></template>
        创建策略
      </a-button>
    </div>
    
    <a-table
      :columns="columns"
      :data-source="strategies"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
      size="middle"
      bordered
    >
      <!-- 策略名称列 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="name-cell">
            <span>{{ record.name }}</span>
            <a-tooltip :title="record.description">
              <info-circle-outlined class="info-icon" />
            </a-tooltip>
          </div>
        </template>
        
        <!-- 状态列 -->
        <template v-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        
        <!-- 收益率列 -->
        <template v-if="column.key === 'returns'">
          <span :class="record.returns >= 0 ? 'positive' : 'negative'">
            {{ record.returns }}%
          </span>
        </template>
        
        <!-- 操作列 -->
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button 
              :type="record.status === 'running' ? 'default' : 'primary'"
              size="small"
              @click="toggleStrategy(record)"
            >
              {{ record.status === 'running' ? '停止' : '启动' }}
            </a-button>
            <a-button type="link" size="small" @click="editStrategy(record)">编辑</a-button>
            <a-button type="link" size="small" @click="viewDetails(record)">详情</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const router = useRouter()
interface Strategy {
  id: number
  name: string
  description: string
  status: 'running' | 'stopped' | 'error'
  returns: number
  sharpe: number
  maxDrawdown: number
  runDays: number
  updateTime: string
}

const columns = [
  {
    title: '策略名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '收益率',
    dataIndex: 'returns',
    key: 'returns',
    width: 100,
    sorter: (a: Strategy, b: Strategy) => a.returns - b.returns,
  },
  {
    title: '夏普比率',
    dataIndex: 'sharpe',
    key: 'sharpe',
    width: 100,
    sorter: (a: Strategy, b: Strategy) => a.sharpe - b.sharpe,
  },
  {
    title: '最大回撤',
    dataIndex: 'maxDrawdown',
    key: 'maxDrawdown',
    width: 100,
  },
  {
    title: '运行天数',
    dataIndex: 'runDays',
    key: 'runDays',
    width: 100,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 160,
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
]

const loading = ref(false)
const strategies = ref<Strategy[]>([
  {
    id: 1,
    name: '双均线策略',
    description: '基于快慢均线交叉的趋势跟踪策略',
    status: 'running',
    returns: 15.6,
    sharpe: 1.8,
    maxDrawdown: -8.5,
    runDays: 30,
    updateTime: '2024-03-20 15:30:00'
  },
  {
    id: 2,
    name: '网格交易策略',
    description: '在价格区间内进行高抛低吸的网格策略',
    status: 'stopped',
    returns: 8.3,
    sharpe: 1.2,
    maxDrawdown: -5.2,
    runDays: 15,
    updateTime: '2024-03-20 15:30:00'
  },
  {
    id: 3,
    name: '波动率策略',
    description: '基于波动率指标的择时交易策略',
    status: 'error',
    returns: -2.1,
    sharpe: 0.5,
    maxDrawdown: -12.4,
    runDays: 7,
    updateTime: '2024-03-20 15:30:00'
  }
])

const getStatusColor = (status: string) => {
  const colors = {
    running: 'green',
    stopped: 'default',
    error: 'red'
  }
  return colors[status]
}

const getStatusText = (status: string) => {
  const texts = {
    running: '运行中',
    stopped: '已停止',
    error: '异常'
  }
  return texts[status]
}

const createStrategy = () => {
  // TODO: 跳转到策略创建页面
  console.log('创建新策略')
}

const toggleStrategy = (strategy: Strategy) => {
  const action = strategy.status === 'running' ? '停止' : '启动'
  message.success(`${action}策略: ${strategy.name}`)
  strategy.status = strategy.status === 'running' ? 'stopped' : 'running'
}

const editStrategy = (strategy: Strategy) => {
  // TODO: 跳转到策略编辑页面
  console.log('编辑策略:', strategy)
  router.push("/strategy/edit")
}

const viewDetails = (strategy: Strategy) => {
  // TODO: 跳转到策略详情页面
  console.log('查看策略详情:', strategy)
  router.push("/strategy/detail")
}
</script>

<style scoped>
.strategy-container {
  padding: 24px;
  background: #fff;
  min-height: 100%;
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.strategy-header h2 {
  margin: 0;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: #999;
  cursor: pointer;
}

.info-icon:hover {
  color: #666;
}

.positive {
  color: #52c41a;
}

.negative {
  color: #ff4d4f;
}

:deep(.ant-table-cell) {
  padding: 8px 16px !important;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 500;
}
</style>
