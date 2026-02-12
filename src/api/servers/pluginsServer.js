import {apiConfig, axiosApi} from '../utils/axiosApi.js'

export default {
  // 插件分页查询
  pluginsPage(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/plugins/page`,
      method: 'get',
      params,
    })
  },
  // 添加插件
  pluginsAdd(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/plugins`,
      method: 'post',
      data: params,
      formData: true // 标识为FormData请求
    })
  },
  // 更新插件
  pluginsPut(params,id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/plugins/update/${id}`,
      method: 'post',
      data: params,
      formData: true
    })
  },
  // 删除插件
  pluginsDelete(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/plugins/delete/${id}`,
      method: 'post',
    })
  },
  // 下载插件(单个)
  pluginsDownloadsId(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/plugins/download/${id}`,
      method: 'get',
      responseType: 'blob',
      originalRes: true
    })
  },
  // 下载插件(批量)
  pluginsDownloads(data) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/downloads`,
      method: 'post',
      data,
      responseType: 'blob',
      originalRes: true
    })
  },
  // 下载历史插件(单个)
  pluginsDownloadArchive(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/downloads/archive/${ id }`,
      method: 'get',
      responseType: 'blob',
      originalRes: true
    })
  }
}
