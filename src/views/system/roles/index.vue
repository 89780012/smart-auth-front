<template>
  <div class="roles-container">
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
          @keyup.enter="onSearch"
        >
          <a-row :gutter="24">
            <!-- 角色编码搜索 -->
            <a-col :span="6">
              <a-form-item label="角色编码">
                <a-input
                  v-model:value="searchForm.roleCode"
                  placeholder="请输入角色编码"
                  allowClear
                />
              </a-form-item>
            </a-col>

            <!-- 角色名称搜索 -->
            <a-col :span="6">
              <a-form-item label="角色名称">
                <a-input
                  v-model:value="searchForm.roleName"
                  placeholder="请输入角色名称"
                  allowClear
                />
              </a-form-item>
            </a-col>

            <!-- 状态筛选 -->
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
          :data-source="roleList"
          :pagination="pagination"
          :loading="loading"
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange,
          }"
          :row-key="(record: Role) => record.roleId"
          size="small"
          :bordered="true"
          :scroll="{ x: 1500, y: true }"
          @change="handleTableChange"
          :locale="{
            triggerDesc: '点击降序',
            triggerAsc: '点击升序',
            cancelSort: '取消排序',
          }"
        >
          <template #bodyCell="{ column, record }">
            <!-- 状态列 -->
            <template v-if="column.key === 'isActive'">
              <a-tag :color="record.isActive ? 'success' : 'error'">
                {{ record.isActive ? "启用" : "禁用" }}
              </a-tag>
            </template>

            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="primary" @click="handleEdit(record)">编辑</a-button>
                <a-button type="primary" danger @click="handleDelete(record)">删除</a-button>
                <a-button type="primary" @click="handleBindUser(record)">绑定用户</a-button>
                <a-button type="primary" @click="handleBindPermission(record)">绑定权限</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新增/编辑角色弹框 -->
    <a-modal
      v-model:open="roleModal.visible"
      :title="roleModal.title"
      :confirm-loading="roleModal.loading"
      @ok="handleRoleModalOk"
      @cancel="handleRoleModalCancel"
      width="600px"
    >
      <a-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 19 }"
      >
        <a-form-item label="角色编码" name="roleCode">
          <a-input
            v-model:value="roleForm.roleCode"
            placeholder="请输入角色编码"
            :disabled="roleModal.type === 'edit'"
          />
        </a-form-item>

        <a-form-item label="角色名称" name="roleName">
          <a-input
            v-model:value="roleForm.roleName"
            placeholder="请输入角色名称"
          />
        </a-form-item>

        <a-form-item label="角色描述" name="description">
          <a-textarea
            v-model:value="roleForm.description"
            :rows="4"
            placeholder="请输入角色描述"
          />
        </a-form-item>

        <a-form-item label="状态" name="isActive">
          <a-switch
            v-model:checked="roleForm.isActive"
            :checkedChildren="'启用'"
            :unCheckedChildren="'禁用'"
          />
        </a-form-item>
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

    <!-- 导入弹框 -->
    <import-modal
      v-model:visible="importModal.visible"
      :title="'导入角色'"
      :loading="importModal.loading"
      v-model:file-list="importModal.fileList"
      @ok="handleImportOk"
      @cancel="handleImportCancel"
      @download="downloadTemplate"
      @file-change="handleFileChange"
    />

    <!-- 用户选择弹框 -->
    <a-modal
      v-model:open="userModal.visible"
      title="绑定用户"
      :width="800"
      @ok="handleUserModalOk"
      @cancel="handleUserModalCancel"
      :confirm-loading="userModal.loading"
      okText="确定"
      cancelText="取消"
    >
      <a-transfer
        v-model:target-keys="selectedUserIds"
        :data-source="transferDataSource"
        :titles="['全部用户', '已选用户']"
        :render="item => item.title"
        :loading="userLoading"
        :listStyle="{
          height: '400px',
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
        @scroll="handleScroll"
        @search="handleTransferSearch"
      />
    </a-modal>

    <!-- 权限选择弹框 -->
    <a-modal
      v-model:open="permissionModal.visible"
      title="绑定权限"
      :width="800"
      @ok="handlePermissionModalOk"
      @cancel="handlePermissionModalCancel"
      :confirm-loading="permissionModal.loading"
      okText="确定"
      cancelText="取消"
    >
      <a-transfer
        v-model:target-keys="selectedPermissionIds"
        :data-source="permissionTransferDataSource"
        :titles="['全部权限', '已选权限']"
        :render="item => item.title"
        :loading="permissionLoading"
        :listStyle="{
          height: '400px',
          width: '600px'
        }"
        :show-search="true"
        :filter-option="filterPermissionTransferOption"
        :locale="{
          itemUnit: '项',
          itemsUnit: '项',
          notFoundContent: '列表为空',
          searchPlaceholder: '请输入搜索内容'
        }"
        @scroll="handlePermissionScroll"
        @search="handlePermissionTransferSearch"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { TablePaginationConfig } from "ant-design-vue";
