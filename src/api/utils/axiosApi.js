import axios from 'axios'

const service = axios.create({
    baseURL:'',
    timeout: 120000,
})

service.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {}
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    if (!config.headers['Accept']) config.headers['Accept'] = 'application/json'
    if (!config.headers['Content-Type']) config.headers['Content-Type'] = 'application/json'
    if (config.formData) {
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type']
      } else {
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
