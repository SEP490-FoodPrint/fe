import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function SupplyOrders() {
  return (
    <ExamplePageStub
      title="Đơn hàng Cung ứng Suất ăn"
      description="Tiếp nhận yêu cầu nhập nguyên liệu từ các trường học, xác nhận đơn hàng và lịch trình giao hàng."
      allowedRoles={[ROLES.INGREDIENT_SUPPLIER]}
    />
  )
}

export default SupplyOrders
