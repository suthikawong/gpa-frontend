import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401 && window.location.pathname !== '/signin') {
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
