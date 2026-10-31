import axios from "axios"
import notice from "src/components/Notice"
import STORAGE, { deleteStorage } from "src/lib/storage"
import ROUTER from "src/router/ROUTER"
import { apiRefresh } from "../AuthService/urls"

let refreshPromise = null

const instance = axios.create({
  timeout: 30000,
  headers: {
    accept: "application/json, text/plain, */*",
  },
  withCredentials: true,
})

// Browser authentication uses HttpOnly cookies managed by the backend.
instance.interceptors.request.use(
  config => {
    const BASE_URL = import.meta.env.VITE_API_ROOT || ""
    config.baseURL = BASE_URL

    if (!["get", "head", "options"].includes(config.method?.toLowerCase())) config.headers.set("X-CSRF-Protection", "1")
    return config
  },
  error => Promise.reject(error),
)

// Response interceptor: xử lý mã lỗi 401, 403, 500
instance.interceptors.response.use(
  response => {
    return response.data
  },
  async error => {
    if (axios.isCancel(error)) return Promise.reject(error)
    if (error.response?.status === 401 && !error.config?.skipRefresh && !error.config?._retried) {
      error.config._retried = true
      try {
        // Refresh tokens rotate on use; concurrent 401s must share one refresh.
        if (!refreshPromise) refreshPromise = instance.post(apiRefresh, null, {
          skipRefresh: true, skipAuthRedirect: true, notifyOnError: false,
        }).finally(() => { refreshPromise = null })
        await refreshPromise
        return instance.request(error.config)
      } catch (refreshError) {
        // Preserve a temporary backend failure instead of discarding a recoverable session.
        if (![401, 403].includes(refreshError.response?.status)) return Promise.reject(refreshError)
      }
    }
    error.message = error.response?.data?.message || (error.response
      ? "Không thể xử lý yêu cầu. Vui lòng thử lại."
      : "Không thể kết nối máy chủ. Vui lòng thử lại.")
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      notice({ msg: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn", isSuccess: false })
      deleteStorage(STORAGE.TOKEN)
      deleteStorage(STORAGE.USER_INFO)
      window.location.replace(ROUTER.LOGIN)
    } else if (error.config?.notifyOnError !== false) {
      notice({
        msg: error.message,
        isSuccess: false,
      })
    }
    return Promise.reject(error)
  },
)

export default instance
