import {apiConfig, axiosApi} from '../utils/axiosApi.js'

export default {
  //厂家查询
  manufacturersPage(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/manufacturers/page`, // 直接使用绝对路径
      method: 'get',
      params,
    })
  },
  //更新厂家
  manufacturersPut(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/manufacturers/update/${id}`, // 直接使用绝对路径
      method: 'post',
    })
  },
  //添加厂家
  manufacturersAdd(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/manufacturers`, // 直接使用绝对路径
      method: 'post',
      data:params
    })
  },
  //删除厂家
  manufacturersDelete(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/manufacturers/delete/${id}`, // 直接使用绝对路径
      method: 'post',
    })
  },
  //仪器查询
  devicesPage(params){
    return axiosApi({
      url: `${apiConfig.deviceManagement}/devices/page`,
      method: 'get',
      params,
    })
  },
  //更新仪器
  devicesPut(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/devices/update/${params.id}`,
      method: 'post',
      data:params
    })
  },
  //添加仪器
  devicesAdd(params) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/devices`,
      method: 'post',
      data:params
    })
  },
  //删除仪器
  devicesDelete(id) {
    return axiosApi({
      url: `${apiConfig.deviceManagement}/devices/delete/${id}`,
      method: 'post',
    })
  },
}
