<template>
  <div class="tab-bar">
    <a-tabs
      v-model:activeKey="tabStore.activeTab"
      type="editable-card"
      hide-add
      @edit="onEdit"
      @change="onChange"
    >
      <a-tab-pane
        v-for="tab in filteredTabs"
        :key="tab.key"
        :tab="tab.title"
        :closable="true"
      />
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { useTabStore } from '@/stores/tabs'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { message } from 'ant-design-vue'

const tabStore = useTabStore()
const router = useRouter()


const filteredTabs = computed(() => {
  // 过滤掉仪表盘的标签页
  //return tabStore.tabs.filter(tab => tab.key !== '/home/dashboard')
  return tabStore.tabs
})

const onChange = (key: string) => {
  router.push(key)
}

const onEdit = (targetKey: string) => {
  // 如果只剩一个标签页，显示提示信息
  if (filteredTabs.value.length <= 1) {
    message.warning('至少保留一个标签页')
    return
  }

  // 如果关闭的是当前激活的标签页，需要先切换到其他标签页
  if (targetKey === tabStore.activeTab) {
    const currentIndex = filteredTabs.value.findIndex(tab => tab.key === targetKey)
    // 如果不是最后一个，就切换到下一个；如果是最后一个，就切换到前一个
    const nextTab = filteredTabs.value[currentIndex === filteredTabs.value.length - 1 
      ? currentIndex - 1 
      : currentIndex + 1]
    
    // 先切换路由
    router.push(nextTab.key)
    // 然后删除标签页
    tabStore.removeTab(targetKey)
  } else {
    // 如果关闭的不是当前激活的标签页，直接删除即可
    tabStore.removeTab(targetKey)
  }
}
</script>

<style scoped>
.tab-bar {
  background: var(--primary-color);
  padding: 4px 0px 0px 4px;
  
  :deep(.ant-tabs-nav) {
    margin: 0;
    font-size: 13px;
    line-height: 1;
  }

  :deep(.ant-tabs-tab) {
    padding: 6px 16px !important;
    margin: 0 2px 0 0 !important;
    height: 32px !important;
    border-radius: 0 !important;
    color: var(--menu-text-color);
  }

  :deep(.ant-tabs-tab.ant-tabs-tab-active) {
    border-radius: 0 !important;
    border-bottom: 1px solid var(--border-color);
    background: var(--menu-active-bg-color);
  }
  :deep(.ant-tabs-tab-btn) {
    font-size: 13px;
    color: var(--text-primary);
  }
}
:deep(.ant-tabs .ant-tabs-tab-remove) {
  margin-left: 4px;
  font-size: 12px;
  color: var(--ant-tabs-tab-remove-color);
}
</style> 