<template>
  <div class="strategy-edit">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="strategy-info">
        <h2>{{ strategyName }}</h2>
        <span class="strategy-id">ID: {{ strategyId }}</span>
      </div>
      <div class="toolbar-actions">
        <a-space>
          <a-button type="primary" @click="saveStrategy">
            <template #icon><save-outlined /></template>
            保存
          </a-button>
          <a-button @click="runTest">
            <template #icon><play-circle-outlined /></template>
            运行测试
          </a-button>
          <a-button type="primary" danger @click="backToList">
            <template #icon><rollback-outlined /></template>
            返回
          </a-button>
        </a-space>
      </div>
    </div>

    <div class="editor-main">
      <!-- 左侧文件树 -->
      <div class="file-explorer" @click="handleExplorerClick">
        <div class="explorer-header">
          <span class="header-title">文件资源管理器</span>
          <div class="header-actions">
            <a-tooltip title="展开所有">
              <expand-outlined class="action-icon" @click="expandAll" />
            </a-tooltip>
            <a-tooltip title="收起所有">
              <compress-outlined class="action-icon" @click="collapseAll" />
            </a-tooltip>
            <a-tooltip title="新建文件">
              <file-add-outlined class="action-icon" @click="addFile" />
            </a-tooltip>
            <a-tooltip title="新建文件夹">
              <folder-add-outlined class="action-icon" @click="addFolder" />
            </a-tooltip>
            <a-tooltip title="刷新">
              <reload-outlined class="action-icon" @click="refreshFiles" />
            </a-tooltip>
          </div>
        </div>
        
        <div class="explorer-search">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索文件..."
            size="small"
            @search="onSearch"
          />
        </div>

        <a-directory-tree
          class="file-tree"
          :tree-data="filteredTreeData"
          :selectedKeys="selectedKeys"
          :expandedKeys="expandedKeys"
          @select="onSelect"
          @expand="onExpand"
          :showIcon="false" 
        >
          <template #title="{ title, isLeaf }">
            <span class="tree-node">
              <template v-if="isLeaf">
                <file-outlined class="tree-icon" />
                <span class="node-text">{{ title }}</span>
              </template>
              <template v-else>
                <folder-outlined class="tree-icon" />
                <span class="node-text">{{ title }}</span>
              </template>
            </span>
          </template>
        </a-directory-tree>
      </div>

      <!-- 右侧编辑区 -->
      <div class="editor-workspace">
        <div class="editor-tabs">
          <a-tabs
            v-model:activeKey="activeTab"
            type="editable-card"
            :hide-add="true"
            @edit="onTabEdit"
            :tabBarStyle="{ borderRadius: '0' }"
          >
            <a-tab-pane
              v-for="file in openedFiles"
              :key="file.path"
              :closable="true"
            >
              <template #tab>
                <span class="tab-label">
                  <file-outlined class="tab-icon" />
                  {{ file.name }}
                </span>
              </template>
            </a-tab-pane>
          </a-tabs>
        </div>
        <!-- 添加欢迎界面 -->
        <div class="welcome-screen" v-show="!activeTab">
          <div class="welcome-content">
            <div class="quick-actions">
              <div class="action-grid">
                <div class="action-card" @click="() => openFile('strategy_demo/main.py', 'main.py')">
                  <file-outlined class="card-icon" />
                  <div class="card-content">
                    <h3>打开主文件</h3>
                    <p>编辑策略主程序文件</p>
                  </div>
                </div>
                
                <div class="action-card" @click="addFile">
                  <file-add-outlined class="card-icon" />
                  <div class="card-content">
                    <h3>新建文件</h3>
                    <p>创建新的策略文件</p>
                  </div>
                </div>
                
                <div class="action-card" @click="runTest">
                  <play-circle-outlined class="card-icon" />
                  <div class="card-content">
                    <h3>运行测试</h3>
                    <p>测试当前策略表现</p>
                  </div>
                </div>
                
                <div class="action-card">
                  <book-outlined class="card-icon" />
                  <div class="card-content">
                    <h3>查看文档</h3>
                    <p>阅读策略开发文档</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="editor-container" ref="editorRef" v-show="activeTab"></div>
      </div>
    </div>

    <a-modal
      v-model:visible="isFileModalVisible"
      title="新建文件"
      @ok="handleFileOk"
      @cancel="handleCancel"
    >
      <a-input
        v-model:value="newFileName"
        placeholder="请输入文件名(包含扩展名)"
        @pressEnter="handleFileOk"
      />
    </a-modal>

    <a-modal
      v-model:visible="isFolderModalVisible"
      title="新建文件夹"
      @ok="handleFolderOk"
      @cancel="handleCancel"
    >
      <a-input
        v-model:value="newFolderName"
        placeholder="请输入文件夹名称"
        @pressEnter="handleFolderOk"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as monaco from 'monaco-editor'
