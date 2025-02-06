<template>
  <div class="resources-container">
    <div class="top">
      <!-- 条件筛选面板 -->
      <a-card class="filter-panel" :bordered="true" title="查询条件">
        <a-form
          layout="inline"
          :label-col="{
            style: { width: '80px', textAlign: 'right', padding: '5px' },
          }"
          :wrapper-col="{
            style: {
              width: 'calc(100% - 80px)',
              padding: '5px',
              height: '30px',
            },
          }"
          @keyup.enter="handleQuery"
        >
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="资源编码">
                <a-input v-model:value="queryParams.resourceCode" placeholder="请输入资源编码" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="资源名称">
                <a-input v-model:value="queryParams.resourceName" placeholder="请输入资源名称" allow-clear />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="资源类型">
                <a-select v-model:value="queryParams.resourceType" placeholder="请选择资源类型" allow-clear>
                  <a-select-option value="page">页面权限</a-select-option>
                  <a-select-option value="operation">操作权限</a-select-option>
                  <a-select-option value="data">数据权限</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="状态">
                <a-select v-model:value="queryParams.isActive" placeholder="请选择状态" allow-clear>
                  <a-select-option :value="1">启用</a-select-option>
                  <a-select-option :value="0">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="创建时间">
                <a-range-picker
                  v-model:value="queryParams.dateRange"
                  format="YYYY-MM-DD"
                  :show-time="false"
                  style="width: 100%"
                  :placeholder="['开始日期', '结束日期']"
                />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="handleQuery">查询</a-button>
                  <a-button @click="resetQuery">重置</a-button>
                </a-space>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
    </div>

    <div class="center">
      <!-- 数据表格面板 -->
      <a-card class="table-panel" :bordered="true">
        <template #title>
          <div class="card-title">
            <div class="left-operations">
              <a-space>
                <a-button type="primary" @click="handleAdd">
                  <template #icon><PlusOutlined /></template>
                  新增
                </a-button>
                <!-- <a-button type="primary" @click="handleImport">
                  <template #icon><UploadOutlined /></template>
                  导入
                </a-button>
                <a-button type="primary" @click="handleExport">
                  <template #icon><DownloadOutlined /></template>
                  导出
                </a-button> -->
                <a-button
                  type="primary"
                  danger
                  :disabled="!selectedRowKeys.length"
                  @click="handleBatchDelete"
                >
                  <template #icon><DeleteOutlined /></template>
                  批量删除
                </a-button>
              </a-space>
            </div>
            <div class="right-operations">
              <a-space>
                <a-button @click="handleQuery">
                  <template #icon><ReloadOutlined /></template>
                  刷新
                </a-button>
                <a-button @click="columnSettingVisible = true">
                  <template #icon><SettingOutlined /></template>
                  列设置
                </a-button>
              </a-space>
            </div>
          </div>
        </template>

        <!-- 表格 -->
        <a-table
          :columns="visibleColumns"
          :data-source="resourceList"
          :loading="loading"
          :pagination="pagination"
          :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
          :row-key="(record: Resource) => record.resourceId"
          size="small"
          :bordered="true"
          :scroll="{ x: 1500, y: true }"
          @change="handleQuery"
          :locale="{
            triggerDesc: '点击降序',
            triggerAsc: '点击升序',
            cancelSort: '取消排序'
          }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'icon'">
              <div style="display: flex; align-items: center; gap: 8px;">
                <component :is="iconList.find(item => item.name === record.icon)?.icon" v-if="record.icon" />
                <span>{{ getIconTitle(record.icon) }}</span>
              </div>
            </template>
            <template v-if="column.key === 'resourceType'">
              {{ record.resourceType === 'page' ? '页面权限' : record.resourceType === 'operation' ? '操作权限' : '数据权限' }}
            </template>
            <template v-if="column.key === 'isActive'">
              <a-tag :color="record.isActive === 1 ? 'success' : 'error'">
                {{ record.isActive === 1 ? '启用' : '禁用' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="primary" @click="handleEdit(record)">编辑</a-button>
                <a-button 
                  type="primary" 
                  v-if="record.resourceType === 'page'"
                  @click="handleAddSubResource(record)"
                >
                  新增下级
                </a-button>
                <a-button type="primary" danger @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      :title="modalTitle"
      :open="modalVisible"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      class="resource-modal"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="form-title">基本信息</div>
          <a-form-item label="资源编码" name="resourceCode">
            <a-input 
              v-model:value="formData.resourceCode" 
              placeholder="请输入资源编码"
              :disabled="modalTitle === '编辑资源'"
            />
          </a-form-item>
          
          <a-form-item label="资源名称" name="resourceName">
            <a-input v-model:value="formData.resourceName" placeholder="请输入资源名称" />
          </a-form-item>
          
          <a-form-item label="资源类型" name="resourceType">
            <a-select v-model:value="formData.resourceType" placeholder="请选择资源类型">
              <a-select-option value="page">页面权限</a-select-option>
              <a-select-option value="operation">操作权限</a-select-option>
              <a-select-option value="data">数据权限</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item 
            label="图标" 
            name="icon" 
            :style="{ height: '60px' }"
            v-if="formData.resourceType === 'page'"
          >
            <div class="icon-selector">
              <div class="selected-icon" @click="iconSelectorVisible = true">
                <template v-if="formData.iconComponent">
                  <component :is="formData.iconComponent" />
                  <span class="icon-text">{{ getSelectedIconTitle() }}</span>
                </template>
                <span v-else>点击选择图标</span>
              </div>
              <a-popover
                v-model:open="iconSelectorVisible"
                trigger="click"
                placement="bottomLeft"
                :overlay-style="{ padding: '12px' }"
              >
                <template #content>
                  <div class="icon-list">
                    <div 
                      v-for="item in iconList" 
                      :key="item.name"
                      class="icon-item"
                      @click="() => handleIconSelect(item.name)"
                    >
                      <component :is="item.icon" />
                      <span class="icon-name">{{ item.title }}</span>
                    </div>
                  </div>
                </template>
              </a-popover>
            </div>
          </a-form-item>

          <a-form-item label="状态" name="isActive">
            <a-switch
              :checked="formData.isActive === 1"
              @change="(checked: boolean) => formData.isActive = checked ? 1 : 0"
            />
          </a-form-item>
        </div>

        <!-- 路由配置 - 仅页面权限显示 -->
        <template v-if="showRouteConfig">
          <div class="form-section">
            <div class="form-title">路由配置</div>
            <a-form-item label="父级菜单" name="parentId">
              <a-tree-select
                v-model:value="formData.parentId"
                :tree-data="resourceTreeData"
                :field-names="{ label: 'title', value: 'value', children: 'children' }"
                placeholder="请选择父级菜单"
                allow-clear
                tree-default-expand-all
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              >
                <template #title="{ value, title }">
                  <span>{{ value === 0 ? '顶级菜单' : title }}</span>
                </template>
              </a-tree-select>
            </a-form-item>

            <a-form-item label="路由路径" name="path">
              <a-input v-model:value="formData.path" placeholder="请输入路由路径" />
            </a-form-item>
            
            <a-form-item 
              label="组件路径" 
              name="component"
              v-if="showComponentAndHidden"
            >
              <a-input v-model:value="formData.component" placeholder="请输入组件路径" />
            </a-form-item>

            <a-form-item label="布局类型" name="layout">
              <a-select v-model:value="formData.layout" placeholder="请选择布局类型">
                <a-select-option value="default">默认布局</a-select-option>
                <a-select-option value="full">全屏布局</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="排序号" name="sortOrder">
              <a-input-number v-model:value="formData.sortOrder" :min="0" style="width: 100%" />
            </a-form-item>

            <a-form-item 
              label="是否隐藏" 
              name="hidden"
              v-if="showComponentAndHidden"
            >
              <a-switch
                :checked="formData.hidden === 1"
                @change="(checked: boolean) => formData.hidden = checked ? 1 : 0"
              />
            </a-form-item>

            <a-form-item 
              label="重定向路径" 
              name="redirect"
              v-if="formData.parentId === -1"
            >
              <a-input v-model:value="formData.redirect" placeholder="请输入重定向路径" />
            </a-form-item>
          </div>
        </template>
      </a-form>
    </a-modal>

    <!-- 列设置弹窗 -->
    <a-modal
      v-model:open="columnSettingVisible"
      title="列设置"
      okText="确定"
      cancelText="取消"
      @ok="columnSettingVisible = false"
      @cancel="columnSettingVisible = false"
    >
      <a-checkbox-group
        v-model:value="checkedColumns"
        @change="handleColumnSettingChange"
      >
        <div style="display: flex; flex-direction: column; gap: 8px">
          <a-checkbox
            v-for="col in columns.filter((c) => c.key !== 'action')"
            :key="col.key"
            :value="col.key"
          >
            {{ col.title }}
          </a-checkbox>
        </div>
      </a-checkbox-group>
    </a-modal>

    <!-- 导入弹窗 -->
    <ImportModalComponent
      v-model:visible="importModal.visible"
      :title="'导入资源'"
      :loading="importModal.loading"
      v-model:file-list="importModal.fileList"
      @ok="handleImportOk"
      @cancel="handleImportCancel"
      @download="downloadTemplate"
      @file-change="handleFileChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed, markRaw, h } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import {
  getResourceList,
  getPageResourceList,
  addResource,
  updateResource,
  deleteResource,
  batchDeleteResources,
  importResources,
  exportResources,
  getResourceTemplateUrl
} from '@/api/resources'
import { 
  UploadOutlined, 
  PlusOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  SettingOutlined, 
  ReloadOutlined, 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  KeyOutlined, 
  AppstoreOutlined, 
  MenuOutlined, 
  FileOutlined, 
  DatabaseOutlined, 
  ToolOutlined, 
  SettingFilled, 
  SecurityScanOutlined, 
  SafetyCertificateOutlined, 
  ProfileOutlined, 
  ProjectOutlined, 
  FolderOutlined, 
  ApiOutlined,
  HomeOutlined,
  BarsOutlined, 
  TableOutlined, 
  FormOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloudOutlined, 
  CloudUploadOutlined, 
  CloudDownloadOutlined, 
  CloudSyncOutlined, 
  MessageOutlined, 
  NotificationOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  MobileOutlined, 
  TabletOutlined, 
  LaptopOutlined, 
  DesktopOutlined 
} from '@ant-design/icons-vue'
import ImportModal from '@/components/ImportModal.vue'

// 注册导入组件
const ImportModalComponent = markRaw(ImportModal)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 分页配置
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  locale: {
    items_per_page: '条/页',
    jump_to: '跳至',
    jump_to_confirm: '确定',
    page: '页'
  }
})

