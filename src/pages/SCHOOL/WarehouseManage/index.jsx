import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function WarehouseManage() {
  return (
    <ExamplePageStub
      title="Quản lý Kho Nguyên liệu & Yêu cầu Nhập hàng"
      description="Theo dõi tồn kho thực phẩm khô/tươi, hạn sử dụng, lập phiếu yêu cầu nhập hàng gửi sang nhà cung cấp."
      allowedRoles={[ROLES.INGREDIENT_MANAGEMENT]}
    />
  )
}

export default WarehouseManage