import { message } from 'ant-design-vue'
import {
  SaveOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  FileOutlined,
  FolderOutlined,
  FileAddOutlined,
  FolderAddOutlined,
  ReloadOutlined,
  ExpandOutlined,
  CompressOutlined,
  CodeOutlined,
  BookOutlined
} from '@ant-design/icons-vue'
import { debounce } from 'lodash-es'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import pythonWorker from 'monaco-editor/esm/vs/basic-languages/python/python.contribution?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

const router = useRouter()
const strategyName = ref('双均线交易策略')
const strategyId = ref('ST20240320001')
const searchText = ref('')

interface FileNode {
  title: string
  key: string
  isLeaf?: boolean
  children?: FileNode[]
}

interface OpenedFile {
  name: string
  path: string
  content: string
}

// 文件内容缓存
const fileContents = new Map<string, string>([
  ['strategy_demo/main.py', 'def main():\n    print("Hello Strategy!")'],
  ['strategy_demo/strategy.py', 'class Strategy:\n    def __init__(self):\n        pass'],
  ['strategy_demo/utils/helper.py', 'def calculate_ma(data, period):\n    return sum(data) / period'],
  ['strategy_demo/config.json', '{\n    "name": "My Strategy",\n    "version": "1.0.0"\n}']
])
// 文件树数据
const treeData = ref<FileNode[]>([
  {
    title: 'strategy_demo',
    key: 'strategy_demo',
    children: [
      {
        title: 'main.py',
        key: 'strategy_demo/main.py',
        isLeaf: true
      },
      {
        title: 'strategy.py',
        key: 'strategy_demo/strategy.py',
        isLeaf: true
      },
      {
        title: 'utils',
        key: 'strategy_demo/utils',
        children: [
          {
            title: 'helper.py',
            key: 'strategy_demo/utils/helper.py',
            isLeaf: true
          }
        ]
      },
      {
        title: 'config.json',
        key: 'strategy_demo/config.json',
        isLeaf: true
      }
    ]
  }
])

// 编辑器实例
let editor: monaco.editor.IStandaloneCodeEditor | null = null
const editorRef = ref<HTMLElement | null>(null)

window.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }

    if (label === 'python') {
      return new pythonWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

// 初始化编辑器
onMounted(() => {
  if (editorRef.value) {
    try {
      editor = monaco.editor.create(editorRef.value, {
        theme: 'vs',
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 4,
        language: 'python', // 设置默认语言
      })
    } catch (err) {
      console.error('初始化编辑器失败:', err)
      message.error('初始化编辑器失败')
    }
  }
})

// 销毁编辑器
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

// 当前选中的文件
const selectedKeys = ref<string[]>([])
const activeTab = ref('')

// 打开的文件列表
const openedFiles = ref<OpenedFile[]>([])

// 在 script setup 中添加 expandedKeys
const expandedKeys = ref<string[]>([]) // 默认展开的节点

// 选择文件
const onSelect = (keys: string[], info: any) => {
  const key = keys[0]
  selectedKeys.value = keys
  if (info.node.isLeaf) {
    openFile(key, info.node.title)
  }
}
const onExpand = (keys: string[], info: any) => {
  expandedKeys.value = keys
}

// 打开文件
const openFile = (path: string, name: string) => {
  if (!openedFiles.value.find(f => f.path === path)) {
    openedFiles.value.push({
      name,
      path,
      content: fileContents.get(path) || ''
    })
  }
  activeTab.value = path
  updateEditor(path)
}

// 更新编辑器内容
const updateEditor = (path: string) => {
  if (editor) {
    const content = fileContents.get(path) || ''
    const language = getFileLanguage(path)
    const model = monaco.editor.createModel(content, language)
    editor.setModel(model)
  }
}

// 监听标签页切换
watch(activeTab, (newPath) => {
  console.log('activeTab', newPath)
  if (newPath && editor) {
    updateEditor(newPath)
  }
})

// 获取文件语言
const getFileLanguage = (path: string) => {
  const ext = path.split('.').pop()
  const languageMap: { [key: string]: string } = {
    'py': 'python',
    'json': 'json',
    'js': 'javascript',
    'ts': 'typescript'
  }
  return languageMap[ext || ''] || 'plaintext'
}

// 标签页操作
const onTabEdit = (targetKey: string, action: 'add' | 'remove') => {
  if (action === 'remove') {
    openedFiles.value = openedFiles.value.filter(f => f.path !== targetKey)
    if (activeTab.value === targetKey) {
      activeTab.value = openedFiles.value[openedFiles.value.length - 1]?.path || ''
      if (activeTab.value) {
        updateEditor(activeTab.value)
      }
    }
  }
}

// 添加新的 ref
const isFileModalVisible = ref(false)
const isFolderModalVisible = ref(false)
const newFileName = ref('')
const newFolderName = ref('')

// 添加获取当前选中目录路径的方法
const getCurrentPath = () => {
  if (!selectedKeys.value.length) return treeData.value[0].key
  
  const selectedPath = selectedKeys.value[0]
  // 如果选中的是文件,返回其所在目录
  if (selectedPath.includes('.')) {
    return selectedPath.substring(0, selectedPath.lastIndexOf('/'))
  }
  // 如果选中的是目录,直接返回
  return selectedPath
}

// 验证名称是否合法
const validateName = (name: string, isFile = true): string | null => {
  if (!name) return '名称不能为空'
  if (name.includes('/')) return '名称不能包含斜杠'
  if (isFile && !name.includes('.')) return '文件名必须包含扩展名'
  return null
}

// 检查是否存在重名
const checkDuplicate = (path: string): boolean => {
  return fileContents.has(path)
}

// 递归更新树数据
const updateTreeData = (nodes: FileNode[], path: string, newNode: FileNode): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.key === path) {
      if (!node.children) node.children = []
      node.children.push(newNode)
      return true
    }
    if (node.children && updateTreeData(node.children, path, newNode)) {
      return true
    }
  }
  return false
}