// 资源类型定义
interface Resource {
  resourceId: number
  resourceCode: string
  resourceName: string
  resourceType: 'page' | 'operation' | 'data'
  path?: string
  component?: string
  icon?: string
  layout?: 'default' | 'full'
  sortOrder?: number
  hidden: number
  redirect?: string
  parentId?: number
  isActive: number
  createdAt: string
  updatedAt: string
}

// 查询参数类型
interface ResourceQuery {
  pageNo: number
  pageSize: number
  resourceCode?: string
  resourceName?: string
  resourceType?: string
  isActive?: number
  dateRange?: any
  startTime?: string
  endTime?: string
  orderBy?: string
  orderType?: 'asc' | 'desc'
}

// 查询参数
const queryParams = reactive<ResourceQuery>({
  pageNo: 1,
  pageSize: 10,
  resourceCode: undefined,
  resourceName: undefined,
  resourceType: undefined,
  isActive: undefined,
  dateRange: undefined,
  startTime: undefined,
  endTime: undefined
})

// 表格数据
const loading = ref(false)
const resourceList = ref<Resource[]>([])

// 表格列定义
const columns = [
  {
    title: '资源ID',
    dataIndex: 'resourceId',
    key: 'resourceId',
    width: 80,
  },
  {
    title: '资源名称',
    dataIndex: 'resourceName',
    key: 'resourceName',
    width: 150,
  },
  {
    title: '资源编码',
    dataIndex: 'resourceCode',
    key: 'resourceCode',
    sorter: true,
    width: 180
  },
  {
    title: '资源类型',
    dataIndex: 'resourceType',
    key: 'resourceType',
    width: 100,
    customRender: ({ text }: { text: string }) => {
      const typeMap: Record<string, string> = {
        page: '页面权限',
        operation: '操作权限',
        data: '数据权限'
      }
      return typeMap[text] || text
    }
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    width: 100
  },
  {
    title: '路由路径',
    dataIndex: 'path',
    key: 'path',
    width: 180,
    ellipsis: true
  },
  {
    title: '组件路径',
    dataIndex: 'component',
    key: 'component',
    width: 180,
    ellipsis: true
  },
  {
    title: '排序号',
    dataIndex: 'sortOrder',
    key: 'sortOrder',
    sorter: true,
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'isActive',
    key: 'isActive',
    width: 80
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 160
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right'
  }
]

