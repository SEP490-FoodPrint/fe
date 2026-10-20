import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function MealFeedback() {
  return (
    <ExamplePageStub
      title="Ý kiến & Phản ánh Chất lượng Bữa ăn"
      description="Kênh gửi phản hồi từ Ban phụ huynh và Giáo viên; Ban Giám hiệu tiếp nhận và xử lý sự cố an toàn thực phẩm."
      allowedRoles={[
        ROLES.PARENTS_COMMITTEE,
        ROLES.HOMEROOM_TEACHER,
        ROLES.SCHOOL_MANAGEMENT_BOARD,
      ]}
    />
  )
}

export default MealFeedback
