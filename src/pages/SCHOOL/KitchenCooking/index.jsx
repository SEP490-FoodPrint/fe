import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function KitchenCooking() {
  return (
    <ExamplePageStub
      title="Quy trình Bếp Nấu & Lưu Mẫu Thực phẩm"
      description="Quản lý các mẻ nấu, nhiệt độ chế biến, phân bổ khẩu phần theo lớp và ghi nhật ký lưu mẫu thức ăn 24h."
      allowedRoles={[ROLES.SCHOOL_KITCHEN_STAFF]}
    />
  )
}

export default KitchenCooking
