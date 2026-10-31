import React from "react"
import { useLocation } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import PasswordRecovery from "./component/PasswordRecovery"

export default function ForgotPasswordPage() {
  const location = useLocation()
  const step = location.pathname === ROUTER.RESET_PASSWORD ? "reset" : location.pathname === ROUTER.PASSWORD_RECOVERY_CODE ? "verify" : "email"
  return <PasswordRecovery key={location.pathname} step={step} />
}
