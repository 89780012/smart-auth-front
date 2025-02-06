<template>
  <a-modal
    :open="visible"
    :title="title"
    :confirm-loading="loading"
    @update:visible="$emit('update:visible', $event)"
    @ok="$emit('ok')"
    @cancel="$emit('cancel')"
    class="import-modal"
    width="600px"
  >
    <div class="import-content">
      <!-- 步骤指引 -->
      <div class="import-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">下载模板</div>
            <div class="step-desc">获取标准导入模板</div>
          </div>
        </div>
        <div class="step-arrow"><RightOutlined /></div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">填写数据</div>
            <div class="step-desc">按照模板格式填写</div>
          </div>
        </div>
        <div class="step-arrow"><RightOutlined /></div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">上传文件</div>
            <div class="step-desc">上传填写好的文件</div>
          </div>
        </div>
      </div>

      <!-- 上传区域 -->
      <div class="upload-section">
        <a-upload
          v-model:file-list="fileListRef"
          :before-upload="handleBeforeUpload"
          accept=".xlsx,.xls,.csv"
          class="import-uploader"
          :multiple="false"
          :show-upload-list="false"
        >
          <div class="upload-area" :class="{ 'has-file': fileListRef.length > 0 }">
            <div class="upload-icon">
              <UploadOutlined v-if="!fileListRef.length" />
              <FileOutlined v-else />
            </div>
            <div class="upload-text">
              <div class="primary-text">
                {{ fileListRef.length ? fileListRef[0].name : '点击或拖拽文件到此处上传' }}
              </div>
              <div class="secondary-text">
                {{ fileListRef.length ? '点击重新选择' : '支持 .xlsx、.xls、.csv 格式' }}
              </div>
            </div>
          </div>
        </a-upload>
      </div>

      <!-- 底部信息区 -->
      <div class="import-footer">
        <!-- 模板下载 -->
        <div class="template-card">
          <div class="template-icon">
            <FileExcelOutlined />
          </div>
          <div class="template-info">
            <div class="template-title">导入模板</div>
            <a-button type="link" class="download-btn" @click="$emit('download')">
              <DownloadOutlined />
              下载模板
            </a-button>
          </div>
        </div>

        <!-- 导入说明 -->
        <a-alert class="import-alert" type="info" show-icon>
          <template #message>导入说明</template>
          <template #description>
            <ul class="import-tips">
              <li>请严格按照模板格式填写数据</li>
              <li>支持 Excel 文件（.xlsx、.xls）与 CSV 文件</li>
              <li>文件大小不超过 5MB</li>
              <li>请确保数据的完整性和准确性</li>
            </ul>
          </template>
        </a-alert>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  DownloadOutlined,
  FileOutlined,
  FileExcelOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  fileList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:visible',
  'update:fileList',
  'ok',
  'cancel',
  'download',
  'fileChange'
])

const fileListRef = ref(props.fileList)

// 监听文件列表变化
watch(fileListRef, (val) => {
  emit('update:fileList', val)
})

// 上传前校验
const handleBeforeUpload = (file: File) => {
  const isExcel = /\.(xlsx|xls|csv)$/.test(file.name)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isExcel) {
    message.error('只能上传Excel/CSV文件!')
    return false
  }
  if (!isLt5M) {
    message.error('文件大小不能超过5MB!')
    return false
  }

  emit('fileChange', file)
  return false
}
</script>

<style scoped>
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
  /* padding: 0 40px; */
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
  text-align: center;
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