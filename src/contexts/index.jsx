import React, { createContext, useState } from "react"
import STORAGE, { getStorage } from "src/lib/storage"

export const StoreContext = createContext(null)

const savedToken = getStorage(STORAGE.TOKEN)
const savedUser = getStorage(STORAGE.USER_INFO)
const hasSession = typeof savedToken === "string" && savedToken.split(".").length === 3 && savedUser?.id

export function StoreProvider({ children }) {
  const [routerBeforeLogin, setRouterBeforeLogin] = useState("")
  const [isLoginContext, setIsLoginContext] = useState(Boolean(hasSession))
  const [user, setUser] = useState(hasSession ? savedUser : null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const store = {
    routerBeforeStore: { routerBeforeLogin, setRouterBeforeLogin },
    loginStore: { isLoginContext, setIsLoginContext },
    userStore: { user, setUser },
    themeStore: { isDarkMode, setIsDarkMode },
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export default StoreProvider
