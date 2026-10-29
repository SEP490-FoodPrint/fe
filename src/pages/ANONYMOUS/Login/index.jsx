import React, { useContext } from "react"
import { Box, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import { getDefaultRedirectByOrg, getDefaultRedirectByUser } from "src/lib/utils"
import notice from "src/components/Notice"
import BrandLogo from "src/components/Common/BrandLogo"
import LoginForm from "./component/LoginForm"
import QuickLoginList from "./component/QuickLoginList"
import "./style.scss"

function LoginPage() {
  const navigate = useNavigate()
  const { loginStore, userStore, routerBeforeStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const setUser = userStore?.setUser
  const routerBeforeLogin = routerBeforeStore?.routerBeforeLogin
  const setRouterBeforeLogin = routerBeforeStore?.setRouterBeforeLogin

  const handleLoginSuccess = user => {
    if (setIsLoginContext) setIsLoginContext(true)
    if (setUser) setUser(user)

    notice({
      msg: "Đăng nhập thành công",
      desc: `Vai trò: ${ROLE_LABELS[user.role] || user.role}`,
      isSuccess: true,
    })

    const targetUrl = routerBeforeLogin || getDefaultRedirectByUser(user)
    if (setRouterBeforeLogin) setRouterBeforeLogin("")
    navigate(targetUrl, { replace: true })
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-header">
          <Box display="flex" justifyContent="center" mb={1.5}>
            <BrandLogo theme="light" />
          </Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            HỆ THỐNG QUẢN LÝ SUẤT ĂN HỌC ĐƯỜNG
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Nền tảng Quản lý & Truy xuất Nguồn gốc Bữa ăn An toàn, Dinh dưỡng cho Trường học
          </Typography>
        </div>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "400px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <LoginForm onLoginSuccess={handleLoginSuccess} />
          <QuickLoginList onLoginSuccess={handleLoginSuccess} />
        </Box>
      </div>
    </div>
  )
}

export default LoginPage
