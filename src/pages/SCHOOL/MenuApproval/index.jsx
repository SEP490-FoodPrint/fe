import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function MenuApproval() {
  return (
    <ExamplePageStub
      title="Phê duyệt Thực đơn Bán trú"
      description="Ban Giám Hiệu và Admin xem xét định mức dinh dưỡng, chi phí suất ăn và phê duyệt thực đơn tuần."
      allowedRoles={[ROLES.SCHOOL_ADMIN, ROLES.SCHOOL_MANAGEMENT_BOARD]}
    />
  )
}

export default MenuApproval
