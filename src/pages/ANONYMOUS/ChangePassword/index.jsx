import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { clearSignupSession } from "src/lib/signupSession"
import ROUTER from "src/router/ROUTER"
import ChangePasswordForm from "./component/ChangePasswordForm"

export default function ChangePasswordPage() {
  const { loginStore, userStore, signupStore, passwordRecoveryStore, routerBeforeStore } = useContext(StoreContext)
  const navigate = useNavigate()
  const success = () => {
    const identifier = userStore.user?.email || userStore.user?.username
    signupStore.setSignupCredentials(null)
    passwordRecoveryStore.setPasswordRecovery(null)
    clearSignupSession()
    loginStore.setLoginFeedback({ identifier, passwordUpdated: true })
    loginStore.setIsLoginContext(false)
    userStore.setUser(null)
    routerBeforeStore.setRouterBeforeLogin("")
    navigate(ROUTER.LOGIN, { replace: true, state: { identifier, passwordUpdated: true } })
  }
  return <ChangePasswordForm onSuccess={success} />
}