// 选择行配置
const selectedRowKeys = ref<number[]>([])
const onSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// 表单数据
const modalVisible = ref(false)
const modalTitle = ref('')
const formRef = ref()

// 修改表单数据类型
interface FormData {
  resourceId?: number
  resourceCode: string
  resourceName: string
  resourceType?: 'page' | 'operation' | 'data'
  path?: string
  component?: string
  icon?: string
  iconComponent?: any
  layout?: 'default' | 'full'
  sortOrder?: number
  hidden: number
  redirect?: string
  parentId?: number
  isActive: number
}

// 表单数据
const formData = reactive<FormData>({
  resourceId: undefined,
  resourceCode: '',
  resourceName: '',
  resourceType: undefined,
  path: '',
  component: '',
  icon: '',
  iconComponent: undefined,
  layout: 'default',
  sortOrder: 0,
  hidden: 0,
  redirect: '',
  parentId: 0,
  isActive: 1
})

// 表单验证规则
const rules = {
  resourceCode: [{ required: true, message: '请输入资源编码' }],
  resourceName: [{ required: true, message: '请输入资源名称' }],
  resourceType: [{ required: true, message: '请选择资源类型' }]
}

// 导入相关
const importModal = ref({
  visible: false,
  loading: false,
  fileList: [] as { originFileObj: File }[]
})

