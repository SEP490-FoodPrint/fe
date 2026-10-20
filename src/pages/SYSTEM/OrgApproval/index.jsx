import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function OrgApproval() {
  return (
    <ExamplePageStub
      title="Xét duyệt Tổ chức & Nhà cung cấp"
      description="Tiếp nhận hồ sơ đăng ký tham gia nền tảng từ các trường học và đơn vị cung ứng thực phẩm."
      allowedRoles={[ROLES.SYSTEM_ADMIN]}
    />
  )
}

export default OrgApproval
