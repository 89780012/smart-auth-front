declare module 'monaco-editor'

declare module '@/components/MonacoEditor.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{
    value: string
    language: string
    theme: string
    options: any
  }, {}, any>
  export default component
}

declare module 'lodash-es'

// 其他全局类型声明
declare interface Window {
  monaco: any
} 