import React, { useContext } from "react"
import { Button, Result } from "antd"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import { getDefaultRedirectByOrg } from "src/lib/utils"

function Forbidden() {
  const navigate = useNavigate()
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  const handleGoHome = () => {
    const redirectUrl = getDefaultRedirectByOrg(user?.orgType)
    navigate(redirectUrl)
  }

  return (
    <div style={{ padding: "60px 20px" }}>
      <Result
        status="403"
        title="403 - Không Có Quyền Truy Cập"
        subTitle={
          <div>
            <p>Tài khoản của bạn không được phân quyền để truy cập vào màn hình này.</p>
            {user && (
              <p style={{ color: "#666", fontSize: "14px" }}>
                Vai trò hiện tại của bạn: <b>{ROLE_LABELS[user?.role] || user?.role}</b> (Thuộc tổ chức: {user?.orgName || user?.orgType})
              </p>
            )}
          </div>
        }
        extra={
          <Button type="primary" onClick={handleGoHome}>
            Quay lại trang tổng quan của bạn
          </Button>
        }
      />
    </div>
  )
}

export default Forbidden
