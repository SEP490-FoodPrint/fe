import React, { useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import {  ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import styles from "./QuickLoginList.module.scss"
import { MOCK_ACCOUNTS } from "src/services/SchoolService/mockData"

function QuickLoginList({ onLoginSuccess }) {
  const [loadingUser, setLoadingUser] = useState(null)

  const handleQuickLogin = async acc => {
    try {
      setLoadingUser(acc.username)
      const { user } = await AuthService.login({
        identifier: acc.username,
        password: "123456",
      })
      if (user) {
        onLoginSuccess(user)
        return
      }
      // Fallback nếu có lỗi
      const { user: mockUser } = AuthService.mockLoginByRole(acc.role)
      onLoginSuccess(mockUser)
    } catch {
      const { user: mockUser } = AuthService.mockLoginByRole(acc.role)
      onLoginSuccess(mockUser)
    } finally {
      setLoadingUser(null)
    }
  }

  return (
    <Card className={styles.quickLoginCard}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>
              ⚡ Đăng nhập Nhanh để Test Phân Quyền
            </Typography>
            <Chip
              label="11 Tài khoản Demo"
              size="small"
              color="warning"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Click vào tài khoản demo bên dưới để tự động cấp Cookie, gán Role và điều hướng:
          </Typography>
        }
      />
      <CardContent sx={{ pt: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
          {MOCK_ACCOUNTS.map(acc => {
            let orgColor = "primary"
            if (acc.orgType === "SYSTEM") orgColor = "secondary"
            if (acc.orgType === "SUPPLIER") orgColor = "success"
            if (acc.orgType === "AUTHORITY") orgColor = "info"

            const isLoading = loadingUser === acc.username

            return (
              <Box
                key={acc.userId}
                onClick={() => !isLoading && handleQuickLogin(acc)}
                className={styles.roleItem}
                sx={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "wait" : "pointer" }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={acc.orgType}
                        size="small"
                        color={orgColor}
                        sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                      />
                      <Typography fontWeight={600} fontSize="0.95rem">
                        {acc.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({acc.username})
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Vai trò: <b style={{ color: "var(--color-primary, #0A8066)" }}>{ROLE_LABELS[acc.role] || acc.role}</b>
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    disabled={isLoading}
                    endIcon={
                      isLoading ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <ArrowForwardIcon fontSize="small" />
                      )
                    }
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    {isLoading ? "Đang vào..." : "Vào thử"}
                  </Button>
                </Box>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickLoginList
