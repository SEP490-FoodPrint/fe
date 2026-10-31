import React from "react"
import ExamplePageStub from "src/components/Common/ExamplePageStub"
import { ROLES } from "src/constants/roles"

function Administration() {
    return (
        <ExamplePageStub
            title="Quản trị Nhà trường (School Administration)"
            description="Quản lý thông tin chung trường học, danh sách lớp học, phân quyền nhân sự nhà trường và cấu hình hệ thống."
            allowedRoles={[ROLES.SCHOOL_ADMIN]}
        />
    )
}

export default Administration