// 图标选择相关
const iconSelectorVisible = ref(false)

// 图标选择处理
const handleIconSelect = (iconName: string) => {
  formData.icon = iconName
  // 获取对应的图标组件
  const iconComponent = iconList.find(item => item.name === iconName)?.icon
  if (iconComponent) {
    formData.iconComponent = markRaw(iconComponent)
  }
  iconSelectorVisible.value = false
}

// 新增处理
const handleAdd = async () => {
  try {
    // 先获取资源树数据
    await getResourceTreeData()
    
    modalTitle.value = '新增资源'
    modalVisible.value = true
    Object.assign(formData, {
      resourceId: undefined,
      resourceCode: '',
      resourceName: '',
      resourceType: undefined,
      path: '',
      component: '',
      icon: '',
      iconComponent: undefined,
      layout: 'default',
      sortOrder: 0,
      hidden: 0,
      redirect: '',
      parentId: 0,
      isActive: 1
    })
  } catch (error) {
    console.error('获取资源树失败:', error)
    message.error('获取资源树失败')
  }
}

// 编辑处理
const handleEdit = async (record: Resource) => {
  try {
    await getResourceTreeData()
    
    modalTitle.value = '编辑资源'
    modalVisible.value = true
    
    const iconComponent = iconList.find(item => item.name === record.icon)?.icon
    
    // 设置表单数据
    Object.assign(formData, {
      ...record,
      parentId: record.parentId === 0 ? -1 : record.parentId,
      iconComponent: iconComponent ? markRaw(iconComponent) : undefined
    })
  } catch (error) {
    console.error('获取资源树失败:', error)
    message.error('获取资源树失败')
  }
}

// 删除处理
const handleDelete = async (record: Resource) => {
  try {
    await deleteResource({ resourceId: record.resourceId })
    message.success('删除成功')
    handleQuery()
  } catch (error) {
    message.error('删除失败')
  }
}

// 批量删除处理
const handleBatchDelete = async () => {
  try {
    await batchDeleteResources({ resourceIds: selectedRowKeys.value })
    message.success('批量删除成功')
    selectedRowKeys.value = []
    handleQuery()
  } catch (error) {
    message.error('批量删除失败')
  }
}

