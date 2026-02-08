import axios from 'axios'
import router from '../../router'

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
    const d = response.data
    if (d && typeof d === 'object' && (d.code === 401 || d.code === 403)) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      router.push('/login')
      return Promise.reject(d)
    }
    return d
  },
  (error) => {
    const code = error.response?.status || error.response?.data?.code || 0
    const message = error.response?.data?.message || error.message || 'Request Error'
    const data = error.response?.data
    if (code === 401 || code === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      router.push('/login')
    }
    return Promise.reject({ code, message, data })
  },
)

export const axiosApi = (config = {}) => service({ ...config })

export const apiConfig = {
    deviceManagement:'/yiqi-api'
}