import { Modal, message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  batchDeleteRoles,
  getRoleTemplateUrl,
  importRoles,
  exportRoles,
} from "@/api/roles";
import type { Role } from "@/api/roles";
import dayjs from "dayjs";
import ImportModal from "@/components/ImportModal.vue";
import { getUserList } from '@/api/user'
import { bindRoleUser, getRoleUser } from '@/api/roles'
import type { User } from '@/api/user'
import { debounce } from 'lodash-es'
import { getPermissionList } from '@/api/permissions'
import type { Permission } from '@/api/permissions'
import { bindRolePermission, getRolePermissions } from '@/api/roles'

// 表格列定义
const columns = [
  {
    title: "角色ID",
    dataIndex: "roleId",
    key: "roleId",
    width: 80,
    sorter: true,
  },
  {
    title: "角色编码",
    dataIndex: "roleCode",
    key: "roleCode",
    width: 120,
    sorter: true,
  },
  {
    title: "角色名称",
    dataIndex: "roleName",
    key: "roleName",
    sorter: true,
  },
  {
    title: "描述",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "状态",
    dataIndex: "isActive",
    key: "isActive",
    width: 100,
    sorter: true,
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    key: "createdAt",
    sorter: true,
  },
  {
    title: "更新时间",
    dataIndex: "updatedAt",
    key: "updatedAt",
    sorter: true,
  },
  {
    title: "操作",
    key: "action",
    width: 300,
    fixed: "right",
  },
];

// 搜索表单数据
const searchForm = ref({
  roleId: "",
  roleCode: "",
  roleName: "",
  dateRange: null as any,
  isActive: undefined,
});

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);

const currentRoleId = ref<number>()
const selectedPermissionIds = ref<number[]>([])
const permissionList = ref<Permission[]>([])
const permissionLoading = ref(false)
const selectedUserIds = ref<number[]>([])
const userList = ref<User[]>([])
const userLoading = ref(false)

// 角色列表数据
const roleList = ref<Role[]>([]);

// 格式化日期时间
const formatDateTime = (date: string) => {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

// 分页配置
const pagination = computed<TablePaginationConfig>(() => ({
  total: total.value,
  current: currentPage.value,
  pageSize: pageSize.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ["10", "20", "50", "100"],
}));

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    roleId: "",
    roleCode: "",
    roleName: "",
    dateRange: null as any,
    isActive: undefined,
  };
  onSearch();
};

// 搜索处理
const onSearch = async () => {
  try {
    loading.value = true;
    currentPage.value = 1;

    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      roleCode: searchForm.value.roleCode,
      roleName: searchForm.value.roleName,
      startTime: searchForm.value.dateRange?.[0]?.format("YYYY-MM-DD 00:00:00"),
      endTime: searchForm.value.dateRange?.[1]?.format("YYYY-MM-DD 00:00:00"),
      isActive:
        searchForm.value.isActive !== undefined
          ? Number(searchForm.value.isActive)
          : undefined,
    };

    const res = await getRoleList(params);
    roleList.value = res.data.roleList.records.map((record) => ({
      ...record,
      isActive: Boolean(record.isActive),
    }));
    total.value = res.data.roleList.total;
  } catch (error) {
    console.error("查询失败:", error);
    message.error("查询失败");
  } finally {
    loading.value = false;
  }
};

// 刷新表格
const refreshTable = () => {
  selectedRowKeys.value = [];
  currentPage.value = 1;
  onSearch();
};

