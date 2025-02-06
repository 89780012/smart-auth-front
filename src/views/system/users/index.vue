<template>
  <div class="users-container">
    <div class="top">
    <!-- 条件筛选面板 -->
    <a-card class="filter-panel" :bordered="true" title="查询条件">
      <a-form 
        layout="inline" 
        :label-col="{ style: { width: '80px', textAlign: 'right' ,padding: '5px' } }" 
        :wrapper-col="{ style: { width: 'calc(100% - 80px)', padding: '5px' , height: '30px' } }"
        @keyup.enter="onSearch"
      >
        <a-row :gutter="24">
          <!-- 用户名搜索 -->
          <a-col :span="6">
            <a-form-item label="用户名">
              <a-input
                v-model:value="searchForm.username"
                placeholder="请输入用户名"
                allowClear
              />
            </a-form-item>
          </a-col>
          
          <!-- 邮箱搜索 -->
          <a-col :span="6">
            <a-form-item label="邮箱">
              <a-input
                v-model:value="searchForm.email"
                placeholder="请输入邮箱"
                allowClear
              />
            </a-form-item>
          </a-col>

          <!-- 手机号搜索 -->
          <a-col :span="6">
            <a-form-item label="手机号">
              <a-input
                v-model:value="searchForm.phone"
                placeholder="请输入手机号"
                allowClear
              />
            </a-form-item>
          </a-col>

          <!-- 微信ID搜索 -->
          <a-col :span="6">
            <a-form-item label="微信ID">
              <a-input
                v-model:value="searchForm.wechatId" 
                placeholder="请输入微信ID"
                allowClear
              />
            </a-form-item>
          </a-col>

          <!-- 状态选择 -->
          <a-col :span="6">
            <a-form-item label="状态">
              <a-select
                v-model:value="searchForm.isActive"
                placeholder="请选择状态"
                allowClear
              >
                <a-select-option :value="1">启用</a-select-option>
                <a-select-option :value="0">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <!-- 创建时间范围 -->
          <a-col :span="6">
            <a-form-item label="创建时间">
              <a-range-picker
                v-model:value="searchForm.dateRange"
                format="YYYY-MM-DD"
                :show-time="false"
                style="width: 100%"
                :placeholder="['开始日期', '结束日期']"
              />
            </a-form-item>
          </a-col>

          <!-- 操作按钮 -->
          <a-col :span="6">
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="onSearch">查询</a-button>
                <a-button @click="resetSearch">重置</a-button>
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
              <a-button type="primary" @click="handleImport">
                <template #icon><UploadOutlined /></template>
                导入
              </a-button>
              <a-button type="primary" @click="handleExport">
                <template #icon><DownloadOutlined /></template>
                导出
              </a-button>
              <a-button type="primary" danger :disabled="!selectedRowKeys.length" @click="handleBatchDelete">
                <template #icon><DeleteOutlined /></template>
                批量删除
              </a-button>
            </a-space>
          </div>
          <div class="right-operations">
            <a-space>
              <a-button @click="refreshTable">
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

      <a-table
        :columns="visibleColumns"
        :data-source="userList"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: handleSelectionChange }"
        :row-key="(record: User) => record.userId"
        size="small"
        :bordered="true"
        :scroll="{ x: 1500, y: true }"
        @change="handleTableChange"
        :locale="{
          triggerDesc: '点击降序',
          triggerAsc: '点击升序', 
          cancelSort: '取消排序'
        }"
      >
        <template #bodyCell="{ column, record }">
          <!-- 头像列 -->
          <template v-if="column.key === 'profile'">
            <a-avatar :src="record.profile" />
          </template>
          
          <!-- 状态列 -->
          <template v-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'success' : 'error'">
              {{ record.isActive ? '启用' : '禁用' }}
            </a-tag>
          </template>
          
          <!-- 时间列 -->
          <template v-if="column.key === 'createdAt' || column.key === 'updatedAt'">
            {{ formatDateTime(record[column.key]) }}
          </template>
          
          <!-- 操作列 -->
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" @click="handleEdit(record)">编辑</a-button>
              <a-button type="primary" danger @click="handleDelete(record)">删除</a-button>
              <a-button type="primary" @click="handleBindRole(record)">绑定角色</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
    </div>

    <!-- 新增/编辑用户弹框 -->
    <a-modal
      v-model:open="userModal.visible"
      :title="userModal.title"
      :confirm-loading="userModal.loading"
      @ok="handleUserModalOk"
      @cancel="handleUserModalCancel"
      width="800px"
      class="user-modal"
      okText="确定"
      cancelText="取消"
    >
      <a-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-row :gutter="24">
          <a-col :span="15">
            <div class="form-left">
              <div class="form-title">基本信息</div>
              <a-form-item label="用户名" name="username">
                <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
              </a-form-item>
              
              <a-form-item label="邮箱" name="email">
                <a-input v-model:value="userForm.email" placeholder="请输入邮箱" />
              </a-form-item>
              
              <a-form-item label="手机号" name="phone">
                <a-input v-model:value="userForm.phone" placeholder="请输入手机号" />
              </a-form-item>
              
              <a-form-item label="密码" name="password" v-if="userModal.type === 'add'">
                <a-input-password v-model:value="userForm.password" placeholder="请输入密码" />
              </a-form-item>

              <a-form-item label="状态" name="isActive">
                <a-switch v-model:checked="userForm.isActive" />
              </a-form-item>
            </div>
          </a-col>
          
          <a-col :span="9">
            <div class="form-right">
              <div class="form-title">头像设置</div>
              <div class="avatar-section">
                <div class="avatar-upload-wrapper">
                  <a-upload
                    v-model:file-list="userForm.fileList"
                    name="file"
                    list-type="picture-card"
                    class="avatar-uploader"
                    :show-upload-list="false"
                    action="/api/uploadFile"
                    :before-upload="beforeUpload"
                    @change="handleAvatarChange"
                  >
                    <div class="upload-area">
                      <template v-if="userForm.profile">
                        <img :src="userForm.profile" alt="avatar" />
                        <div class="upload-mask">
                          <camera-outlined />
                          <span>更换头像</span>
                        </div>
                      </template>
                      <template v-else>
                        <div class="upload-placeholder">
                          <loading-outlined v-if="userForm.uploading" />
                          <user-outlined v-else />
                          <div class="upload-text">点击上传头像</div>
                        </div>
                      </template>
                    </div>
                  </a-upload>
                </div>
                <div class="avatar-tips">
                  支持 jpg、png 格式，大小不超过 2MB
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 导入弹框 -->
    <import-modal
      v-model:visible="importModal.visible"
      :title="'导入用户'"
      :loading="importModal.loading"
      v-model:file-list="importModal.fileList"
      @ok="handleImportOk"
      @cancel="handleImportCancel"
      @download="downloadTemplate"
      @file-change="handleFileChange"
    />

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
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a-checkbox
            v-for="col in columns.filter(c => c.key !== 'action')"
            :key="col.key"
            :value="col.key"
          >
            {{ col.title }}
          </a-checkbox>
        </div>
      </a-checkbox-group>
    </a-modal>

    <!-- 角色选择弹框 -->
    <a-modal
      v-model:open="roleModal.visible"
      title="绑定角色"
      :width="800"
      @ok="handleRoleModalOk"
      @cancel="handleRoleModalCancel"
      :confirm-loading="roleModal.loading"
      okText="确定"
      cancelText="取消"
    >
    <a-transfer
      v-model:target-keys="selectedRoleIds"
      :data-source="transferDataSource"
      :titles="['全部角色', '已选角色']"
      :render="item => item.title"
      :loading="roleLoading"
      :listStyle="{
        height: '400px',  // 可以设置具体像素值
        width: '600px'
      }"
      :show-search="true"
      :filter-option="filterTransferOption"
      :locale="{
        itemUnit: '项',
        itemsUnit: '项',
        notFoundContent: '列表为空',
        searchPlaceholder: '请输入搜索内容'
      }"
    />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { SettingOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined, LoadingOutlined, FileOutlined, FileExcelOutlined, RightOutlined } from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { FormInstance } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import { createUser, getUserList,updateUser,deleteUser,batchDeleteUsers,getUserTemplateUrl,importUsers,exportUsers } from '@/api/user'
