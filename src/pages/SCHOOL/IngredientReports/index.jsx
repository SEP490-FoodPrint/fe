import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function IngredientReports() {
  return (
    <ExamplePageStub
      title="Thống kê & Báo cáo"
      description="Báo cáo thống kê tổng hợp số liệu nhập - xuất - tồn kho, tỷ lệ hao hụt nguyên liệu theo thời gian thực và chi phí thu mua định kỳ."
      allowedRoles={[ROLES.INGREDIENT_MANAGEMENT]}
    />
  )
}

export default IngredientReports
