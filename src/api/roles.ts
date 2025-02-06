import request from '@/utils/request'
import type { AxiosResponse } from 'axios'

// 接口返回数据类型
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 角色信息类型
export interface Role {
  roleId: number
  roleCode: string
  roleName: string
  description: string
  createdAt: string
  updatedAt: string
}

// 角色列表参数类型
export interface RoleListParams {
  pageNo: number
  pageSize: number
  roleId?: string
  roleCode?: string
  roleName?: string
  startTime?: string
  endTime?: string
  orderBy?: string
  orderType?: 'asc' | 'desc'
  isActive?: number
}

// 角色表单数据类型
export interface RoleFormData {
  roleId?: number
  roleCode: string
  roleName: string
  description?: string
}

/**
 * 分页获取角色列表
 */
export function getRoleList(data: RoleListParams) {
  return request({
    url: '/api/role/pageList',
    method: 'post',
    data
  })
}

/**
 * 获取角色详情
 */
export const getRoleDetail = (roleId: number): Promise<ApiResponse<Role>> => {
  return request({
    url: `/api/role/${roleId}`,
    method: 'get'
  })
}

/**
 * 新增角色
 */
export const createRole = (data: RoleFormData): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/role/addRole',
    method: 'post',
    data
  })
}

/**
 * 编辑角色
 */
export const updateRole = (data: RoleFormData): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/role/updateRole',
    method: 'post',
    data
  })
}

/**
 * 删除角色
 */
export const deleteRole = (roleId: number): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/role/deleteRole',
    method: 'post',
    data: { roleId }
  })
}

/**
 * 批量删除角色
 */
export const batchDeleteRoles = (roleIds: number[]): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/role/batchDeleteRole',
    method: 'post',
    data: { roleIds }
  })
}

/**
 * 获取角色导入模板下载地址
 */
export const getRoleTemplateUrl = (): Promise<ApiResponse<{ download_url: string }>> => {
  return request({
    url: '/api/role/getRoleTemplate',
    method: 'get'
  })
}

/**
 * 导入角色
 */
export const importRoles = (file: File): Promise<ApiResponse<null>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/role/importRole',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出角色
 */
export const exportRoles = (params: Partial<RoleListParams>): Promise<ApiResponse<{ download_url: string }>> => {
  return request({
    url: '/api/role/exportRole',
    method: 'post',
    data: params
  })
}

/**
 * 绑定用户角色
 */
export const bindUserRole = (data: { userId: number; roleIds: number[] }): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/role/bindUserRole',
    method: 'post',
    data
  })
}

/**
 * 获取用户当前角色
 */
export const getUserRole = (userId: number): Promise<ApiResponse<{ roleIds: number[] }>> => {
  return request({
    url: `/api/role/getUserRole`,
    method: 'post',
    data: { userId }
  })
} 

/**
 * 获取角色用户
 */
export const getRoleUser = (roleId: number): Promise<ApiResponse<{ userIds: number[] }>> => {
  return request({
    url: `/api/role/getRoleUser`,
    method: 'post',
    data: { roleId }
  })
}

/**
 * 绑定角色用户
 */
export const bindRoleUser = (data: { roleId: number; userIds: number[] }): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/role/bindRoleUser',
    method: 'post',
    data
  })
}

/**
 * 获取角色权限
 */
export const getRolePermissions = (roleId: number): Promise<ApiResponse<{ permissionIds: number[] }>> => {
  return request({
    url: `/api/role/getRolePermissions`,
    method: 'post',
    data: { roleId }
  })
}

/**
 * 绑定角色权限
 */
export const bindRolePermission = (data: { roleId: number; permissionIds: number[] }): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/role/bindRolePermission',
    method: 'post',
    data
  })
}