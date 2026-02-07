import {apiConfig, axiosApi} from '../utils/axiosApi.js'

export default {
  // 机构分页查询
  orgsPage(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/organizations/page`,
      method: 'get',
      params,
    })
  },
  // 添加机构
  orgsAdd(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/organizations`,
      method: 'post',
      data: params
    })
  },
  // 更新机构
  orgsPut(params,id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/organizations/${id}`,
      method: 'put',
      data: params
    })
  },
  // 删除机构
  orgsDelete(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations/${id}`,
      method: 'delete',
    })
  },
  // 机构授权列表查询
  authorizationsPage(params) {
    // Determine if we should use organizationId or orgId (unify usage)
    const id = params.organizationId || params.orgId
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations/${id}`,
      method: 'get',
      // If we need to pass query params like timestamp
      params: {
        _t: params._t
      }
    })
  },
  // 机构授权设备
  authorizationsDevices(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations/devices`,
      method: 'post',
      data: params
    })
  },
  // 机构权限授权
  authorizationsLicense(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations/license`,
      method: 'post',
      data: params
    })
  },
  authorizationsSetDefault(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations/setDefaultPlugin`,
      method: 'post',
      data: params
    })
  }
}