// 表格变化处理
const handleTableChange = async (
  pagination: TablePaginationConfig,
  filters: Record<string, string[]>,
  sorter: any
) => {
  currentPage.value = pagination.current || 1;
  pageSize.value = pagination.pageSize || 10;

  let orderBy = "";
  let orderType = "";

  if (sorter.field && sorter.order) {
    orderBy = sorter.field;
    if (sorter.order === 'ascend') {
      orderType = 'asc';
    } else {
      orderType = 'desc';
    }
  }

  try {
    loading.value = true;
    const params = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      roleName: searchForm.value.roleName,
      startTime: searchForm.value.dateRange?.[0]?.format("YYYY-MM-DD 00:00:00"),
      endTime: searchForm.value.dateRange?.[1]?.format("YYYY-MM-DD 00:00:00"),
      orderBy,
      orderType,
    };

    const res = await getRoleList(params);
    roleList.value = res.data.roleList.records;
    total.value = res.data.roleList.total;
  } catch (error) {
    console.error("查询失败:", error);
    message.error("查询失败");
  } finally {
    loading.value = false;
  }
};

// 新增/编辑角色弹框
const roleModal = ref({
  visible: false,
  title: "新增角色",
  loading: false,
  type: "add", // 'add' 或 'edit'
});

const roleFormRef = ref<FormInstance>();
const roleForm = ref({
  roleId: undefined,
  roleCode: "",
  roleName: "",
  description: "",
  isActive: true,
});

// 表单验证规则
const roleRules = {
  roleCode: [
    { required: true, message: "请输入角色编码", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  roleName: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
};

// 新增角色
const handleAdd = () => {
  roleModal.value.type = "add";
  roleModal.value.title = "新增角色";
  roleModal.value.visible = true;
  roleForm.value = {
    roleId: undefined,
    roleCode: "",
    roleName: "",
    description: "",
    isActive: true,
  };
};

// 编辑角色
const handleEdit = (record: Role) => {
  roleModal.value.type = "edit";
  roleModal.value.title = "编辑角色";
  roleModal.value.visible = true;
  roleForm.value = {
    roleId: record.roleId,
    roleCode: record.roleCode,
    roleName: record.roleName,
    description: record.description,
    isActive: Boolean(record.isActive),
  };
};

// 删除角色
const handleDelete = (record: Role) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除角色 "${record.roleName}" 吗？`,
    okText: "确定",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        await deleteRole(record.roleId);
        message.success("删除角色成功");
        refreshTable();
      } catch (error) {
        message.error("删除失败");
      }
    },
  });
};

// 角色表单提交
const handleRoleModalOk = async () => {
  try {
    await roleFormRef.value?.validate();
    roleModal.value.loading = true;

    const formData = {
      ...roleForm.value,
      isActive: Number(roleForm.value.isActive),
    };

    if (roleModal.value.type === "add") {
      await createRole(formData);
      message.success("新增角色成功");
    } else {
      await updateRole(formData);
      message.success("编辑角色成功");
    }

    roleModal.value.visible = false;
    roleModal.value.loading = false;
    refreshTable();
  } catch (error) {
    console.error("操作失败:", error);
    message.error("操作失败");
  } finally {
    roleModal.value.loading = false;
  }
};

// 关闭角色弹框
const handleRoleModalCancel = () => {
  roleModal.value.visible = false;
  roleFormRef.value?.resetFields();
};

// 列设置相关
const STORAGE_KEY = "roles_table_columns";
const columnSettingVisible = ref(false);
const checkedColumns = ref<string[]>([]);

// 初始化选中的列
const initCheckedColumns = () => {
  const savedColumns = localStorage.getItem(STORAGE_KEY);
  if (savedColumns) {
    checkedColumns.value = JSON.parse(savedColumns);
  } else {
    checkedColumns.value = columns
      .filter((col) => col.key !== "action")
      .map((col) => col.key);
  }
};

// 列设置变化处理
const handleColumnSettingChange = (checkedKeys: string[]) => {
  checkedColumns.value = checkedKeys;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedKeys));
};

// 显示的列配置
const visibleColumns = computed(() => {
  return columns.filter(
    (col) => col.key === "action" || checkedColumns.value.includes(col.key)
  );
});

// 添加选择相关变量
const selectedRowKeys = ref<number[]>([]);

// 添加导入相关变量
const importModal = ref({
  visible: false,
  loading: false,
  fileList: [],
});

// 选择变化处理函数
const handleSelectionChange = (keys: number[]) => {
  selectedRowKeys.value = keys;
};

// 批量删除处理
const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) return;

  Modal.confirm({
    title: "确认删除",
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个角色吗？`,
    okText: "确定",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        await batchDeleteRoles(selectedRowKeys.value);
        message.success("删除成功");
        selectedRowKeys.value = [];
        refreshTable();
      } catch (error) {
        message.error("删除失败");
      }
    },
  });
};

