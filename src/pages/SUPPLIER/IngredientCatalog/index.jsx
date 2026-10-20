import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function IngredientCatalog() {
  return (
    <ExamplePageStub
      title="Danh mục Nguyên liệu & Chứng nhận Nguồn gốc"
      description="Quản lý danh mục thực phẩm, nguồn gốc xuất xứ, chứng chỉ VietGAP, HACCP, lô hàng truy xuất."
      allowedRoles={[ROLES.INGREDIENT_SUPPLIER]}
    />
  )
}

export default IngredientCatalog
