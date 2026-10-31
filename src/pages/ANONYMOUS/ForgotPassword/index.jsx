import React from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import PasswordRecovery from "./component/PasswordRecovery"

export default function ForgotPasswordPage() {
  const location = useLocation()
  const [params] = useSearchParams()
  return <PasswordRecovery key={location.pathname} reset={location.pathname === ROUTER.RESET_PASSWORD} hasToken={Boolean(params.get("token"))} />
}