// 导入相关方法
const handleImport = () => {
  importModal.value.visible = true;
};

const handleImportOk = async () => {
  if (importModal.value.fileList.length === 0) {
    message.error("请选择要导入的文件!");
    return;
  }

  try {
    importModal.value.loading = true;
    const file = importModal.value.fileList[0].originFileObj;
    await importRoles(file);
    message.success("导入成功!");
    importModal.value.visible = false;
    importModal.value.fileList = [];
    refreshTable();
  } catch (error) {
    console.error("导入失败:", error);
    message.error("导入失败!");
  } finally {
    importModal.value.loading = false;
  }
};

const handleImportCancel = () => {
  importModal.value.visible = false;
  importModal.value.fileList = [];
};

const downloadTemplate = async () => {
  try {
    const res = await getRoleTemplateUrl();
    const url = res.data.download_url;
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", "角色导入模板.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("下载模板失败:", error);
    message.error("下载模板失败");
  }
};

// 导出方法
const handleExport = async () => {
  try {
    const params = {
      roleName: searchForm.value.roleName,
      startTime: searchForm.value.dateRange?.[0]?.format("YYYY-MM-DD 00:00:00"),
      endTime: searchForm.value.dateRange?.[1]?.format("YYYY-MM-DD 00:00:00"),
    };

    const res = await exportRoles(params);
    const url = res.data.download_url;
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", "角色数据.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    message.error("导出失败");
  }
};

// 文件变化处理
const handleFileChange = (file: File) => {
  importModal.value.fileList = [
    {
      originFileObj: file,
      name: file.name,
    },
  ];
};

// 用户选择弹框数据
const userModal = ref({
  visible: false,
  loading: false
})



// 用户列表分页参数
const userPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

// 用户搜索关键词
const userSearchKeyword = ref('')

// 添加已选用户数据缓存
const selectedUserCache = ref<User[]>([])

// 修改计算属性,合并左侧和右侧数据
const transferDataSource = computed(() => {
  // 合并左侧列表数据和已选用户缓存数据
  const allUsers = new Map()
  
  // 添加左侧分页数据
  userList.value.forEach(user => {
    allUsers.set(user.userId, {
      key: user.userId,
      title: `${user.username} (${user.email})`,
      description: user.phone,
      username: user.username,
      email: user.email
    })
  })
  
  // 添加已选用户缓存数据
  selectedUserCache.value.forEach(user => {
    if (!allUsers.has(user.userId)) {
      allUsers.set(user.userId, {
        key: user.userId,
        title: `${user.username} (${user.email})`,
        description: user.phone,
        username: user.username,
        email: user.email
      })
    }
  })

  return Array.from(allUsers.values())
})

// 防抖处理的搜索方法
const debouncedSearch = debounce(async (keyword: string) => {
  userPagination.value.current = 1
  userSearchKeyword.value = keyword
  await loadUserList()
}, 300)

const currentSearchDirection = ref<'left' | 'right'>('left')
// 修改 filterTransferOption 方法,区分左右侧搜索
const filterTransferOption = (inputValue: string, item: any) => {

  if (currentSearchDirection.value === 'left') {
    // 左侧远程搜索
    if (userSearchKeyword.value !== inputValue) {
      debouncedSearch(inputValue)
    }
    return true // 让输入框可以实时显示用户输入的内容
  } else {
    // 右侧本地过滤
    return item.username.toLowerCase().includes(inputValue.toLowerCase()) || 
           item.email.toLowerCase().includes(inputValue.toLowerCase())
  }
}

