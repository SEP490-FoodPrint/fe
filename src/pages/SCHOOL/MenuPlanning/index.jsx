import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function MenuPlanning() {
  return (
    <ExamplePageStub
      title="Lập Thực đơn Dinh dưỡng & Cảnh báo Dị ứng"
      description="Cán bộ Y tế xây dựng khẩu phần cân bằng năng lượng theo độ tuổi và rà soát danh sách học sinh dị ứng món ăn."
      allowedRoles={[ROLES.SCHOOL_HEALTH_OFFICER]}
    />
  )
}

export default MenuPlanning
