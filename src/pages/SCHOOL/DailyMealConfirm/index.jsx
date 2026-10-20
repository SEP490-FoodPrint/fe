import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function DailyMealConfirm() {
  return (
    <ExamplePageStub
      title="Báo Suất Ăn & Cập nhật Dị ứng Học sinh"
      description="Giáo viên chủ nhiệm chốt số lượng suất ăn mỗi sáng, cập nhật học sinh nghỉ và báo cáo phản ứng dị ứng sau bữa ăn."
      allowedRoles={[ROLES.HOMEROOM_TEACHER]}
    />
  )
}

export default DailyMealConfirm
