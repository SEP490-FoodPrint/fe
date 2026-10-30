import React, { useContext } from "react"
import { Navigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"
import ROUTER from "src/router/ROUTER"

function SchoolOverview() {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  // Nếu là Nhân viên bếp -> Điều hướng thẳng vào Bảng điều khiển Bếp theo mẫu Stitch
  if (user?.role === ROLES.SCHOOL_KITCHEN_STAFF) {
    return <Navigate to={ROUTER.SCHOOL_KITCHEN_COOKING} replace />
  }

  return (
    <ExamplePageStub
      title="Tổng quan Trường học (School Overview)"
      description="Dashboard toàn cảnh bữa ăn học đường trong ngày, tỷ lệ học sinh ăn bán trú, trạng thái bếp nấu."
      allowedRoles={[
        ROLES.SCHOOL_ADMIN,
        ROLES.SCHOOL_MANAGEMENT_BOARD,
        ROLES.SCHOOL_HEALTH_OFFICER,
        ROLES.SCHOOL_KITCHEN_STAFF,
        ROLES.HOMEROOM_TEACHER,
        ROLES.PARENTS_COMMITTEE,
        ROLES.INGREDIENT_MANAGEMENT,
      ]}
    />
  )
}

export default SchoolOverview