import ImportModal from '@/components/ImportModal.vue'
import { getRoleList, bindUserRole, getUserRole, type Role } from '@/api/roles'

// 用户数据类型定义
interface User {
  userId: number
  username: string
  profile: string
  email: string
  phone: string
  wechatId: string
  isActive: number
  createdAt: string
  updatedAt: string
}

// 表格列定义
const columns = [
  { 
    title: '用户ID', 
    dataIndex: 'userId', 
    key: 'userId',
    width: 80,
    sorter: true
  },
  {
    title: '头像',
    dataIndex: 'profile',
    key: 'profile',
    width: 80
  },
  { 
    title: '用户名', 
    dataIndex: 'username', 
    key: 'username',
    sorter: true
  },
  { 
    title: '邮箱', 
    dataIndex: 'email', 
    key: 'email',
    sorter: true
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 100,
    sorter: true
  },
  {
    title: '微信ID',
    dataIndex: 'wechatId',
    key: 'wechatId',
    sorter: true
  },
  { 
    title: '状态', 
    dataIndex: 'isActive', 
    key: 'isActive',
    width: 100,
    sorter: true
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: true
  },
  {
    title: '更新时间', 
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    sorter: true
  },
  { 
    title: '操作', 
    key: 'action', 
    width: 220,
    fixed: 'right'
  }
]

