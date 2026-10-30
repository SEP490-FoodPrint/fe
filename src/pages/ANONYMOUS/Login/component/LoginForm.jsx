import React, { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined"
import AuthService from "src/services/AuthService"
import styles from "./LoginForm.module.scss"

function LoginForm({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorText, setErrorText] = useState("")

  const handleSubmit = async e => {
    e.preventDefault()
    if (!username.trim()) {
      setErrorText("Vui lòng nhập tên đăng nhập")
      return
    }
    if (!password) {
      setErrorText("Vui lòng nhập mật khẩu")
      return
    }
    setErrorText("")
    try {
      setLoading(true)
      const res = await AuthService.login({ username, password })
      if (res?.isOk) {
        onLoginSuccess(res.Object.User)
      } else {
        setErrorText(res?.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      setErrorText(error?.response?.data?.message || error.message || "Lỗi kết nối máy chủ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={styles.loginCard}>
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
          Đăng nhập bằng tài khoản được cấp để xem dữ liệu của đơn vị bạn.
        </Alert>

        {errorText && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "0.85rem" }}>
            {errorText}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Tên đăng nhập hoặc email"
            autoComplete="username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Tên đăng nhập hoặc email đã đăng ký"
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
            autoComplete="current-password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mật khẩu tài khoản"
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
            className={styles.submitBtn}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default LoginForm