// 弹窗确认
const handleModalOk = async () => {
  try {
    await formRef.value.validate()
    const submitData = { ...formData }
    
    if (submitData.parentId === -1) {
      submitData.parentId = 0
    }
    
    if (submitData.resourceId) {
      await updateResource(submitData)
      message.success('更新成功')
    } else {
      await addResource(submitData)
      message.success('创建成功')
    }
    modalVisible.value = false
    handleQuery()
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 弹窗取消
const handleModalCancel = () => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

// 导入处理
const handleImport = () => {
  importModal.value.visible = true
}

// 导入确认
const handleImportOk = async () => {
  if (importModal.value.fileList.length === 0) {
    message.error('请选择要导入的文件!')
    return
  }
  
  try {
    importModal.value.loading = true
    const file = importModal.value.fileList[0].originFileObj
    
    // 调用导入API
    await importResources(file)
    message.success('导入成功!')
    importModal.value.visible = false
    importModal.value.fileList = [] // 清空文件列表
    
    // 刷新表格数据
    refreshTable()
  } catch (error) {
    console.error('导入失败:', error)
    message.error('导入失败!')
  } finally {
    importModal.value.loading = false
  }
}

// 导入取消
const handleImportCancel = () => {
  importModal.value.visible = false
  importModal.value.fileList = []
}

// 文件上传前处理
const beforeUpload = (file: File) => {
  const isExcel = /\.(xlsx|xls|csv)$/.test(file.name)
  if (!isExcel) {
    message.error('只能上传Excel、CSV文件!')
  }
  importModal.value.fileList = [{
    originFileObj: file
  }]
  return false
}

// 文件变化处理
const handleFileChange = (file: File) => {
  importModal.value.fileList = [{
    originFileObj: file
  }]
}

// 下载模板
const downloadTemplate = async () => {
  try {
    const res = await getResourceTemplateUrl()
    const url = res.data.download_url
    
    // 创建一个隐藏的a标签用于下载
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '资源导入模板.xlsx') // 设置下载文件名
    
    // 添加到body并触发点击
    document.body.appendChild(link)
    link.click()
    
    // 清理DOM
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载模板失败:', error)
    message.error('下载模板失败')
  }
}

// 导出处理
const handleExport = async () => {
  try {
    // 使用当前搜索条件作为导出参数
    const params = {
      resourceCode: queryParams.resourceCode,
      resourceName: queryParams.resourceName,
      resourceType: queryParams.resourceType,
      isActive: queryParams.isActive,
      startTime: queryParams.dateRange?.[0]?.format('YYYY-MM-DD 00:00:00'),
      endTime: queryParams.dateRange?.[1]?.format('YYYY-MM-DD 00:00:00')
    }

    const res = await exportResources(params)
    const url = res.data.download_url
    
    // 创建一个隐藏的a标签用于下载
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '资源数据.xlsx') // 设置下载文件名
    
    // 添加到body并触发点击
    document.body.appendChild(link)
    link.click()
    
    // 清理DOM
    document.body.removeChild(link)
    message.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    message.error('导出失败')
  }
}

// 资源树数据获取
const getResourceTreeData = async () => {
  try {
    // 获取所有资源数据，不分页
    const res = await getResourceList()
    
    // 构建树形结构
    const buildTree = (items: Resource[], parentId: number | null = null): TreeNode[] => {
      return items
        .filter(item => {
          if (parentId === null) {
            // 获取一级菜单（parentId === 0 的项）
            return item.parentId === 0
          }
          return item.parentId === parentId
        })
        .map(item => ({
          title: item.resourceName,
          value: item.resourceId,
          key: item.resourceId.toString(),
          children: buildTree(items, item.resourceId)
        }))
    }
    
    // 过滤页面类型的资源并构建树
    const pageResources = res.data.list.filter((item: Resource) => item.resourceType === 'page')
    const menuTree = buildTree(pageResources)
    
    // 创建顶级菜单，并将所有菜单作为其子节点
    resourceTreeData.value = [
      {
        title: '顶级菜单',
        value: -1,
        key: '-1',
        children: menuTree
      }
    ]
  } catch (error) {
    console.error('获取资源树失败:', error)
    message.error('获取资源树失败')
  }
}

// 资源树数据
interface TreeNode {
  title: string
  value: number
  key: string
  children?: TreeNode[]
}

const resourceTreeData = ref<TreeNode[]>([])