// 加载用户列表
const loadUserList = async () => {
  try {
    userLoading.value = true
    const res = await getUserList({
      pageNo: userPagination.value.current,
      pageSize: userPagination.value.pageSize,
      isActive: 1, // 只获取激活的用户
      username: userSearchKeyword.value // 将关键词用作用户名搜索
    })
    
    if (userPagination.value.current === 1) {
      userList.value = res.data.userList.records
    } else {
      userList.value = [...userList.value, ...res.data.userList.records]
    }
    
    userPagination.value.total = res.data.userList.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
    message.error('获取用户列表失败')
  } finally {
    userLoading.value = false
  }
}

// 处理滚动加载更多
const handleScroll = async (direction: any, e: any) => {
  // 只处理左侧列表的滚动
  if (direction !== 'left') return
  if (userLoading.value) return

  const { scrollTop, clientHeight, scrollHeight } = e.target;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (userList.value.length < userPagination.value.total) {
        userPagination.value.current++
        await loadUserList()
      }
  }
}

// 修改打开用户绑定弹框方法
const handleBindUser = async (record: Role) => {
  currentRoleId.value = record.roleId
  userModal.value.visible = true
  selectedUserIds.value = []
  userPagination.value.current = 1
  userSearchKeyword.value = ''
  
  // 获取角色当前用户完整数据
  try {
    const res = await getRoleUser(record.roleId)
    if (res.data?.userIds) {
      selectedUserIds.value = res.data.userIds
      // 获取已选用户的详细信息
      const selectedUsersRes = await getUserList({
        userIds: res.data.userIds,
        pageSize: 9999,
        pageNo: 1
      })
      selectedUserCache.value = selectedUsersRes.data.userList.records
    }
  } catch (error) {
    console.error('获取角色用户失败:', error)
  }

  // 加载左侧用户列表
  await loadUserList()
}

// 修改关闭弹框方法,清空缓存
const handleUserModalCancel = () => {
  userModal.value.visible = false
  currentRoleId.value = undefined
  selectedUserIds.value = []
  selectedUserCache.value = []
}

// 添加搜索处理方法
const handleTransferSearch = (dir: 'left' | 'right', value: string) => {
  currentSearchDirection.value = dir
  if (dir === 'left') {
    // 左侧搜索时清空时触发查询
    if (!value) {
      userSearchKeyword.value = ''
      userPagination.value.current = 1
      loadUserList()
    }
  }
}

// 确认绑定用户
const handleUserModalOk = async () => {
  if (!currentRoleId.value) {
    message.warning('角色ID不能为空')
    return
  }

  try {
    userModal.value.loading = true
    await bindRoleUser({
      roleId: currentRoleId.value,
      userIds: selectedUserIds.value
    })
    message.success('绑定用户成功')
    userModal.value.visible = false
  } catch (error) {
    console.error('绑定用户失败:', error)
    message.error('绑定用户失败')
  } finally {
    userModal.value.loading = false
  }
}

// 权限选择弹框数据
const permissionModal = ref({
  visible: false,
  loading: false
})


// 权限列表分页参数
const permissionPagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

// 权限搜索关键词
const permissionSearchKeyword = ref('')

// 已选权限数据缓存
const selectedPermissionCache = ref<Permission[]>([])

// 计算权限穿梭框数据源
const permissionTransferDataSource = computed(() => {
  const allPermissions = new Map()
  
  // 添加左侧分页数据
  permissionList.value.forEach(permission => {
    allPermissions.set(permission.permissionId, {
      key: permission.permissionId,
      title: `${permission.permissionName} (${permission.permissionCode})`,
      description: permission.description,
      permissionName: permission.permissionName,
      permissionCode: permission.permissionCode
    })
  })
  
  // 添加已选权限缓存数据
  selectedPermissionCache.value.forEach(permission => {
    if (!allPermissions.has(permission.permissionId)) {
      allPermissions.set(permission.permissionId, {
        key: permission.permissionId,
        title: `${permission.permissionName} (${permission.permissionCode})`,
        description: permission.description,
        permissionName: permission.permissionName,
        permissionCode: permission.permissionCode
      })
    }
  })
  return Array.from(allPermissions.values())
})