// 搜索表单数据
const searchForm = ref({
  username: '',
  email: '',
  phone: '',
  wechatId: '',
  isActive: undefined,
  dateRange: undefined
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 修改用户列表数据初始化
const userList = ref<User[]>([])

// 格式化日期时间
const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 分页配置
const pagination = computed<TablePaginationConfig>(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  locale: {
    items_per_page: '条/页',
    jump_to: '跳至',
    jump_to_confirm: '确定',
    page: '页'
  }
}))

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: '',
    email: '',
    phone: '',
    wechatId: '',
    isActive: undefined,
    dateRange: undefined
  }
  onSearch()
}

// 搜索处理
const onSearch = async () => {
  try {
    loading.value = true
    selectedRowKeys.value = []
    
    currentPage.value = 1
    //点击查询
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.value.username,
      email: searchForm.value.email,
      phone: searchForm.value.phone,
      wechatId: searchForm.value.wechatId,
      isActive: searchForm.value.isActive,
      startTime: searchForm.value.dateRange?.[0]?.format('YYYY-MM-DD 00:00:00'),
      endTime: searchForm.value.dateRange?.[1]?.format('YYYY-MM-DD 00:00:00')
    }

    const res = await getUserList(params)
    // 更新数据,适配接口返回格式
    userList.value = res.data.userList.records.map((item: any) => ({
      userId: item.userId,
      username: item.username,
      profile: item.profile,
      email: item.email,
      phone: item.phone,
      wechatId: item.wechatId,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
    total.value = res.data.userList.total
  } catch (error) {
    console.error('查询失败:', error)
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 刷新表格
const refreshTable = () => {
  selectedRowKeys.value = []
  currentPage.value = 1
  onSearch()
}

// 表格变化处理
const handleTableChange = async (
  pagination: TablePaginationConfig,
  filters: Record<string, string[]>,
  sorter: any
) => {
  currentPage.value = pagination.current || 1
  pageSize.value = pagination.pageSize || 10

  let orderBy = ''
  let orderType = ''
  
  if (sorter.field && sorter.order) {
    orderBy = sorter.field

    if (sorter.order === 'ascend') {
      orderType = 'asc'
    } else {
      orderType = 'desc'
    }
  }

  try {
    loading.value = true
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.value.username,
      email: searchForm.value.email,
      phone: searchForm.value.phone,
      wechatId: searchForm.value.wechatId,
      isActive: searchForm.value.isActive,
      startTime: searchForm.value.dateRange?.[0]?.format('YYYY-MM-DD 00:00:00'),
      endTime: searchForm.value.dateRange?.[1]?.format('YYYY-MM-DD 00:00:00'),
      orderBy: orderBy,
      orderType: orderType as 'asc' | 'desc'
    }

    const res = await getUserList(params)
    // 更新数据,适配接口返回格式
    userList.value = res.data.userList.records.map((item: any) => ({
      userId: item.userId,
      username: item.username,
      profile: item.profile,
      email: item.email,
      phone: item.phone,
      wechatId: item.wechatId,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
    total.value = res.data.userList.total
  } catch (error) {
    console.error('查询失败:', error)
    message.error('查询失败')
  } finally {
    loading.value = false
  }
}

// CRUD 操作处理
const handleAdd = () => {
  userModal.value.type = 'add'
  userModal.value.title = '新增用户'
  userModal.value.visible = true
  userForm.value = {
    userId: undefined,
    username: '',
    email: '',
    phone: '',
    password: '',
    profile: '',
    isActive: true,
    fileList: [],
    uploading: false
  }
}

const handleEdit = (record: User) => {
  userModal.value.type = 'edit'
  userModal.value.title = '编辑用户'
  userModal.value.visible = true
  userForm.value = {
    ...record,
    isActive: record.isActive === 1,
    password: '',
    fileList: [],
    uploading: false
  }
}

const handleDelete = (record: User) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 "${record.username}" 吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
       // 调用删除API
       await deleteUser(record.userId)
       message.success('删除用户成功')
       refreshTable()
    }
  })
}

// 新增/编辑用户弹框
const userModal = ref({
  visible: false,
  title: '新增用户',
  loading: false,
  type: 'add' // 'add' 或 'edit'
})

const userFormRef = ref<FormInstance>()
const userForm = ref<{
  userId?: number
  username: string
  email: string
  phone: string
  password: string
  profile: string
  isActive: boolean
  fileList: never[]
  uploading: boolean
}>({
  userId: undefined,
  username: '',
  email: '',
  phone: '',
  password: '',
  profile: '',
  isActive: true,
  fileList: [],
  uploading: false
})

// 表单验证规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 用户表单提交
const handleUserModalOk = async () => {
  try {
    await userFormRef.value?.validate()
    userModal.value.loading = true
    
    if (userModal.value.type === 'add') {
      // 调用新增API
      await createUser({
        username: userForm.value.username,
        email: userForm.value.email,
        phone: userForm.value.phone,
        password: userForm.value.password,
        profile: userForm.value.profile,
        isActive: userForm.value.isActive ? 1 : 0
      })
      message.success('新增用户成功')
    } else {
      // 调用编辑API
      await updateUser({
        userId: userForm.value.userId,
        username: userForm.value.username,
        email: userForm.value.email,
        phone: userForm.value.phone,
        profile: userForm.value.profile,
        isActive: userForm.value.isActive ? 1 : 0
      })
      message.success('编辑用户成功')
    }
    
    userModal.value.visible = false
    userModal.value.loading = false
    // 刷新表格数据
    refreshTable()
  } catch (error) {
    console.error('操作失败:', error) 
    message.error('操作失败')
  } finally {
    userModal.value.loading = false
  }
}

// 关闭用户弹框
const handleUserModalCancel = () => {
  userModal.value.visible = false
  userFormRef.value?.resetFields()
}

// 头像上传前校验
const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传JPG/PNG格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过2MB!')
  }
  return isJpgOrPng && isLt2M
}

