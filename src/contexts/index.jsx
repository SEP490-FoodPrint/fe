import React, { createContext, useEffect, useState } from "react"

export const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [routerBeforeLogin, setRouterBeforeLogin] = useState("")
  const [isLoginContext, setIsLoginContext] = useState(false)
  const [loginFeedback, setLoginFeedback] = useState(null)
  const [user, setUser] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  // Recovery grants and credentials remain in memory and are never persisted.
  const [passwordRecovery, setPasswordRecovery] = useState(null)
  useEffect(() => {
    if (!passwordRecovery?.expiresAt) return
    const expiresAt = passwordRecovery.expiresAt
    const timer = setTimeout(() => setPasswordRecovery(current => current?.expiresAt === expiresAt ? { email: current.email, resendAt: current.resendAt } : current), Math.max(0, expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [passwordRecovery?.expiresAt])
  // Short-lived memory only: used to establish the cookie session after email verification.
  const [signupCredentials, setSignupCredentials] = useState(null)
  useEffect(() => {
    if (!signupCredentials) return
    const timer = setTimeout(() => setSignupCredentials(null), 10 * 60 * 1000)
    return () => clearTimeout(timer)
  }, [signupCredentials])

  const store = {
    routerBeforeStore: { routerBeforeLogin, setRouterBeforeLogin },
    loginStore: { isLoginContext, setIsLoginContext, loginFeedback, setLoginFeedback },
    userStore: { user, setUser },
    signupStore: { signupCredentials, setSignupCredentials },
    passwordRecoveryStore: { passwordRecovery, setPasswordRecovery },
    themeStore: { isDarkMode, setIsDarkMode },
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export default StoreProvider
