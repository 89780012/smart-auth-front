import {
  HomeOutlined,
  SettingOutlined, 
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  LockOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  EditOutlined,
  FileSearchOutlined
} from '@ant-design/icons-vue'

export interface MenuConfig {
  key: string
  title: string
  icon?: any
  path: string
  component?: () => Promise<any>
  redirect?: string
  children?: MenuConfig[]
  layout?: 'full' | 'default',
  hidden?: boolean
}

export const menuConfig: MenuConfig[] = [
  {
    key: 'home',
    title: '工作台',
    icon: HomeOutlined,
    path: '/home',
    redirect: '/home/dashboard',
    layout: 'default',
    // layout: 'full'
    children: [
      {
        key: 'dashboard',
        title: '工作台',
        icon: DashboardOutlined,
        path: '/home/dashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        key: 'statistics',
        title: '分析页',
        icon: BarChartOutlined,
        path: '/home/statistics',
        component: () => import('@/views/dashboard/statistics.vue')
      },
    ]
  },
  {
    key: 'strategy',
    title: '策略',
    icon: BarChartOutlined,
    path: '/strategy',
    redirect: '/strategy/index',
    layout: 'full',
    children: [
      {
        key: 'index',
        title: '策略列表',
        icon: UnorderedListOutlined,
        path: '/strategy/index',
        component: () => import('@/views/strategy/index.vue')
      },
      {
        key: 'edit',
        title: '策略编辑',
        icon: EditOutlined,
        path: '/strategy/edit',
        component: () => import('@/views/strategy/edit.vue'),
        hidden: true
      },
      {
        key: 'detail',
        title: '策略详情',
        icon: FileSearchOutlined,
        path: '/strategy/detail',
        component: () => import('@/views/strategy/detail.vue'),
        hidden: true
      }
    ]
  },
  {
    key: 'system',
    title: '系统管理',
    icon: SettingOutlined,
    path: '/system',
    redirect: '/system/users',
    layout: 'default',
    children: [
      {
        key: 'users',
        title: '用户管理',
        icon: UserOutlined,
        path: '/system/users',
        component: () => import('@/views/system/users/index.vue')
      },
      {
        key: 'roles',
        title: '角色管理',
        icon: TeamOutlined,
        path: '/system/roles',
        component: () => import('@/views/system/roles/index.vue')
      },
      {
        key: 'permissions',
        title: '权限管理',
        icon: LockOutlined,
        path: '/system/permissions',
        component: () => import('@/views/system/permissions/index.vue')
      },
      {
        key: 'resources',
        title: '资源管理',
        icon: AppstoreOutlined,
        path: '/system/resources',
        component: () => import('@/views/system/resources/index.vue')
      }
    ]
  }
] 