// 图标列表
const iconList = [
  { icon: DashboardOutlined, name: 'DashboardOutlined', title: '仪表盘' },
  { icon: UserOutlined, name: 'UserOutlined', title: '用户' },
  { icon: TeamOutlined, name: 'TeamOutlined', title: '团队' },
  { icon: KeyOutlined, name: 'KeyOutlined', title: '权限' },
  { icon: AppstoreOutlined, name: 'AppstoreOutlined', title: '应用' },
  { icon: MenuOutlined, name: 'MenuOutlined', title: '菜单' },
  { icon: FileOutlined, name: 'FileOutlined', title: '文件' },
  { icon: DatabaseOutlined, name: 'DatabaseOutlined', title: '数据' },
  { icon: ToolOutlined, name: 'ToolOutlined', title: '工具' },
  { icon: SettingFilled, name: 'SettingFilled', title: '设置' },
  { icon: SecurityScanOutlined, name: 'SecurityScanOutlined', title: '安全' },
  { icon: SafetyCertificateOutlined, name: 'SafetyCertificateOutlined', title: '认证' },
  { icon: ProfileOutlined, name: 'ProfileOutlined', title: '档案' },
  { icon: ProjectOutlined, name: 'ProjectOutlined', title: '项目' },
  { icon: FolderOutlined, name: 'FolderOutlined', title: '文件夹' },
  { icon: ApiOutlined, name: 'ApiOutlined', title: 'API' },
  { icon: HomeOutlined, name: 'HomeOutlined', title: '首页' },
  { icon: SettingOutlined, name: 'SettingOutlined', title: '设置' },
  { icon: BarsOutlined, name: 'BarsOutlined', title: '列表' },
  { icon: TableOutlined, name: 'TableOutlined', title: '表格' },
  { icon: FormOutlined, name: 'FormOutlined', title: '表单' },
  { icon: SearchOutlined, name: 'SearchOutlined', title: '搜索' },
  { icon: FilterOutlined, name: 'FilterOutlined', title: '筛选' },
  { icon: EditOutlined, name: 'EditOutlined', title: '编辑' },
  { icon: DeleteOutlined, name: 'DeleteOutlined', title: '删除' },
  { icon: SaveOutlined, name: 'SaveOutlined', title: '保存' },
  { icon: UploadOutlined, name: 'UploadOutlined', title: '上传' },
  { icon: DownloadOutlined, name: 'DownloadOutlined', title: '下载' },
  { icon: CloudOutlined, name: 'CloudOutlined', title: '云' },
  { icon: CloudUploadOutlined, name: 'CloudUploadOutlined', title: '云上传' },
  { icon: CloudDownloadOutlined, name: 'CloudDownloadOutlined', title: '云下载' },
  { icon: CloudSyncOutlined, name: 'CloudSyncOutlined', title: '云同步' },
  { icon: MessageOutlined, name: 'MessageOutlined', title: '消息' },
  { icon: NotificationOutlined, name: 'NotificationOutlined', title: '通知' },
  { icon: MailOutlined, name: 'MailOutlined', title: '邮件' },
  { icon: PhoneOutlined, name: 'PhoneOutlined', title: '电话' },
  { icon: MobileOutlined, name: 'MobileOutlined', title: '手机' },
  { icon: TabletOutlined, name: 'TabletOutlined', title: '平板' },
  { icon: LaptopOutlined, name: 'LaptopOutlined', title: '笔记本' },
  { icon: DesktopOutlined, name: 'DesktopOutlined', title: '桌面' }
]

// 计算是否显示路由相关配置
const showRouteConfig = computed(() => formData.resourceType === 'page')

// 列设置相关
const STORAGE_KEY = 'resources_table_columns'
const columnSettingVisible = ref(false)
const checkedColumns = ref<string[]>([])

// 初始化选中的列
const initCheckedColumns = () => {
  const savedColumns = localStorage.getItem(STORAGE_KEY)
  if (savedColumns) {
    checkedColumns.value = JSON.parse(savedColumns)
  } else {
    checkedColumns.value = columns
      .filter(col => col.key !== 'action')
      .map(col => col.key)
  }
}

// 列设置变化处理
const handleColumnSettingChange = (checkedKeys: string[]) => {
  checkedColumns.value = checkedKeys
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedKeys))
}

// 显示的列配置
const visibleColumns = computed(() => {
  return columns.filter(col => 
    col.key === 'action' || checkedColumns.value.includes(col.key)
  )
})