// 头像上传变化处理
const handleAvatarChange = (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    userForm.value.uploading = true
    return
  }
  if (info.file.status === 'done') {
    userForm.value.uploading = false
    userForm.value.profile = info.file.response.data.url
  }
}

// 导入用户
const handleImport = () => {
  importModal.value.visible = true
}

// 导入文件上传前校验
const beforeImportUpload = (file: File) => {
  const isExcel = /\.(xlsx|xls|csv)$/.test(file.name)
  if (!isExcel) {
    message.error('只能上传Excel、CSV文件!')
  }
  return isExcel
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
    await importUsers(file)
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

// 关闭导入弹框
const handleImportCancel = () => {
  importModal.value.visible = false
  importModal.value.fileList = []
}

// 下载导入模板
const downloadTemplate = async () => {
  try {
    const res = await getUserTemplateUrl()
    const url = res.data.download_url
    
    // 创建一个隐藏的a标签用于下载
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '用户导入模板.xlsx') // 设置下载文件名
    
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

// 导入相关
const importModal = ref({
  visible: false,
  loading: false,
  fileList: []
})

// 选择功能相关
const selectedRowKeys = ref<number[]>([])

// 选择变化处理函数
const handleSelectionChange = (keys: number[]) => {
  selectedRowKeys.value = keys
}

// 批量删除处理
const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) return
  
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        // 调用批量删除 API
        await batchDeleteUsers(selectedRowKeys.value)
        message.success('删除成功')
        // 清空选中项
        selectedRowKeys.value = []
        // 刷新表格
        refreshTable()
      } catch (error) {
        message.error('删除失败')
      }
    }
  })
}

