import React, { useContext } from "react"
import { Navigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import RegistrationResult from "./component/RegistrationResult"

export default function RegistrationStatusPage() {
  const { loginStore, userStore } = useContext(StoreContext)
  if (!loginStore.isLoginContext) return <Navigate to={ROUTER.LOGIN} replace />
  if (!userStore.user?.registrationRequest) return <Navigate to={ROUTER.REGISTRATION_PROFILE} replace />
  return <RegistrationResult user={userStore.user} onUpdate={userStore.setUser} />
}
