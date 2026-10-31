import React, { useContext } from "react"
import { Navigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ROUTER from "src/router/ROUTER"
import ProfileForm from "./component/ProfileForm"

export default function ProfilePage() {
  const { loginStore, userStore } = useContext(StoreContext)
  if (!loginStore.isLoginContext || !userStore.user) return <Navigate to={ROUTER.LOGIN} replace />
  return <ProfileForm user={userStore.user} onUpdated={updated => userStore.setUser(current => ({ ...current, ...updated }))} />
}
