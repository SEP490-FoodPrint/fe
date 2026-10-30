import React from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Typography,
} from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { MOCK_ACCOUNTS, ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import styles from "./QuickLoginList.module.scss"

function QuickLoginList({ onLoginSuccess }) {
  const handleQuickLogin = async roleCode => {
    try {
      const { user } = await AuthService.quickLoginByRole(roleCode)
      onLoginSuccess(user)
    } catch {
      // Axios interceptor hiển thị thông báo lỗi kết nối/xác thực.
    }
  }

  return (
    <Card className={styles.quickLoginCard}>
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
          {MOCK_ACCOUNTS.map(acc => {
            let orgColor = "primary"
            if (acc.orgType === "SYSTEM") orgColor = "secondary"
            if (acc.orgType === "SUPPLIER") orgColor = "success"

            return (
              <Box
                key={acc.userId}
                onClick={() => handleQuickLogin(acc.role)}
                className={styles.roleItem}
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
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickLoginList
