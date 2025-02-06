import request from '@/utils/request'
import type { AxiosResponse } from 'axios'

// 接口返回数据类型
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 用户信息类型
export interface User {
  userId: number
  username: string
  email: string
  phone: string
  wechatId: string
  profile: string
  isActive: number
  createdAt: string
  updatedAt: string
}

// 用户列表参数类型
export interface UserListParams {
  pageNo: number
  pageSize: number
  username?: string
  email?: string
  phone?: string
  wechatId?: string
  isActive?: number
  startTime?: string
  endTime?: string
  orderBy?: string
  orderType?: 'asc' | 'desc',
  userIds?: number[]
}

// 用户表单数据类型
export interface UserFormData {
  userId?: number
  username: string
  email: string
  phone?: string
  wechatId?: string
  password?: string
  profile?: string
  isActive?: number
}

// 登录参数类型
export interface LoginParams {
  username: string
  password: string
}

/**
 * 用户登录
 */
export const login = (data: LoginParams): Promise<ApiResponse<{ user:User }>> => {
  return request({
    url: '/api/user/loginUser',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 */
export const logout = (): Promise<ApiResponse<void>> => {
  return request({
    url: '/api/user/logout',
    method: 'post'
  })
}


/**
 * 分页获取用户列表
 */
export function getUserList(data: UserListParams) {
  return request({
    url: '/api/user/pageList',
    method: 'post',
    data
  })
}
/**
 * 获取用户详情
 */
export const getUserDetail = (userId: number): Promise<ApiResponse<User>> => {
  return request({
    url: `/user/${userId}`,
    method: 'get'
  })
}

/**
 * 新增用户
 */
export const createUser = (data: UserFormData): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/user/addUser',
    method: 'post',
    data
  })
}

/**
 * 编辑用户
 */
export const updateUser = (data: UserFormData): Promise<ApiResponse<null>> => {
  return request({
    url: `/api/user/updateUser`,
    method: 'post',
    data
  })
}

/**
 * 删除用户
 */
export const deleteUser = (userId: number): Promise<ApiResponse<null>> => {
  return request({
    url: `/api/user/deleteUser`,
    method: 'post',
    data: { userId }
  })
}

/**
 * 批量删除用户
 */
export const batchDeleteUsers = (userIds: number[]): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/user/batchDeleteUser',
    method: 'post',
    data: { userIds }
  })
}

/**
 * 上传用户头像
 */
export const uploadAvatar = (file: File): Promise<ApiResponse<{ url: string }>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/upload/avatar',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

/**
 * 导入用户
 */
export const importUsers = (file: File): Promise<ApiResponse<any>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/user/importUser',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  })
}

/**
 * 导出用户数据
 */
export const exportUsers = (data: Partial<UserListParams>): Promise<ApiResponse<{ download_url: string }>> => {
  return request({
    url: '/api/user/exportUser',
    method: 'post',
    data
  })
}


/**
 * 获取导入模板URL
 */
export const getUserTemplateUrl = (): Promise<ApiResponse<{ download_url: string }>> => {
  return request({
    url: '/api/user/getUserTemplate',
    method: 'get'
  })
} 


/** 获取用户菜单  */
export const getUserMenu = (data: {userId:number}):Promise<ApiResponse<any>> => {
  return request({
    url: '/api/user/getUserMenu',
    method: 'post',
    data
  })
}