// 防抖处理的权限搜索方法
const debouncedPermissionSearch = debounce(async (keyword: string) => {
  permissionPagination.value.current = 1
  permissionSearchKeyword.value = keyword
  await loadPermissionList()
}, 300)

const currentPermissionSearchDirection = ref<'left' | 'right'>('left')

// 权限穿梭框过滤方法
const filterPermissionTransferOption = (inputValue: string, item: any) => {
  if (currentPermissionSearchDirection.value === 'left') {
    if (permissionSearchKeyword.value !== inputValue) {
      debouncedPermissionSearch(inputValue)
    }
    return true
  } else {
    return item.permissionName.toLowerCase().includes(inputValue.toLowerCase()) || 
           item.permissionCode.toLowerCase().includes(inputValue.toLowerCase())
  }
}

// 加载权限列表
const loadPermissionList = async () => {
  try {
    permissionLoading.value = true
    const res = await getPermissionList({
      pageNo: permissionPagination.value.current,
      pageSize: permissionPagination.value.pageSize,
      isActive: 1,
      permissionName: permissionSearchKeyword.value
    })
    
    if (permissionPagination.value.current === 1) {
      permissionList.value = res.data.permissionList.records
    } else {
      permissionList.value = [...permissionList.value, ...res.data.permissionList.records]
    }
    
    permissionPagination.value.total = res.data.permissionList.total
  } catch (error) {
    console.error('获取权限列表失败:', error)
    message.error('获取权限列表失败')
  } finally {
    permissionLoading.value = false
  }
}

// 处理权限滚动加载
const handlePermissionScroll = async (direction: any, e: any) => {
  if (direction !== 'left') return
  if (permissionLoading.value) return

  const { scrollTop, clientHeight, scrollHeight } = e.target;

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (permissionList.value.length < permissionPagination.value.total) {
      permissionPagination.value.current++
      await loadPermissionList()
    }
  }
}

// 打开权限绑定弹框
const handleBindPermission = async (record: Role) => {
  currentRoleId.value = record.roleId
  permissionModal.value.visible = true
  selectedPermissionIds.value = []
  permissionPagination.value.current = 1
  permissionSearchKeyword.value = ''
  
  // 获取角色当前权限
  try {
    const res = await getRolePermissions(record.roleId)
    if (res.data?.permissionIds) {
      selectedPermissionIds.value = res.data.permissionIds
      // 获取已选权限的详细信息
      const selectedPermissionsRes = await getPermissionList({
        permissionIds: res.data.permissionIds,
        pageSize: 9999,
        pageNo: 1
      })
      selectedPermissionCache.value = selectedPermissionsRes.data.permissionList.records
    }
  } catch (error) {
    console.error('获取角色权限失败:', error)
  }

  // 加载左侧权限列表
  await loadPermissionList()
}

// 关闭权限弹框
const handlePermissionModalCancel = () => {
  permissionModal.value.visible = false
  currentRoleId.value = undefined
  selectedPermissionIds.value = []
  selectedPermissionCache.value = []
}

// 处理权限搜索
const handlePermissionTransferSearch = (dir: 'left' | 'right', value: string) => {
  currentPermissionSearchDirection.value = dir
  if (dir === 'left') {
    if (!value) {
      permissionSearchKeyword.value = ''
      permissionPagination.value.current = 1
      loadPermissionList()
    }
  }
}

// 确认绑定权限
const handlePermissionModalOk = async () => {
  if (!currentRoleId.value) {
    message.warning('角色ID不能为空')
    return
  }

  try {
    permissionModal.value.loading = true
    await bindRolePermission({
      roleId: currentRoleId.value,
      permissionIds: selectedPermissionIds.value
    })
    message.success('绑定权限成功')
    permissionModal.value.visible = false
  } catch (error) {
    console.error('绑定权限失败:', error)
    message.error('绑定权限失败')
  } finally {
    permissionModal.value.loading = false
  }
}

// 初始化
onMounted(() => {
  initCheckedColumns();
  onSearch();
});
</script>

<style scoped>
.roles-container {
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

.import-modal {
  :deep(.ant-modal-body) {
    padding: 0;
  }
}
</style>
