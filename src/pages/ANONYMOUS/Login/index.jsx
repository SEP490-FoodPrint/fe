import React, { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLES } from "src/constants/roles"
import { getAuthRedirect, needsRegistrationCompletion } from "src/lib/utils"
import { USE_MOCK_API } from "src/lib/config"
import ROUTER from "src/router/ROUTER"
import LoginForm from "./component/LoginForm"
import QuickLoginList from "./component/QuickLoginList"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginStore, userStore, routerBeforeStore, signupStore } = useContext(StoreContext)
  const [feedback] = useState(() => loginStore.loginFeedback || location.state)
  useEffect(() => { loginStore.setLoginFeedback(null) }, [loginStore.setLoginFeedback])
  const onSuccess = user => {
    loginStore.setIsLoginContext(true)
    userStore.setUser(user)
    signupStore.setSignupCredentials(null)
    const target = user.role === ROLES.SYSTEM_ADMIN || user.onboardingRequired
      ? getAuthRedirect(user)
      : routerBeforeStore.routerBeforeLogin || getAuthRedirect(user)
    routerBeforeStore.setRouterBeforeLogin("")
    navigate(target || ROUTER.DEFAULT, { replace: true, state: target === ROUTER.DEFAULT && needsRegistrationCompletion(user) ? { promptRegistration: true } : null })
  }
  return <>
    <LoginForm initialIdentifier={feedback?.identifier || ""} passwordUpdated={feedback?.passwordUpdated === true} onLoginSuccess={onSuccess} />
    {USE_MOCK_API && <QuickLoginList onLoginSuccess={onSuccess} />}
  </>
}