// 添加加载状态
const loading = ref(false)

// 列设置相关
const STORAGE_KEY = 'users_table_columns'
const columnSettingVisible = ref(false)
const checkedColumns = ref<string[]>([])

// 初始化选中的列
const initCheckedColumns = () => {
  // 从 localStorage 读取保存的列设置
  const savedColumns = localStorage.getItem(STORAGE_KEY)
  if (savedColumns) {
    checkedColumns.value = JSON.parse(savedColumns)
  } else {
    // 如果没有保存的设置，使用默认值
    checkedColumns.value = columns
      .filter(col => col.key !== 'action') // 操作列始终显示
      .map(col => col.key)
  }
}

// 列设置变化处理
const handleColumnSettingChange = (checkedKeys: string[]) => {
  checkedColumns.value = checkedKeys
  // 保存到 localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedKeys))
}

// 显示的列配置
const visibleColumns = computed(() => {
  return columns.filter(col => 
    col.key === 'action' || checkedColumns.value.includes(col.key)
  )
})

// 添加初始化加载
onMounted(() => {
  initCheckedColumns()
  onSearch()
})

// 可选：添加 watch 来监听列设置变化并保存
watch(checkedColumns, (newValue) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
}, { deep: true })

// 导出用户
const handleExport = async () => {
  try {
    // 使用当前搜索条件作为导出参数
    const params = {
      username: searchForm.value.username,
      email: searchForm.value.email,
      phone: searchForm.value.phone,
      wechatId: searchForm.value.wechatId,
      isActive: searchForm.value.isActive,
      startTime: searchForm.value.dateRange?.[0]?.format('YYYY-MM-DD 00:00:00'),
      endTime: searchForm.value.dateRange?.[1]?.format('YYYY-MM-DD 00:00:00')
    }

    const res = await exportUsers(params)
    const url = res.data.download_url
    
    // 创建一个隐藏的a标签用于下载
    const link = document.createElement('a')
    link.style.display = 'none'
    link.href = url
    link.setAttribute('download', '用户数据.xlsx') // 设置下载文件名
    
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

// 文件变化处理
const handleFileChange = (file: File) => {
  importModal.value.fileList = [{
    originFileObj: file,
    name: file.name
  }]
}

// 角色选择弹框数据
const roleModal = ref({
  visible: false,
  loading: false
})

const currentUserId = ref<number>()
const selectedRoleIds = ref<number[]>([])
const roleList = ref<Role[]>([])
const roleLoading = ref(false)

// 穿梭框数据源
const transferDataSource = computed(() => {
  return roleList.value.map(role => ({
    key: role.roleId,
    title: `${role.roleName} (${role.roleCode})`,
    description: role.description,
    roleCode: role.roleCode,
    roleName: role.roleName
  }))
})

// 穿梭框搜索过滤方法
const filterTransferOption = (inputValue: string, item: any) => {
  return item.title.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
         item.roleCode.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
         item.roleName.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
}



// 修改加载角色列表方法
const loadRoleList = async () => {
  try {
    roleLoading.value = true
    const res = await getRoleList({
      pageNo: 1,
      pageSize: 9999,
      isActive: 1 // 只获取激活的角色
    })
    roleList.value = res.data.roleList.records
  } catch (error) {
    console.error('获取角色列表失败:', error)
    message.error('获取角色列表失败')
  } finally {
    roleLoading.value = false
  }
}

// 打开角色绑定弹框
const handleBindRole = async (record: User) => {
  currentUserId.value = record.userId
  roleModal.value.visible = true
  selectedRoleIds.value = []
  
  // 获取用户当前角色
  try {
    const res = await getUserRole(record.userId)
    if (res.data?.roleIds) {
      selectedRoleIds.value = res.data.roleIds
    }
  } catch (error) {
    console.error('获取用户角色失败:', error)
  }

  // 加载角色列表
  await loadRoleList()
}

// 确认绑定角色
const handleRoleModalOk = async () => {
  if (!currentUserId.value) {
    message.warning('用户ID不能为空')
    return
  }

  try {
    roleModal.value.loading = true
    await bindUserRole({
      userId: currentUserId.value,
      roleIds: selectedRoleIds.value
    })
    message.success('绑定角色成功')
    roleModal.value.visible = false
  } catch (error) {
    console.error('绑定角色失败:', error)
    message.error('绑定角色失败')
  } finally {
    roleModal.value.loading = false
  }
}

// 取消绑定角色
const handleRoleModalCancel = () => {
  roleModal.value.visible = false
  currentUserId.value = undefined
  selectedRoleIds.value = []
}

</script>

<style scoped>
.users-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.top {
  flex-shrink: 0;
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

.avatar-uploader {
  :deep(.ant-upload) {
    width: 128px;
    height: 128px;
  }
  img {
    width: 128px;
    height: 128px;
    object-fit: cover;
  }
}

.mt-3 {
  margin-top: 12px;
}

.avatar-upload-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.avatar-uploader {
  :deep(.ant-upload) {
    width: 150px;
    height: 150px;
    margin: 0;
    background: #fafafa;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.3s;

    &:hover {
      border-color: #1890ff;
    }
  }
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
  }

  .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }
}

.user-modal {
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

.form-left {
  padding-right: 32px;
  border-right: 1px solid #f0f0f0;
  height: 100%;
}

.form-right {
  padding-left: 32px;
  height: 100%;
}

.form-title {
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 24px;
  line-height: 1.5;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  background: #fafafa;
  border-radius: 8px;
}

.avatar-upload-wrapper {
  margin-bottom: 16px;
}

.avatar-uploader {
  :deep(.ant-upload) {
    width: 160px;
    height: 160px;
    margin: 0;
    background: white;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #1890ff;
      
      .upload-mask {
        opacity: 1;
      }
    }
  }
}

.upload-area {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .upload-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s;

    .anticon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    span {
      font-size: 14px;
    }
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba(0, 0, 0, 0.45);

    .anticon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .upload-text {
      font-size: 14px;
    }
  }
}

