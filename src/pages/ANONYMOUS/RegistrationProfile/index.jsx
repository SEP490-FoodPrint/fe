import React, { useContext } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { getAuthRedirect } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"
import OrganizationProfileForm from "./component/OrganizationProfileForm"

export default function RegistrationProfilePage() {
  const { loginStore, userStore } = useContext(StoreContext)
  const navigate = useNavigate()
  const user = userStore.user
  if (!loginStore.isLoginContext) return <Navigate to={ROUTER.LOGIN} replace />
  if (!user?.onboardingRequired) return <Navigate to={user?.registrationRequest ? ROUTER.REGISTRATION_STATUS : getAuthRedirect(user)} replace />
  return <OrganizationProfileForm requestType={user.orgType} editing={Boolean(user.registrationRequest)} onSubmitted={request => {
    userStore.setUser(current => ({ ...current, registrationRequest: { id: request.id, status: request.status, submittedAt: request.submittedAt, rejectionReason: request.rejectionReason }, status: request.accountStatus, onboardingRequired: true }))
    navigate(ROUTER.REGISTRATION_STATUS, { replace: true })
  }} />
}
