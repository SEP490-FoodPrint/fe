import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function IngredientOrders() {
  return (
    <ExamplePageStub
      title="Phiếu nhập & Đơn hàng"
      description="Quản lý danh sách phiếu yêu cầu nhập nguyên liệu, theo dõi tình trạng đơn đặt hàng gửi đến nhà cung cấp và lịch sử giao nhận hàng hóa."
      allowedRoles={[ROLES.INGREDIENT_MANAGEMENT]}
    />
  )
}

export default IngredientOrders