// 添加计算属性
const showComponentAndHidden = computed(() => formData.parentId !== -1)

// 初始化
onMounted(() => {
  initCheckedColumns();
  handleQuery();
  getResourceTreeData();
});

// 查询方法
const handleQuery = async (
  pag?: TablePaginationConfig,
  filters?: Record<string, string[]>,
  sorter?: any
) => {
  loading.value = true
  try {
    // 如果有分页参数，更新分页配置
    if (pag) {
      pagination.current = pag.current || 1
      pagination.pageSize = pag.pageSize || 10
    }

    // 处理排序参数
    let orderBy = ''
    let orderType = ''
    if (sorter?.field && sorter?.order) {
      orderBy = sorter.field
      orderType = sorter.order === 'ascend' ? 'asc' : 'desc'
    }

    // 构建查询参数
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      resourceCode: queryParams.resourceCode,
      resourceName: queryParams.resourceName,
      resourceType: queryParams.resourceType,
      isActive: queryParams.isActive,
      startTime: queryParams.dateRange?.[0]?.format('YYYY-MM-DD 00:00:00'),
      endTime: queryParams.dateRange?.[1]?.format('YYYY-MM-DD 00:00:00'),
      orderBy,
      orderType: orderType as 'asc' | 'desc'
    }

    const res = await getPageResourceList(params)
    resourceList.value = res.data.list.records
    pagination.total = res.data.list.total
  } catch (error) {
    console.error('查询失败:', error)
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  Object.assign(queryParams, {
    resourceCode: undefined,
    resourceName: undefined,
    resourceType: undefined,
    isActive: undefined,
    dateRange: undefined
  })
  pagination.current = 1
  pagination.pageSize = 10
  handleQuery()
}

// 刷新表格
const refreshTable = () => {
  selectedRowKeys.value = []
  pagination.current = 1
  handleQuery()
}

// 添加新的方法
const getIconTitle = (iconName: string) => {
  return iconList.find(item => item.name === iconName)?.title || iconName
}

const getSelectedIconTitle = () => {
  return iconList.find(item => item.name === formData.icon)?.title || ''
}

// 添加新增下级处理函数
const handleAddSubResource = async (parentResource: Resource) => {
  try {
    // 先获取资源树数据
    await getResourceTreeData()
    
    modalTitle.value = '新增下级资源'
    modalVisible.value = true
    
    // 设置表单数据，预设父级菜单信息
    Object.assign(formData, {
      resourceId: undefined,
      resourceCode: '',
      resourceName: '',
      resourceType: 'page',  // 默认为页面类型
      path: '',
      component: '',
      icon: '',
      iconComponent: undefined,
      layout: 'default',
      sortOrder: 0,
      hidden: 0,
      redirect: '',
      parentId: parentResource.resourceId,  // 设置父级菜单ID
      isActive: 1
    })
  } catch (error) {
    console.error('获取资源树失败:', error)
    message.error('获取资源树失败')
  }
}
</script>

<style scoped>
.resources-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.top {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.center {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}


.table-panel {
  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-weight: 500;
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 8px 16px;
  }
}

.resource-modal {
  :deep(.ant-modal-content) {
    padding: 0;
    
    .ant-modal-header {
      padding: 16px 24px;
      margin-bottom: 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .ant-modal-body {
      padding: 24px;
    }
    
    .ant-modal-footer {
      margin-top: 0;
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
    }
  }
}

.form-left,
.form-right {
  padding: 0 16px;
}

.form-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 24px;
  line-height: 1.5;
}

.icon-selector {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
  
  .selected-icon {
    width: 100%;
    height: 60px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background: #fff;
    gap: 8px;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }

    .anticon {
      font-size: 24px;
    }

    .icon-text {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
  }
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
  width: 420px;
  background: #fff;
  z-index: 2;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: #f0f5ff;
    color: #1890ff;
  }

  .anticon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .icon-name {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.65);
    text-align: center;
  }
}

.form-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 16px;
  line-height: 1.5;
  padding-left: 8px;
  border-left: 3px solid #1890ff;
}

.icon-selector {
  .selected-icon {
    width: 100%;
    height: 60px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background: #fff;
    gap: 8px;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }

    .anticon {
      font-size: 24px;
    }

    .icon-text {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
    }
  }
}
</style>
