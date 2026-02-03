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
  orgsPut(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations`,
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
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations/page`,
      method: 'get',
      params,
    })
  },
  // 机构授权设备
  authorizationsDevices(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/authorizations/devices`,
      method: 'post',
      data: params
    })
  }
}