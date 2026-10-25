import React, { useContext, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material"
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { MOCK_ACCOUNTS, ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import { getDefaultRedirectByOrg } from "src/lib/utils"
import notice from "src/components/Notice"

function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorText, setErrorText] = useState("")

  const { loginStore, userStore, routerBeforeStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const setUser = userStore?.setUser
  const routerBeforeLogin = routerBeforeStore?.routerBeforeLogin
  const setRouterBeforeLogin = routerBeforeStore?.setRouterBeforeLogin

  const handleLoginSuccess = (user) => {
    setIsLoginContext(true)
    setUser(user)
    notice({
      msg: "Đăng nhập thành công",
      desc: `Vai trò: ${ROLE_LABELS[user.role] || user.role}`,
      isSuccess: true,
    })

    const targetUrl = routerBeforeLogin || getDefaultRedirectByOrg(user.orgType)
    if (setRouterBeforeLogin) setRouterBeforeLogin("")
    navigate(targetUrl, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      setErrorText("Vui lòng nhập tên đăng nhập")
      return
    }
    setErrorText("")
    try {
      setLoading(true)
      const res = await AuthService.login({ username, password })
      if (res?.isOk) {
        handleLoginSuccess(res.Object.User)
      } else {
        setErrorText(res?.message || "Đăng nhập thất bại")
      }
    } catch {
      setErrorText("Lỗi kết nối máy chủ")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (roleCode) => {
    const { user } = AuthService.mockLoginByRole(roleCode)
    handleLoginSuccess(user)
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "var(--bg-page, #f8faf9)", py: 6, px: 2 }}>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Box textAlign="center" mb={5}>
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
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "400px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* Cột trái: Form đăng nhập chuẩn */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(29, 43, 38, 0.08)" }}>
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={700}>
                  Đăng nhập tài khoản
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            <CardContent>
              <Alert severity="info" sx={{ mb: 3, fontSize: "0.85rem" }}>
                Bạn có thể đăng nhập bằng tài khoản hoặc click nhanh 1 trong 9 vai trò bên phải để test quyền.
              </Alert>

              {errorText && (
                <Alert severity="error" sx={{ mb: 2, fontSize: "0.85rem" }}>
                  {errorText}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Tên đăng nhập"
                  variant="outlined"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: school_teacher"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Mật khẩu"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu bất kỳ"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 1, py: 1.2, fontWeight: 700 }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Cột phải: Bộ test nhanh 9 Roles */}
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(29, 43, 38, 0.08)" }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Typography variant="h6" fontWeight={700}>
                    ⚡ Đăng nhập Nhanh để Test Phân Quyền
                  </Typography>
                  <Chip label="1 Account = 1 Role" size="small" color="warning" sx={{ fontWeight: 600 }} />
                </Box>
              }
              subheader={
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Click vào bất kỳ tài khoản nào bên dưới để hệ thống tự động gán role và chuyển hướng:
                </Typography>
              }
            />
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {MOCK_ACCOUNTS.map((acc) => {
                  let orgColor = "primary"
                  if (acc.orgType === "SYSTEM") orgColor = "secondary"
                  if (acc.orgType === "SUPPLIER") orgColor = "success"

                  return (
                    <Card
                      key={acc.userId}
                      onClick={() => handleQuickLogin(acc.role)}
                      sx={{
                        cursor: "pointer",
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid var(--border-default, #dce5e0)",
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(10, 128, 102, 0.12)",
                        },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={acc.orgType}
                              size="small"
                              color={orgColor}
                              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                            />
                            <Typography fontWeight={600} fontSize="0.95rem">
                              {acc.fullName}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            Vai trò: <b style={{ color: "var(--color-primary, #0A8066)" }}>{ROLE_LABELS[acc.role]}</b>
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          endIcon={<ArrowForwardIcon fontSize="small" />}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          Vào thử
                        </Button>
                      </Box>
                    </Card>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage
