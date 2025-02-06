<template>
  <div class="permissions-container">
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
            <!-- 权限编码搜索 -->
            <a-col :span="6">
              <a-form-item label="权限编码">
                <a-input
                  v-model:value="searchForm.permissionCode"
                  placeholder="请输入权限编码"
                  allowClear
                />
              </a-form-item>
            </a-col>

            <!-- 权限名称搜索 -->
            <a-col :span="6">
              <a-form-item label="权限名称">
                <a-input
                  v-model:value="searchForm.permissionName"
                  placeholder="请输入权限名称"
                  allowClear
                />
              </a-form-item>
            </a-col>

            <!-- 状态搜索 -->
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
          :data-source="permissionList"
          :pagination="pagination"
          :loading="loading"
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onChange: handleSelectionChange,
          }"
          :row-key="(record: Permission) => record.permissionId"
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
            <!-- 操作列 -->
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="primary" @click="handleEdit(record)">编辑</a-button>
                <a-button type="primary" danger @click="handleDelete(record)">删除</a-button>
                <a-button type="primary" @click="handleAssignResource(record)">分配资源</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新增/编辑权限弹框 -->
    <a-modal
      v-model:open="permissionModal.visible"
      :title="permissionModal.title"
      :confirm-loading="permissionModal.loading"
      @ok="handlePermissionModalOk"
      @cancel="handlePermissionModalCancel"
      width="600px"
    >
      <a-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionRules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 19 }"
      >
        <a-form-item label="权限编码" name="permissionCode">
          <a-input
            v-model:value="permissionForm.permissionCode"
            placeholder="请输入权限编码"
            :disabled="permissionModal.type === 'edit'"
          />
        </a-form-item>

        <a-form-item label="权限名称" name="permissionName">
          <a-input
            v-model:value="permissionForm.permissionName"
            placeholder="请输入权限名称"
          />
        </a-form-item>

        <a-form-item label="权限描述" name="description">
          <a-textarea
            v-model:value="permissionForm.description"
            :rows="4"
            placeholder="请输入权限描述"
          />
        </a-form-item>

        <a-form-item label="状态" name="isActive">
          <a-radio-group v-model:value="permissionForm.isActive">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
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

    <!-- 资源分配弹框 -->
    <a-modal
      v-model:open="resourceModal.visible"
      :width="900"
      :style="{ height: '700px' }"
      @ok="handleResourceModalOk" 
      @cancel="handleResourceModalCancel"
      :confirm-loading="resourceModal.loading"
      title="分配资源"
      okText="确定"
      cancelText="取消"
    >
      <a-table
        :columns="resourceColumns"
        :data-source="resourceTableData"
        :loading="resourceLoading"
        :pagination="false"
        :row-selection="{
          selectedRowKeys: selectedResourceIds,
          onChange: (keys) => selectedResourceIds = keys
        }"
        size="small"
        :scroll="{ x: 1500, y: true }"
        />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, resolveComponent } from "vue";
import type { TablePaginationConfig } from "ant-design-vue";
import {
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  DownOutlined,
  UpOutlined
} from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import dayjs from "dayjs";
import {
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermission,
  batchDeletePermissions,
  getPermissionTemplateUrl,
  importPermissions,
  exportPermissions,
  type Permission,
  type PermissionListParams,
  type PermissionFormData,
  getPermissionResource,
  bindPermissionResource
} from '@/api/permissions'
import { type Resource } from '@/api/resources'
import {getPageResourceList} from '@/api/resources'
import { sourceMapsEnabled } from "process";


// 表格列定义
const columns = [
  {
    title: "权限ID",
    dataIndex: "permissionId",
    key: "permissionId",
    width: 80,
    sorter: true,
  },
  {
    title: "权限编码",
    dataIndex: "permissionCode",
    key: "permissionCode",
    width: 120,
    sorter: true,
  },
  {
    title: "权限名称",
    dataIndex: "permissionName",
    key: "permissionName",
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
    width: 80,
    sorter: true,
    customRender: ({ text }) => {
      return h(resolveComponent('a-tag'), {
        color: text === 1 ? 'success' : 'error'
      }, () => text === 1 ? '启用' : '禁用');
    }
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
    width: 220,
    fixed: "right",
  },
];

// 搜索表单数据
const searchForm = ref({
  permissionCode: "",
  permissionName: "",
  isActive: undefined as undefined | number,
  dateRange: null as any,
});

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);

// 权限列表数据
const permissionList = ref<Permission[]>([]);


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
    permissionCode: "",
    permissionName: "",
    isActive: undefined,
    dateRange: null,
  };
  onSearch();
};

