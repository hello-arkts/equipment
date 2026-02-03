import {apiConfig, axiosApi} from '../utils/axiosApi.js'

export default {
  // 插件分页查询
  pluginsPage(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/plugins/page`,
      method: 'get',
      params,
    })
  },
  // 添加插件
  pluginsAdd(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/plugins`,
      method: 'post',
      data: params,
      formData: true // 标识为FormData请求
    })
  },
  // 更新插件
  pluginsPut(params,id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/plugins/${id}`,
      method: 'put',
      data: params,
      formData: true
    })
  },
  // 删除插件
  pluginsDelete(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/api/plugins/${id}`,
      method: 'delete',
    })
  }
}
