import React, { useContext, useState } from "react"
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import CloseIcon from "@mui/icons-material/Close"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLES, ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"

function RoleSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  if (!loginStore?.isLoginContext) return null

  const handleSwitch = role => {
    AuthService.logout()
    loginStore.setIsLoginContext(false)
    userStore.setUser(null)
    setOpen(false)
    navigate(ROUTER.LOGIN, { state: { role }, replace: true })
  }

  return <>
    <Button variant="contained" startIcon={<SwapHorizIcon />} onClick={() => setOpen(true)}
      sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, borderRadius: 8 }}>
      Đổi vai trò ({ROLE_LABELS[userStore?.user?.role] || userStore?.user?.role})
    </Button>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
      <Box sx={{ width: { xs: 300, sm: 380 }, p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Chuyển tài khoản</Typography>
          <IconButton aria-label="Đóng" onClick={() => setOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <Typography color="text.secondary" sx={{ my: 2 }}>Chọn vai trò rồi đăng nhập bằng tài khoản tương ứng.</Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          {Object.values(ROLES).map(role => <Button key={role} variant={role === userStore?.user?.role ? "contained" : "outlined"}
            onClick={() => handleSwitch(role)}>{ROLE_LABELS[role]}</Button>)}
        </Box>
      </Box>
    </Drawer>
  </>
}

export default RoleSwitcher
