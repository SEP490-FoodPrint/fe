import React, { useContext } from "react"
import { Button, Result } from "antd"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { getDefaultRedirectByOrg } from "src/lib/utils"
import ROUTER from "src/router/ROUTER"

function NotFound() {
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  const isLoginContext = loginStore?.isLoginContext
  const user = userStore?.user

  const handleBack = () => {
    if (isLoginContext && user?.orgType) {
      navigate(getDefaultRedirectByOrg(user?.orgType))
    } else {
      navigate(ROUTER.LOGIN)
    }
  }

  return (
    <div style={{ padding: "60px 20px" }}>
      <Result
        status="404"
        title="404 - Không Tìm Thấy Trang"
        subTitle="Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển."
        extra={
          <Button type="primary" onClick={handleBack}>
            Quay lại trang chủ
          </Button>
        }
      />
    </div>
  )
}

export default NotFound
