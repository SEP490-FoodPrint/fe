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

// Response interceptor: xử lý mã lỗi 401, 403 kèm silent refresh
instance.interceptors.response.use(
  response => {
    const resData = response.data
    return resData
  },
  async error => {
    const originalRequest = error.config

    // Bỏ qua các endpoint auth nội bộ (không lặp refresh hay redirect)
    const isAuthRoute = originalRequest?.url?.includes("/auth/")
    const currentPath = window.location.pathname
    const isLoginPage =
      currentPath.includes("login") || currentPath === ROUTER.LOGIN
    const isProtectedPath =
      currentPath.startsWith("/system") ||
      currentPath.startsWith("/supplier") ||
      (currentPath.startsWith("/school") && !currentPath.includes("/school/FP_"))

    // Khi 401 trên các API nghiệp vụ thông thường, thử silent refresh trước
    if (error.response?.status === 401 && !isAuthRoute && !originalRequest?._retry) {
      originalRequest._retry = true
      try {
        const BASE_URL = import.meta.env.VITE_API_ROOT || ""
        await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )
        // Refresh thành công, gửi lại request ban đầu
        return instance(originalRequest)
      } catch (refreshErr) {
        deleteStorage(STORAGE.TOKEN)
        deleteStorage(STORAGE.USER_INFO)

        // Chỉ hiển thị thông báo và redirect nếu đang ở trang được bảo vệ
        if (!isLoginPage && isProtectedPath) {
          notice({
            msg: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
            isSuccess: false,
          })
          window.location.replace(ROUTER.LOGIN)
        }
        return Promise.reject(refreshErr)
      }
    }

    if (error.response?.status === 401 && !isAuthRoute) {
      deleteStorage(STORAGE.TOKEN)
      deleteStorage(STORAGE.USER_INFO)

      if (!isLoginPage && isProtectedPath) {
        notice({
          msg: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn",
          isSuccess: false,
        })
        window.location.replace(ROUTER.LOGIN)
      }
    } else if (error.response?.status === 403) {
      notice({
        msg: "Bạn không có quyền thực hiện thao tác này (403)",
        isSuccess: false,
      })
    }

    return Promise.reject(error)
  },
)

export default instance
