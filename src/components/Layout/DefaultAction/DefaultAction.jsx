import React, { useContext, useEffect } from "react"
import { StoreContext } from "src/contexts"
import STORAGE, { getStorage, setStorage, deleteStorage } from "src/lib/storage"
import AuthService from "src/services/AuthService"

/**
 * Component bọc ngoài ứng dụng: Phục hồi phiên đăng nhập từ LocalStorage & Cookie
 */
const DefaultAction = ({ children }) => {
  const { loginStore, userStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const setUser = userStore?.setUser

  useEffect(() => {
    const token = getStorage(STORAGE.TOKEN)
    const userInfo = getStorage(STORAGE.USER_INFO)

    // Chỉ xác thực và khôi phục khi trong storage đã có thông tin phiên trước đó
    if (token && userInfo) {
      if (setIsLoginContext) setIsLoginContext(true)
      if (setUser) setUser(userInfo)

      // Đồng bộ ngầm thông tin tài khoản mới nhất từ backend
      AuthService.getProfile()
        .then(res => {
          const freshUser = res?.data || res?.user
          if (freshUser) {
            setUser(freshUser)
            setStorage(STORAGE.USER_INFO, freshUser)
          }
        })
        .catch(() => {
          // Nếu phiên đã hết hạn trên server, âm thầm xóa session local
          deleteStorage(STORAGE.TOKEN)
          deleteStorage(STORAGE.USER_INFO)
          if (setIsLoginContext) setIsLoginContext(false)
          if (setUser) setUser(null)
        })
    }
  }, [setIsLoginContext, setUser])

  return <>{children}</>
}

export default DefaultAction
