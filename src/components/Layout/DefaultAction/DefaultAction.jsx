import React, { useContext, useEffect } from "react"
import { StoreContext } from "src/contexts"
import STORAGE, { getStorage } from "src/lib/storage"

/**
 * Component bọc ngoài ứng dụng: Phục hồi phiên đăng nhập từ LocalStorage
 * (Không còn gọi API getListTab phụ - Phân quyền trực tiếp qua user.role)
 */
const DefaultAction = ({ children }) => {
  const { loginStore, userStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const setUser = userStore?.setUser

  useEffect(() => {
    const token = getStorage(STORAGE.TOKEN)
    const userInfo = getStorage(STORAGE.USER_INFO)

    if (typeof token === "string" && token.split(".").length === 3 && userInfo?.id) {
      if (setIsLoginContext) setIsLoginContext(true)
      if (setUser) setUser(userInfo)
    }
  }, [setIsLoginContext, setUser])

  return <>{children}</>
}

export default DefaultAction
