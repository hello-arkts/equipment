import axios from 'axios'

const service = axios.create({
    baseURL:'',
    timeout: 120000,
})

service.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {}
    
    // 从 localStorage 获取 token 并添加到 headers
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}` // 根据后端要求调整，通常是 Bearer token
    }

    if (!config.headers['Accept']) config.headers['Accept'] = 'application/json'
    if (!config.headers['Content-Type']) config.headers['Content-Type'] = 'application/json'
    if (config.formData) {
      if (config.data instanceof FormData) {
        // 如果数据已经是 FormData 实例（包含文件上传），删除 Content-Type，让浏览器自动设置 multipart/form-data 和 boundary
        delete config.headers['Content-Type']
      } else {
        // 如果是普通对象标记为 formData（通常是 application/x-www-form-urlencoded）
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        const params = new URLSearchParams()
        Object.entries(config.data || {}).forEach(([k, v]) => {
          params.append(k, v == null ? '' : String(v))
        })
        config.data = params
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

service.interceptors.response.use(
  (response) => {
    if (response.config.originalRes) return response
    return response.data
  },
  (error) => {
    const code = error.response?.status || 0
    const message = error.response?.data?.message || error.message || 'Request Error'
    const data = error.response?.data
    return Promise.reject({ code, message, data })
  },
)

export const axiosApi = (config = {}) => service({ ...config })

export const apiConfig = {
    deviceManagement:'/yiqi'
}
