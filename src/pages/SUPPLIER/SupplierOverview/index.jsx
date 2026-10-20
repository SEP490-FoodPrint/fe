import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function SupplierOverview() {
  return (
    <ExamplePageStub
      title="Tổng quan Nhà Cung Cấp"
      description="Thống kê sản lượng nguyên liệu cung cấp, hợp đồng với các trường và tình trạng giao hàng."
      allowedRoles={[ROLES.INGREDIENT_SUPPLIER]}
    />
  )
}

export default SupplierOverview
