import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function SchoolOverview() {
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
