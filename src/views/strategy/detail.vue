<template>
  <div class="strategy-detail">
    <!-- 顶部信息区 -->
    <div class="detail-header">
      <div class="header-left">
        <h2>{{ strategy.name }}</h2>
        <a-tag :color="getStatusColor(strategy.status)">
          {{ getStatusText(strategy.status) }}
        </a-tag>
      </div>
      <div class="header-right">
        <a-space>
          <a-button 
            :type="strategy.status === 'running' ? 'default' : 'primary'"
            @click="toggleStrategy"
          >
            {{ strategy.status === 'running' ? '停止' : '启动' }}
          </a-button>
          <a-button @click="editStrategy">编辑策略</a-button>
          <a-button type="primary" danger @click="backToList">
            <template #icon><rollback-outlined /></template>
            返回
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="detail-content">
      <!-- 左侧主要内容 -->
      <div class="content-main">
        <!-- 核心指标区 -->
        <div class="metric-section">
          <div class="metric-row">
            <div v-for="metric in metrics" :key="metric.title" class="metric-item">
              <div class="metric-title">{{ metric.title }}</div>
              <div class="metric-value" :class="getValueStyle(metric)">
                <template v-if="metric.showArrow">
                  <arrow-up-outlined v-if="metric.value >= 0" />
                  <arrow-down-outlined v-else />
                </template>
                {{ metric.value }}{{ metric.suffix }}
              </div>
            </div>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-section">
          <div class="section-header">
            <div class="section-title">策略表现</div>
            <div class="section-actions">
              <a-radio-group v-model:value="chartType" size="small">
                <a-radio-button value="returns">收益率</a-radio-button>
                <a-radio-button value="assets">资金曲线</a-radio-button>
                <a-radio-button value="drawdown">回撤</a-radio-button>
              </a-radio-group>
              <a-divider type="vertical" />
              <a-radio-group v-model:value="chartPeriod" size="small">
                <a-radio-button value="1d">日</a-radio-button>
                <a-radio-button value="1w">周</a-radio-button>
                <a-radio-button value="1m">月</a-radio-button>
                <a-radio-button value="3m">季</a-radio-button>
                <a-radio-button value="all">全部</a-radio-button>
              </a-radio-group>
            </div>
          </div>
          <div class="chart-container" ref="chartRef"></div>
        </div>

        <!-- 底部Tab区域 -->
        <div class="tab-section">
          <a-tabs>
            <a-tab-pane key="positions" tab="当前持仓">
              <a-table
                :columns="positionColumns"
                :data-source="positions"
                :pagination="false"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'profit'">
                    <span :class="record.profit >= 0 ? 'positive' : 'negative'">
                      {{ record.profit }}%
                    </span>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="trades" tab="交易记录">
              <a-table
                :columns="tradeColumns"
                :data-source="trades"
                :pagination="{ pageSize: 10 }"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'returns'">
                    <span :class="record.returns >= 0 ? 'positive' : 'negative'">
                      {{ record.returns }}%
                    </span>
                  </template>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="logs" tab="运行日志">
              <div class="log-container" ref="logContainerRef">
                <div v-for="log in logs" :key="log.id" :class="['log-item', log.level]">
                  <span class="log-time">{{ log.time }}</span>
                  <span class="log-level">{{ log.level.toUpperCase() }}</span>
                  <span class="log-content">{{ log.content }}</span>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>

      <!-- 右侧状态面板 -->
      <div class="content-side">
        <!-- 策略配置 -->
        <div class="side-section">
          <div class="section-title">策略配置</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">策略类型</span>
              <span class="info-value">{{ strategy.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">交易品种</span>
              <span class="info-value">{{ strategy.symbol }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始时间</span>
              <span class="info-value">{{ strategy.startTime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">初始资金</span>
              <span class="info-value">{{ strategy.initialCapital }}</span>
            </div>
          </div>
        </div>

        <!-- 实时状态 -->
        <div class="side-section">
          <div class="section-title">实时状态</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">当前权益</span>
              <span class="info-value">{{ realtime.equity }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">可用资金</span>
              <span class="info-value">{{ realtime.available }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">持仓市值</span>
              <span class="info-value">{{ realtime.positionValue }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">风险度</span>
              <span class="info-value">
                <a-progress 
                  :percent="realtime.riskLevel" 
                  :status="getRiskStatus(realtime.riskLevel)"
                  size="small"
                />
              </span>
            </div>
          </div>
        </div>

        <!-- 性能统计 -->
        <div class="side-section">
          <div class="section-title">性能统计</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">年化收益</span>
              <span class="info-value positive">{{ performance.annualReturn }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">胜率</span>
              <span class="info-value">{{ performance.winRate }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">盈亏比</span>
              <span class="info-value">{{ performance.profitRatio }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最大连续盈利</span>
              <span class="info-value">{{ performance.maxContinuousProfit }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最大连续亏损</span>
              <span class="info-value">{{ performance.maxContinuousLoss }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Statistic } from 'ant-design-vue'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue'
import * as echarts from 'echarts'

const router = useRouter()
const chartRef = ref<HTMLElement | null>(null)
const logContainerRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 策略数据
const strategy = ref({
  id: 1,
  name: '双均线策略',
  status: 'running',
  totalReturns: 15.6,
  maxDrawdown: -8.5,
  sharpe: 1.8,
  tradeCount: 126,
  type: '双均线策略',
  symbol: 'BTC/USDT',
  startTime: '2024-03-01',
  initialCapital: 100000
})

// 图表周期
const chartPeriod = ref('1m')

// 交易记录列定义
const tradeColumns = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '交易类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '交易价格',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: '交易数量',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: '收益率',
    dataIndex: 'returns',
    key: 'returns',
  },
]

// 模拟交易数据
const trades = ref([
  {
    id: 1,
    time: '2024-03-20 14:30:00',
    type: '买入',
    price: 42156.8,
    amount: 0.1,
    returns: 0
  },
  {
    id: 2, 
    time: '2024-03-20 15:45:00',
    type: '卖出',
    price: 42356.5,
    amount: 0.1,
    returns: 0.47
  }
])

// 模拟日志数据
const logs = ref([
  {
    id: 1,
    time: '2024-03-20 14:30:00',
    level: 'info',
    content: '策略启动成功'
  },
  {
    id: 2,
    time: '2024-03-20 14:30:01',
    level: 'info',
    content: '检测到买入信号，价格: 42156.8'
  },
  {
    id: 3,
    time: '2024-03-20 14:30:01',
    level: 'success',
    content: '买入订单执行成功，数量: 0.1'
  }
])

// 核心指标数据
const metrics = ref([
  {
    title: '累计收益',
    value: 15.6,
    precision: 2,
    suffix: '%',
    showArrow: true
  },
  {
    title: '最大回撤',
    value: -8.5,
    precision: 2,
    suffix: '%'
  },
  {
    title: '夏普比率',
    value: 1.8,
    precision: 2
  },
  {
    title: '交易次数',
    value: 126
  }
])

// 持仓数据列定义
const positionColumns = [
  {
    title: '品种',
    dataIndex: 'symbol',
    key: 'symbol'
  },
  {
    title: '持仓量',
    dataIndex: 'amount',
    key: 'amount'
  },
  {
    title: '开仓均价',
    dataIndex: 'openPrice',
    key: 'openPrice'
  },
  {
    title: '当前价格',
    dataIndex: 'currentPrice',
    key: 'currentPrice'
  },
  {
    title: '浮动盈亏',
    dataIndex: 'profit',
    key: 'profit'
  }
]

// 实时状态数据
const realtime = ref({
  equity: 115600,
  available: 50000,
  positionValue: 65600,
  riskLevel: 56
})

// 性能统计数据
const performance = ref({
  annualReturn: 25.6,
  winRate: 65.8,
  profitRatio: 1.5,
  maxContinuousProfit: 8,
  maxContinuousLoss: 3
})

// 添加 chartType 的响应式引用
const chartType = ref('returns')

// 添加 positions 数据
const positions = ref([
  {
    symbol: 'BTC/USDT',
    amount: 0.1,
    openPrice: 42156.8,
    currentPrice: 42356.5,
    profit: 0.47
  }
])

// 修改 getValueStyle 方法的类型定义
interface Metric {
  title: string
  value: number
  precision?: number
  suffix?: string
  showArrow?: boolean
}

const getValueStyle = (metric: Metric) => {
  if (!metric.showArrow) return {}
  return {
    positive: metric.value >= 0,
    negative: metric.value < 0
  }
}

// 获取风险等级状态
const getRiskStatus = (level: number) => {
  if (level >= 80) return 'exception'
  if (level >= 60) return 'warning'
  return 'normal'
}

// 初始化图表
const initChart = () => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['策略收益率', '基准收益率']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'time',
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}%'
        }
      },
      series: [
        {
          name: '策略收益率',
          type: 'line',
          data: generateMockData(),
          lineStyle: {
            width: 2
          }
        },
        {
          name: '基准收益率',
          type: 'line',
          data: generateMockData(),
          lineStyle: {
            width: 2
          }
        }
      ]
    }
    chart.setOption(option)
  }
}

const backToList = () => {
  router.push('/strategy')
}


// 生成模拟数据
const generateMockData = () => {
  const data = []
  let date = new Date('2024-03-01')
  let value = 0
  for (let i = 0; i < 30; i++) {
    value += Math.random() * 2 - 0.5
    data.push([
      date.toISOString(),
      value
    ])
    date.setDate(date.getDate() + 1)
  }
  return data
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    running: 'green',
    stopped: 'default',
    error: 'red'
  }
  return colors[status]
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    error: '异常'
  }
  return texts[status]
}

// 切换策略状态
const toggleStrategy = () => {
  strategy.value.status = strategy.value.status === 'running' ? 'stopped' : 'running'
}

// 编辑策略
const editStrategy = () => {
  router.push(`/strategy/edit?id=${strategy.value.id}`)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
.strategy-detail {
  padding: 16px;
  background: #fff;
  height: calc(100vh - 35px);
}

.detail-content {
  display: flex;
  gap: 16px;
}

.content-main {
  flex: 1;
  min-width: 0;
}

.content-side {
  width: 280px;
  border-left: 1px solid #f0f0f0;
  padding-left: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #000000d9;
  margin-bottom: 16px;
}

.metric-section {
  margin-bottom: 24px;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.metric-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.metric-title {
  font-size: 13px;
  color: #00000073;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chart-section {
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-container {
  height: 360px;
}

.side-section {
  margin-bottom: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: #00000073;
}

.info-value {
  color: #000000d9;
}

.positive {
  color: #52c41a;
}

.negative {
  color: #ff4d4f;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
}

.tab-section {
  margin-bottom: 24px;
}

.log-container {
  height: 300px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
}

.log-item {
  padding: 4px 8px;
  border-radius: 2px;
  margin-bottom: 4px;
  color: #d4d4d4;
  font-size: 13px;
}

.log-time {
  color: #666;
  margin-right: 12px;
}

.log-level {
  display: inline-block;
  width: 70px;
  margin-right: 12px;
}

.log-item.info .log-level {
  color: #7cafc2;
}

.log-item.success .log-level {
  color: #a1c281;
}

.log-item.warning .log-level {
  color: #f7ca88;
}

.log-item.error .log-level {
  color: #ab4642;
}
</style>
