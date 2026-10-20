import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function IngredientInspect() {
  return (
    <ExamplePageStub
      title="Hội đồng Đồng Kiểm tra Nguyên liệu Đầu vào"
      description="Biên bản kiểm tra 3 bên (Y tế trường, Đại diện Ban phụ huynh, Thủ kho) khi nhà cung cấp giao nguyên liệu tươi sống."
      allowedRoles={[
        ROLES.SCHOOL_HEALTH_OFFICER,
        ROLES.PARENTS_COMMITTEE,
        ROLES.INGREDIENT_MANAGEMENT,
      ]}
    />
  )
}

export default IngredientInspect
