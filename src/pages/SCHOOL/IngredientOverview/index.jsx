import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function IngredientOverview() {
  return (
    <ExamplePageStub
      title="Tổng quan Quản lý Kho & Nguyên liệu"
      description="Bảng điều khiển trung tâm theo dõi số lượng tồn kho thực phẩm, cảnh báo hạn sử dụng, tiến độ đơn nhập hàng và kết quả kiểm tra nguyên liệu đầu vào."
      allowedRoles={[ROLES.INGREDIENT_MANAGEMENT]}
    />
  )
}

export default IngredientOverview
