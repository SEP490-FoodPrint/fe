import React, { createContext, useState } from "react"
import { MOCK_ACCOUNTS, ROLES } from "src/constants/roles"

export const StoreContext = createContext(null)

const DEFAULT_DEMO_USER =
  MOCK_ACCOUNTS.find(account => account.role === ROLES.SCHOOL_MANAGEMENT_BOARD) || null

export function StoreProvider({ children }) {
  const [routerBeforeLogin, setRouterBeforeLogin] = useState("")
  const [isLoginContext, setIsLoginContext] = useState(true)
  const [user, setUser] = useState(DEFAULT_DEMO_USER)
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
