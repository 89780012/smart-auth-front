import request from '@/utils/request'
import type { AxiosResponse } from 'axios'

// 接口返回数据类型
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 权限信息类型
export interface Permission {
  permissionId: number
  permissionCode: string
  permissionName: string
  description: string
  isActive: number
  createdAt: string
  updatedAt: string
}

// 权限列表参数类型
export interface PermissionListParams {
  pageNo: number
  pageSize: number
  permissionCode?: string
  permissionName?: string
  isActive?: number
  startTime?: string
  endTime?: string
  orderBy?: string
  orderType?: 'asc' | 'desc'
}

// 权限表单数据类型
export interface PermissionFormData {
  permissionId?: number
  permissionCode: string
  permissionName: string
  description?: string
  isActive?: number
}

/**
 * 分页获取权限列表
 */
export function getPermissionList(data: PermissionListParams) {
  return request({
    url: '/api/permission/pageList',
    method: 'post',
    data
  })
}

/**
 * 获取权限详情
 */
export const getPermissionDetail = (permissionId: number): Promise<ApiResponse<Permission>> => {
  return request({
    url: `/api/permission/${permissionId}`,
    method: 'get'
  })
}

/**
 * 新增权限
 */
export const createPermission = (data: PermissionFormData): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/permission/addPermission',
    method: 'post',
    data
  })
}

/**
 * 编辑权限
 */
export const updatePermission = (data: PermissionFormData): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/permission/updatePermission',
    method: 'post',
    data
  })
}

/**
 * 删除权限
 */
export const deletePermission = (permissionId: number): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/permission/deletePermission',
    method: 'post',
    data: { permissionId }
  })
}

/**
 * 批量删除权限
 */
export const batchDeletePermissions = (permissionIds: number[]): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/permission/batchDeletePermission',
    method: 'post',
    data: { permissionIds }
  })
}

/**
 * 获取权限导入模板下载地址
 */
export const getPermissionTemplateUrl = (): Promise<ApiResponse<{ download_url: string }>> => {
  return request({
    url: '/api/permission/getPermissionTemplate',
    method: 'get'
  })
}

/**
 * 导入权限
 */
export const importPermissions = (file: File): Promise<ApiResponse<null>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/permission/importPermission',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出权限
 */
export const exportPermissions = (params: Partial<PermissionListParams>): Promise<ApiResponse<{ download_url: string }>> => {
  return request({
    url: '/api/permission/exportPermission',
    method: 'post',
    data: params
  })
}

// 获取权限的资源列表
export function getPermissionResource(permissionId: number) {
  return request({
    url: `/api/permissions/resources`,
    method: 'post',
    data: {
      permissionId: permissionId
    }
  });
}

// 绑定权限资源
export function bindPermissionResource(data: {
  permissionId: number;
  resourceIds: number[];
}) {
  return request({
    url: `/api/permissions/bindPermissionResource`,
    method: 'post',
    data: {
      permissionId: data.permissionId,
      resourceIds: data.resourceIds
    }
  });
}
