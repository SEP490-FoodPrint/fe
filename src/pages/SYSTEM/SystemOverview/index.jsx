import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function SystemOverview() {
  return (
    <ExamplePageStub
      title="Tổng quan Nền tảng (System Overview)"
      description="Giám sát hoạt động toàn bộ hệ thống FoodPrint, số lượng trường học và nhà cung cấp."
      allowedRoles={[ROLES.SYSTEM_ADMIN]}
    />
  )
}

export default SystemOverview
