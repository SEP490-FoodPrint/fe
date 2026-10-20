import React, { createContext, useState } from "react"

export const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [routerBeforeLogin, setRouterBeforeLogin] = useState("")
  const [isLoginContext, setIsLoginContext] = useState(false)
  const [user, setUser] = useState(null)
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
