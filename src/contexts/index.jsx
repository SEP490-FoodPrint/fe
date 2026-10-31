import React, { createContext, useEffect, useState } from "react"

export const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [routerBeforeLogin, setRouterBeforeLogin] = useState("")
  const [isLoginContext, setIsLoginContext] = useState(false)
  const [user, setUser] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  // Short-lived memory only: used to establish the cookie session after email verification.
  const [signupCredentials, setSignupCredentials] = useState(null)
  useEffect(() => {
    if (!signupCredentials) return
    const timer = setTimeout(() => setSignupCredentials(null), 10 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [signupCredentials])

  const store = {
    routerBeforeStore: { routerBeforeLogin, setRouterBeforeLogin },
    loginStore: { isLoginContext, setIsLoginContext },
    userStore: { user, setUser },
    signupStore: { signupCredentials, setSignupCredentials },
    themeStore: { isDarkMode, setIsDarkMode },
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export default StoreProvider
