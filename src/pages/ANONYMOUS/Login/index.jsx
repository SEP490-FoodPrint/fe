import React, { useContext } from "react"
import { Box, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import { getDefaultRedirectByOrg } from "src/lib/utils"
import notice from "src/components/Notice"
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

    const targetUrl = routerBeforeLogin || getDefaultRedirectByOrg(user.orgType)
    if (setRouterBeforeLogin) setRouterBeforeLogin("")
    navigate(targetUrl, { replace: true })
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="login-header">
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
            gutterBottom
            sx={{ letterSpacing: "-0.5px" }}
          >
            🥗 FOODPRINT - QUẢN LÝ SUẤT ĂN HỌC ĐƯỜNG
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hệ thống Quản lý và Truy xuất Nguồn gốc Bữa ăn An toàn & Dinh dưỡng
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
