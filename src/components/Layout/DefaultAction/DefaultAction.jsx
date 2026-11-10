import React, { useContext, useEffect, useState } from "react"
import { Alert, Box, Button } from "@mui/material"
import FoodPrintLoading from "src/components/FoodPrintLoading"
import { StoreContext } from "src/contexts"
import AuthService from "src/services/AuthService"
import { useLocation } from "react-router-dom"
import ROUTER from "src/router/ROUTER"

/**
 * Validate the saved session before route guards run.
 */
const DefaultAction = ({ children }) => {
  const { loginStore, userStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const isLoginContext = loginStore?.isLoginContext
  const setUser = userStore?.setUser
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const location = useLocation()
  const publicAuth = [ROUTER.DEFAULT, ROUTER.LOGIN, ROUTER.TEST_LOGIN, ROUTER.REGISTER, ROUTER.FORGOT_PASSWORD, ROUTER.PASSWORD_RECOVERY_CODE, ROUTER.RESET_PASSWORD, ROUTER.ACTIVATE_ACCOUNT].includes(location.pathname)

  useEffect(() => {
    if (isLoginContext) { setReady(true); return }
    let active = true
    const controller = new AbortController()
    setError("")
    AuthService.restoreSession({ signal: controller.signal }).then(user => {
      if (!active) return
      setIsLoginContext?.(Boolean(user))
      setUser?.(user)
      setReady(true)
    }).catch(err => {
      if (!active) return
      if ([401, 403].includes(err.response?.status)) {
        AuthService.clearSavedSession()
        setIsLoginContext?.(false)
        setUser?.(null)
        setReady(true)
      } else setError(err.message || "Không thể khôi phục phiên đăng nhập.")
    })
    return () => { active = false; controller.abort() }
  }, [setIsLoginContext, setUser, retry, isLoginContext])

  if (!ready && !publicAuth) {
    if (error) {
      return (
        <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
          <Alert severity="error" action={<Button onClick={() => setRetry(value => value + 1)}>Thử lại</Button>}>{error}</Alert>
        </Box>
      )
    }
    return <FoodPrintLoading fullscreen background="cream" />
  }

  return <>{children}</>
}

export default DefaultAction
