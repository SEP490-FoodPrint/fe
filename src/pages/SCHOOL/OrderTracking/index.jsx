import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

export default function OrderTracking() {
  return (
    <ExamplePageStub
      title="Theo Dõi Đơn Hàng Cung Ứng"
      description="Theo dõi tiến độ đơn hàng và trạng thái cung cấp từ nhà cung cấp (Tính năng đang phát triển)."
      allowedRoles={[ROLES.INGREDIENT_MANAGEMENT]}
    />
  )
}
