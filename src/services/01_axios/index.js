import axios from "axios"
import notice from "src/components/Notice"
import STORAGE, { deleteStorage, getStorage } from "src/lib/storage"
import ROUTER from "src/router/ROUTER"

const instance = axios.create({
  timeout: 30000,
  headers: {
    accept: "application/json, text/plain, */*",
  },
  withCredentials: true,
})

// Request interceptor: tự động đính kèm Bearer token từ localStorage
instance.interceptors.request.use(
  config => {
    const BASE_URL = import.meta.env.VITE_API_ROOT || ""
    config.baseURL = BASE_URL

    const token = getStorage(STORAGE.TOKEN)
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  },
  error => Promise.reject(error),
)

// Response interceptor: xử lý mã lỗi 401, 403, 500
instance.interceptors.response.use(
  response => {
    const resData = response.data
    if (response?.status === 200) {
      if (resData?.StatusCode === 401 || resData?.status === 401) {
        notice({ msg: "Phiên đăng nhập đã hết hạn!", isSuccess: false })
        deleteStorage(STORAGE.TOKEN)
        deleteStorage(STORAGE.USER_INFO)
        window.location.replace(ROUTER.LOGIN)
      }
      return resData
    }
    return response
  },
  error => {
    if (error.response?.status === 401) {
      notice({ msg: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn", isSuccess: false })
      deleteStorage(STORAGE.TOKEN)
      deleteStorage(STORAGE.USER_INFO)
      window.location.replace(ROUTER.LOGIN)
    } else if (error.response?.status === 403) {
      notice({ msg: "Bạn không có quyền thực hiện thao tác này (403)", isSuccess: false })
    } else {
      notice({
        msg: error?.response?.data?.message || "Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau.",
        isSuccess: false,
      })
    }
    return Promise.reject(error)
  },
)

export default instance
