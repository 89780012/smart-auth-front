import request from '@/utils/request'

export interface Resource {
  resourceId: number
  resourceCode: string
  resourceName: string
  resourceType: 'page' | 'operation' | 'data'
  isActive: number
  createdAt: string
  updatedAt: string
  parentId: number
  sortOrder: number
  icon: string
  path: string
  component: string
  layout: string
  redirect: string
  hidden: number
}

export interface ResourceQuery {
  pageNo: number
  pageSize: number
  resourceCode?: string
  resourceName?: string
  resourceType?: string
  isActive?: number
  startTime?: string
  endTime?: string
  orderBy?: string
  orderType?: 'asc' | 'desc'
}

// 获取资源列表
export function getPageResourceList(params: ResourceQuery) {
  return request({
    url: '/api/resources/pageList',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: params
  })
}


// 获取资源列表
export function getResourceList() {
  return request({
    url: '/api/resources/list',
    method: 'get'
  })
}

// 新增资源
export function addResource(data: Partial<Resource>) {
  return request({
    url: '/api/resources/addResource',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

// 更新资源
export function updateResource(data: Partial<Resource>) {
  return request({
    url: '/api/resources/updateResource',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

// 删除资源
export function deleteResource(data: { resourceId: number }) {
  return request({
    url: `/api/resources/deleteResource`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

// 批量删除资源
export function batchDeleteResources(data: { resourceIds: number[] }) {
  return request({
    url: '/api/resources/batchDeleteResources',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data 
  })
}

// 获取资源导入模板
export function getResourceTemplateUrl() {
  return request({
    url: '/api/resources/getResourceTemplate',
    method: 'get',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  })
}

// 导入资源
export function importResources(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/api/resources/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出资源
export function exportResources(params: Partial<ResourceQuery>) {
  return request({
    url: '/api/resources/export',
    method: 'get',
    params
  })
}