// 新建文件
const addFile = () => {
  isFileModalVisible.value = true
  newFileName.value = ''
}

// 确认创建文件
const handleFileOk = () => {
  const error = validateName(newFileName.value, true)
  if (error) {
    message.error(error)
    return
  }

  const basePath = getCurrentPath()
  const fullPath = basePath ? `${basePath}/${newFileName.value}` : newFileName.value

  if (checkDuplicate(fullPath)) {
    message.error('文件已存在')
    return
  }

  const newNode: FileNode = {
    title: newFileName.value,
    key: fullPath,
    isLeaf: true
  }

  if (basePath) {
    updateTreeData(treeData.value, basePath, newNode)
  } else {
    treeData.value.push(newNode)
  }

  // 更新文件内容缓存
  fileContents.set(fullPath, '')
  
  // 打开新文件
  openFile(fullPath, newFileName.value)
  
  isFileModalVisible.value = false
  message.success('文件创建成功')
}

// 新建文件夹
const addFolder = () => {
  isFolderModalVisible.value = true
  newFolderName.value = ''
}

// 确认创建文件夹
const handleFolderOk = () => {
  const error = validateName(newFolderName.value, false)
  if (error) {
    message.error(error)
    return
  }

  const basePath = getCurrentPath()
  const fullPath = basePath ? `${basePath}/${newFolderName.value}` : newFolderName.value

  if (checkDuplicate(fullPath)) {
    message.error('文件夹已存在')
    return
  }

  const newNode: FileNode = {
    title: newFolderName.value,
    key: fullPath,
    children: [],
    isLeaf: false
  }

  if (basePath) {
    updateTreeData(treeData.value, basePath, newNode)
  } else {
    treeData.value.push(newNode)
  }

  isFolderModalVisible.value = false
  message.success('文件夹创建成功')
}

// 取消创建
const handleCancel = () => {
  isFileModalVisible.value = false
  isFolderModalVisible.value = false
}

// 保存策略
const saveStrategy = () => {
  // TODO: 实现保存策略功能
  message.success('策略保存成功')
}

const backToList = () => {
  router.push('/strategy')
}

const runTest = () => {
  message.success('开始运行策略测试')
}

const refreshFiles = () => {
  message.success('文件列表已刷新')
}

// 添加计算属性
const filteredTreeData = computed(() => {
  if (!searchText.value) {
    return treeData.value
  }
  return filterTree(treeData.value, searchText.value.toLowerCase())
})

// 递归过滤树节点
const filterTree = (nodes: FileNode[], keyword: string): FileNode[] => {
  return nodes.reduce((filtered: FileNode[], node) => {
    const matchesKeyword = node.title.toLowerCase().includes(keyword)
    
    if (node.children) {
      const filteredChildren = filterTree(node.children, keyword)
      if (matchesKeyword || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        })
      }
    } else if (matchesKeyword) {
      filtered.push({ ...node })
    }
    
    return filtered
  }, [])
}

// 使用防抖优化搜索
const debouncedSearch = debounce((value: string) => {
  searchText.value = value
  // 搜索时自动展开所有节点
  if (value) {
    expandAll()
  }
}, 300)

// 更新搜索处理函数
const onSearch = (value: string) => {
  debouncedSearch(value)
}

