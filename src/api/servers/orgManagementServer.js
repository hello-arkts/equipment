import {apiConfig, axiosApi} from '../utils/axiosApi.js'

export default {
  // 机构分页查询
  orgsPage(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/organizations/page`,
      method: 'get',
      params,
    })
  },
  // 添加机构
  orgsAdd(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/organizations`,
      method: 'post',
      data: params
    })
  },
  // 更新机构
  orgsPut(params,id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/organizations/update/${id}`,
      method: 'post',
      data: params
    })
  },
  // 删除机构
  orgsDelete(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/organizations/delete/${id}`,
      method: 'post',
    })
  },
  // 机构授权列表查询
  authorizationsPage(params) {
    const id = params.organizationId || params.orgId
    return axiosApi({
      url: `${apiConfig.deviceManagement}/authorizations/${id}`,
      method: 'get',
      params: {
        _t: params._t
      }
    })
  },
  // 机构授权设备
  authorizationsDevices(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/authorizations/devices`,
      method: 'post',
      data: params
    })
  },
  // 机构权限授权
  authorizationsLicense(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/authorizations/license`,
      method: 'post',
      data: params
    })
  },
  authorizationsSetDefault(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/authorizations/setDefaultPlugin`,
      method: 'post',
      data: params
    })
  },
  //解除仪器绑定
  authorizationsCancel(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/authorizations/device/cancel`,
      method: 'post',
      data: params
    })
  }
}