// 搜索处理
const onSearch = async () => {
  try {
    loading.value = true;
    currentPage.value = 1;

    const params: PermissionListParams = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      permissionCode: searchForm.value.permissionCode,
      permissionName: searchForm.value.permissionName,
      isActive: searchForm.value.isActive,
      startTime: searchForm.value.dateRange?.[0]?.format('YYYY-MM-DD 00:00:00'),
      endTime: searchForm.value.dateRange?.[1]?.format('YYYY-MM-DD 00:00:00')
    };

    const res = await getPermissionList(params);
    permissionList.value = res.data.permissionList.records;
    total.value = res.data.permissionList.total;
  } catch (error) {
    console.error('查询失败:', error);
    message.error('查询失败');
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
    const params: PermissionListParams = {
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      permissionCode: searchForm.value.permissionCode,
      permissionName: searchForm.value.permissionName,
      isActive: searchForm.value.isActive,
      startTime: searchForm.value.dateRange?.[0]?.format('YYYY-MM-DD 00:00:00'),
      endTime: searchForm.value.dateRange?.[1]?.format('YYYY-MM-DD 00:00:00'),
      orderBy,
      orderType
    };

    const res = await getPermissionList(params);
    permissionList.value = res.data.permissionList.records;
    total.value = res.data.permissionList.total;
  } catch (error) {
    console.error('查询失败:', error);
    message.error('查询失败');
  } finally {
    loading.value = false;
  }
};

// 新增/编辑权限弹框
const permissionModal = ref({
  visible: false,
  title: "新增权限",
  loading: false,
  type: "add", // 'add' 或 'edit'
});

const permissionFormRef = ref<FormInstance>();
const permissionForm = ref({
  permissionId: undefined,
  permissionCode: "",
  permissionName: "",
  description: "",
  isActive: 1,
});

// 表单验证规则
const permissionRules = {
  permissionCode: [
    { required: true, message: "请输入权限编码", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  permissionName: [
    { required: true, message: "请输入权限名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ]
};

// 新增权限
const handleAdd = () => {
  permissionModal.value.type = "add";
  permissionModal.value.title = "新增权限";
  permissionModal.value.visible = true;
  permissionForm.value = {
    permissionId: undefined,
    permissionCode: "",
    permissionName: "",
    description: "",
    isActive: 1,
  };
};

// 编辑权限
const handleEdit = (record: Permission) => {
  permissionModal.value.type = "edit";
  permissionModal.value.title = "编辑权限";
  permissionModal.value.visible = true;
  permissionForm.value = {
    permissionId: record.permissionId,
    permissionCode: record.permissionCode,
    permissionName: record.permissionName,
    description: record.description,
    isActive: record.isActive,
  };
};

// 删除权限
const handleDelete = (record: Permission) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除权限 "${record.permissionName}" 吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await deletePermission(record.permissionId);
        message.success('删除权限成功');
        refreshTable();
      } catch (error) {
        message.error('删除失败');
      }
    }
  });
};

// 权限表单提交
const handlePermissionModalOk = async () => {
  try {
    await permissionFormRef.value?.validate();
    permissionModal.value.loading = true;

    const formData: PermissionFormData = {
      permissionCode: permissionForm.value.permissionCode,
      permissionName: permissionForm.value.permissionName,
      description: permissionForm.value.description,
      isActive: permissionForm.value.isActive,
      ...(permissionModal.value.type === 'edit' ? {
        permissionId: permissionForm.value.permissionId
      } : {})
    };

    if (permissionModal.value.type === 'add') {
      await createPermission(formData);
      message.success('新增权限成功');
    } else {
      await updatePermission(formData);
      message.success('编辑权限成功');
    }

    permissionModal.value.visible = false;
    permissionModal.value.loading = false;
    refreshTable();
  } catch (error) {
    console.error('操作失败:', error);
    message.error('操作失败');
  } finally {
    permissionModal.value.loading = false;
  }
};

// 关闭权限弹框
const handlePermissionModalCancel = () => {
  permissionModal.value.visible = false;
  permissionFormRef.value?.resetFields();
};

// 列设置相关
const STORAGE_KEY = "permissions_table_columns";
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

// 选择相关
const selectedRowKeys = ref<number[]>([]);

// 选择变化处理函数
const handleSelectionChange = (keys: number[]) => {
  selectedRowKeys.value = keys;
};

