import React, { useContext } from "react"
import { Navigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLES } from "src/constants/roles"
import ROUTER from "src/router/ROUTER"
import ProfileForm from "./component/ProfileForm"
import SchoolLogoCard from "./component/SchoolLogoCard"

export default function ProfilePage() {
  const { loginStore, userStore } = useContext(StoreContext)
  if (!loginStore.isLoginContext || !userStore.user) return <Navigate to={ROUTER.LOGIN} replace />
  const user = userStore.user
  // Chỉ Quản trị nhà trường đổi được logo trường (quyền school.manage ở backend)
  const isSchoolAdmin = user.role === ROLES.SCHOOL_ADMINISTRATION && Boolean(user.schoolId)
  return (
    <ProfileForm user={user} onUpdated={updated => userStore.setUser(current => ({ ...current, ...updated }))}>
      {isSchoolAdmin && <SchoolLogoCard schoolId={user.schoolId} />}
    </ProfileForm>
  )
}
