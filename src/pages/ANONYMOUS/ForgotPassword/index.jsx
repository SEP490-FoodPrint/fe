import React from "react"
import { useLocation } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import AuthSplitLayout from "src/components/Auth/AuthSplitLayout/AuthSplitLayout"
import PasswordRecovery from "./component/PasswordRecovery"

export default function ForgotPasswordPage() {
  const location = useLocation()
  const step =
    location.pathname === ROUTER.RESET_PASSWORD
      ? "reset"
      : location.pathname === ROUTER.PASSWORD_RECOVERY_CODE
      ? "verify"
      : "email"

  return (
    <AuthSplitLayout cardMaxWidth={440}>
      <PasswordRecovery key={location.pathname} step={step} />
    </AuthSplitLayout>
  )
}