// 批量删除处理
const handleBatchDelete = () => {
  if (!selectedRowKeys.value.length) return;

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个权限吗？`,
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await batchDeletePermissions(selectedRowKeys.value);
        message.success('删除成功');
        selectedRowKeys.value = [];
        refreshTable();
      } catch (error) {
        message.error('删除失败');
      }
    }
  });
};

// 资源分配弹框数据
const resourceModal = ref({
  visible: false,
  loading: false
});

const selectedResourceIds = ref<number[]>([]);

// 资源列表数据
const resourceList = ref<Resource[]>([]);

// 修改资源表格列定义
const resourceColumns = [
  {
    title: '资源名称',
    dataIndex: 'resourceName',
    key: 'resourceName',
    width: 300,
    customRender: ({ text, record }) => {
      // 根据层级缩进
      const indent = record.level * 24;
      return h('div', {
        style: { paddingLeft: indent + 'px' }
      }, [
        // 显示资源类型标签
        h(resolveComponent('a-tag'), {
          color: record.resourceType === 'page' ? 'blue' : 
                 record.resourceType === 'operation' ? 'green' : 
                 record.resourceType === 'data' ? 'orange' : undefined,
          style: { marginRight: '8px' }
        }, () => record.resourceType === 'page' ? '页面' :
                  record.resourceType === 'operation' ? '操作' :
                  record.resourceType === 'data' ? '数据' : ''),
        // 资源名称
        text
      ]);
    }
  },
  {
    title: '资源编码',
    dataIndex: 'resourceCode',
    key: 'resourceCode',
    width: 200
  },
  {
    title: '资源路径',
    dataIndex: 'path',
    key: 'path',
    ellipsis: true
  }
];

// 修改加载资源列表的方法
const loadResourceList = async () => {
  try {
    resourceLoading.value = true;
    const res = await getPageResourceList({
      pageNo: 1,
      pageSize: 9999,
      isActive: 1
    });
    // 确保从响应中正确获取数据
    resourceList.value = res.data.records || []; // 修改这里，根据实际的API响应结构
    console.log('加载的资源列表:', resourceList.value); // 添加日志用于调试
  } catch (error) {
    console.error('获取资源列表失败:', error);
    message.error('获取资源列表失败');
  } finally {
    resourceLoading.value = false;
  }
};

// 修改资源数据处理方法，添加日志
const buildResourceList = (resources: Resource[]): any[] => {
  //console.log('开始构建资源列表，原始数据:', resources); // 添加日志

  // 构建页面层级树
  const buildPageTree = (parentId: number | null = null, level: number = 0): any[] => {
    // 获取当前层级的页面
    const pages = resources.filter(r => 
      r.resourceType === 'page' && 
      (parentId === null ? !r.parentId : r.parentId === parentId)
    );
    
    //console.log(`当前层级(${level})的页面:`, pages); // 添加日志
    
    const result: any[] = [];
    
    // 处理每个页面及其子资源
    pages.forEach(page => {
      // 添加页面本身
      result.push({
        ...page,
        key: page.resourceId,
        level
      });
      
      // 添加页面的操作权限
      const operations = resources.filter(r => 
        r.resourceType === 'operation' && r.parentId === page.resourceId
      );
      if (operations.length) {
        result.push(...operations.map(op => ({
          ...op,
          key: op.resourceId,
          level: level + 1
        })));
      }
      
      // 添加页面的数据权限
      const dataPerms = resources.filter(r => 
        r.resourceType === 'data' && r.parentId === page.resourceId
      );
      if (dataPerms.length) {
        result.push(...dataPerms.map(data => ({
          ...data,
          key: data.resourceId,
          level: level + 1
        })));
      }
      
      // 递归处理子页面
      const children = buildPageTree(page.resourceId, level + 1);
      if (children.length) {
        result.push(...children);
      }
    });
    
    return result;
  };
  
  const result = buildPageTree();
  //console.log('构建完成的资源列表:', result); // 添加日志
  return result;
};

// 修改资源表格数据计算属性
const resourceTableData = computed(() => {
  const data = buildResourceList(resourceList.value);
  //console.log('计算属性生成的表格数据:', data); // 添加日志
  return data;
});

// 修改 handleAssignResource 方法，确保正确的调用顺序
const handleAssignResource = async (record: Permission) => {
  try {
    currentPermissionId.value = record.permissionId;
    resourceModal.value.visible = true;
    selectedResourceIds.value = [];
    resourceLoading.value = true;
    
    // 并行加载资源列表和当前权限的资源
    const [resourceListRes, permissionResourceRes] = await Promise.all([
      getPageResourceList({
        pageNo: 1,
        pageSize: 9999,
        isActive: 1
      }),
      getPermissionResource(record.permissionId)
    ]);
    
    // 更新资源列表
    resourceList.value = resourceListRes.data.list.records || [];
    
    // 更新选中的资源
    if (permissionResourceRes.data?.resourceIds) {
      selectedResourceIds.value = permissionResourceRes.data.resourceIds;
    }
    
    //console.log('资源列表加载完成:', resourceList.value);
    //console.log('选中的资源ID:', selectedResourceIds.value);
    
  } catch (error) {
    //console.error('加载资源数据失败:', error);
    message.error('加载资源数据失败');
  } finally {
    resourceLoading.value = false;
  }
};

// 修改确认分配资源的方法
const handleResourceModalOk = async () => {
  if (!currentPermissionId.value) {
    message.warning('权限ID不能为空');
    return;
  }

  try {
    resourceModal.value.loading = true;
    await bindPermissionResource({
      permissionId: currentPermissionId.value,
      resourceIds: selectedResourceIds.value
    });
    message.success('分配资源成功');
    resourceModal.value.visible = false;
  } catch (error) {
    console.error('分配资源失败:', error);
    message.error('分配资源失败');
  } finally {
    resourceModal.value.loading = false;
  }
};

// 修改取消分配资源的方法
const handleResourceModalCancel = () => {
  resourceModal.value.visible = false;
  currentPermissionId.value = undefined;
  selectedResourceIds.value = [];
};

// 在 script setup 中的其他 ref 定义附近添加
const currentPermissionId = ref<number>();
const resourceLoading = ref(false);

// 初始化
onMounted(() => {
  initCheckedColumns();
  onSearch();
});
</script>

<style scoped>
.permissions-container {
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

</style>
