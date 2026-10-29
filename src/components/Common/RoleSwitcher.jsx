import React, { useContext, useState } from "react"
import {
  Button,
  Drawer,
  Chip,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Box,
  IconButton,
} from "@mui/material"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import CloseIcon from "@mui/icons-material/Close"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { MOCK_ACCOUNTS, ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import { getDefaultRedirectByOrg, getDefaultRedirectByUser } from "src/lib/utils"

function RoleSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  const isLoginContext = loginStore?.isLoginContext
  const setIsLoginContext = loginStore?.setIsLoginContext
  const user = userStore?.user
  const setUser = userStore?.setUser

  if (!isLoginContext) return null

  const handleSwitch = (roleCode) => {
    const { user: newUser } = AuthService.mockLoginByRole(roleCode)
    setIsLoginContext(true)
    setUser(newUser)
    setOpen(false)
    navigate(getDefaultRedirectByUser(newUser))
  }

  return (
    <>
      <Tooltip title="Đổi vai trò nhanh (Test phân quyền)">
        <Button
          variant="contained"
          color="primary"
          startIcon={<SwapHorizIcon />}
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            borderRadius: 8,
            boxShadow: "0 4px 16px rgba(10, 128, 102, 0.4)",
            height: 44,
            px: 2,
          }}
        >
          Đổi Vai Trò ({ROLE_LABELS[user?.role]?.split("(")[0]?.trim() || user?.role})
        </Button>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: 380, p: 3 },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" fontWeight={700}>
            ⚡ Chuyển Đổi Nhanh 9 Vai Trò
          </Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Chọn một vai trò bất kỳ để chuyển đổi tức thì. Menu Sidebar và quyền truy cập sẽ tự động thay đổi theo:
        </Typography>

        <Box display="flex" flexDirection="column" gap={1.5}>
          {MOCK_ACCOUNTS.map((acc) => {
            const isCurrent = acc.role === user?.role
            return (
              <Card
                key={acc.userId}
                onClick={() => handleSwitch(acc.role)}
                sx={{
                  cursor: "pointer",
                  border: isCurrent ? "2px solid #0A8066" : "1px solid #E8EEEB",
                  bgcolor: isCurrent ? "#E8F5F1" : "#FFFFFF",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#0A8066",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <CardContent sx={{ p: "12px !important" }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography fontWeight={600} fontSize="0.95rem">
                      {acc.fullName}
                    </Typography>
                    {isCurrent && (
                      <Chip
                        label="Đang chọn"
                        size="small"
                        color="primary"
                        sx={{ height: 22, fontSize: "0.75rem" }}
                      />
                    )}
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Chip
                      label={acc.orgType}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {ROLE_LABELS[acc.role]}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      </Drawer>
    </>
  )
}

export default RoleSwitcher