// 修改展开/收缩方法
const getAllFolderKeys = (tree: FileNode[]): string[] => {
  let keys: string[] = []
  tree.forEach(node => {
    if (node.children) {
      keys.push(node.key)
      keys = keys.concat(getAllFolderKeys(node.children))
    }
  })
  return keys
}

const expandAll = () => {
  expandedKeys.value = getAllFolderKeys(treeData.value)
}

const collapseAll = () => {
  expandedKeys.value = []
}

// 添加点击处理函数
const handleExplorerClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  
  // 检查点击目标是否在文件树区域内
  const isInTree = target.closest('.ant-tree') !== null
  // 检查是否在搜索框区域
  const isInSearch = target.closest('.explorer-search') !== null
  // 检查是否在头部操作区域
  const isInHeader = target.closest('.explorer-header') !== null
  
  // 如果点击的不是这些区域,则清空选中状态
  if (!isInTree && !isInSearch && !isInHeader) {
    selectedKeys.value = []
  }
}

</script>

<style scoped>
.strategy-edit {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 35px);
  background: #f6f8fa;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.strategy-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.strategy-info h2 {
  margin: 0;
  font-size: 18px;
  color: #1f1f1f;
}

.strategy-id {
  color: #666;
  font-size: 14px;
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.file-explorer {
  width: 280px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.explorer-header {
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.header-title {
  font-size: 11px;
  font-weight: 600;
  color: #6e7681;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-icon {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  transition: all 0.3s;
}

.action-icon:hover {
  color: #1890ff;
  background: #f5f5f5;
  border-radius: 4px;
}

.explorer-search {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.file-tree {
  flex: 1;
  overflow: auto;
  padding: 8px 4px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.tree-icon {
  font-size: 14px;
}

/* 文件夹图标颜色 */
.tree-node .folder-outlined {
  color: #dcb67a;
}

/* 文件图标颜色 */
.tree-node .file-outlined {
  color: #8792a3;
}

.node-text {
  font-size: 13px;
  color: #24292f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.editor-tabs {
  border-bottom: 1px solid #e8e8e8;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-icon {
  font-size: 14px;
  color: #666;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

/* 修改标签栏样式 */
:deep(.ant-tabs-nav) {
  margin: 0 !important;
  padding: 0;
  background: #f3f3f3;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.ant-tabs-tab) {
  margin: 0 !important;
  padding: 4px 16px !important;
  background: transparent !important;
  border: none !important;
  border-right: 1px solid #e0e0e0 !important;
  transition: all 0.3s;
  color: #6e7681;
  height: 36px;
  font-size: 13px;
  border-radius: 0 !important;
}

:deep(.ant-tabs-tab:hover) {
  background: #e8e8e8 !important;
  color: #24292f;
}

:deep(.ant-tabs-tab-active) {
  background: #fff !important;
  color: #24292f !important;
}

:deep(.ant-tabs-tab-active:hover) {
  background: #fff !important;
}

:deep(.ant-tabs-tab-remove) {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
  
  &:hover {
    color: #ff4d4f;
    background: rgba(0,0,0,0.06);
  }
}

/* 文件树节点选中和悬停效果 */
:deep(.ant-tree-treenode.ant-tree-treenode-selected::before) {
  background-color: #2B83FF !important;
  color: #FFFFFF !important;
}
:deep(.ant-tree-treenode.ant-tree-treenode-selected .node-text) {
  color: #FFFFFF !important;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.tab-icon {
  font-size: 14px;
  color: #8792a3;
  margin-right: 2px;
}

/* 修改标签内容区域样式 */
:deep(.ant-tabs-content) {
  height: 100%;
  background: #fff;
}

:deep(.ant-tree) {
  font-size: 13px;
  background: transparent;
}

:deep(.ant-tree-list) {
  padding: 4px 0;
}

:deep(.ant-tree-treenode) {
  padding: 0 !important;
  height: 28px;
  display: flex;
  align-items: center;
  width: 100%;
}

:deep(.ant-tree-node-content-wrapper) {
  padding: 0 8px !important;
  line-height: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

:deep(.ant-tree-switcher) {
  width: 24px;
  height: 28px;
  line-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.ant-tree-title) {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

:deep(.ant-tree-indent-unit) {
  width: 16px;
}

/* 欢迎界面样式 */
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 40px;
}

.welcome-content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.strategy-id {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.action-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  border-color: #d9d9d9;
  background: #fafafa;
}

.card-icon {
  font-size: 24px;
  color: #5c6b77;
  padding: 12px;
  background: #f5f7f9;
  border-radius: 8px;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2f3438;
  margin: 0 0 8px 0;
}

.card-content p {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

</style>