.avatar-tips {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
}

/* 调整表单项样式 */
:deep(.ant-form-item) {
  margin-bottom: 24px;

  .ant-form-item-label > label {
    height: 32px;
  }

  .ant-input,
  .ant-input-password {
    height: 32px;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.import-modal {
  :deep(.ant-modal-body) {
    padding: 0;
  }
}

.import-content {
  padding: 24px;
}

.import-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  margin-bottom: 32px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1890ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 16px;
}

.step-content {
  text-align: left;
}

.step-title {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}

.step-desc {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.step-arrow {
  color: #1890ff;
  font-size: 16px;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-area {
  padding: 32px;
  background: #fafafa;
  border: 2px dashed #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;

  &:hover {
    border-color: #1890ff;
    background: #f0f7ff;
  }

  &.has-file {
    background: #e6f7ff;
    border-color: #1890ff;
  }
}

.upload-icon {
  font-size: 32px;
  color: #1890ff;
  margin-bottom: 16px;
}

.upload-text {
  .primary-text {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 8px;
  }

  .secondary-text {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
  }
}

.import-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.template-icon {
  font-size: 24px;
  color: #52c41a;
}

.template-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.template-title {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.download-btn {
  padding: 0;
  height: auto;
  
  .anticon {
    margin-right: 4px;
  }
}

.import-alert {
  :deep(.ant-alert-message) {
    font-weight: 500;
    margin-bottom: 8px;
  }
}

.import-tips {
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 4px;
    color: rgba(0, 0, 0, 0.65);

    &:last-child {
      margin-bottom: 0;
    }
  }
}

</style> 