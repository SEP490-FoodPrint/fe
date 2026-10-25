import React, { useContext, useState } from "react"
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material"
import LogoutIcon from "@mui/icons-material/Logout"
import PersonIcon from "@mui/icons-material/Person"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import AuthService from "src/services/AuthService"
import ROUTER from "src/router/ROUTER"

function TopHeader() {
  const navigate = useNavigate()
  const { loginStore, userStore } = useContext(StoreContext)
  const setIsLoginContext = loginStore?.setIsLoginContext
  const user = userStore?.user
  const setUser = userStore?.setUser

  const [anchorEl, setAnchorEl] = useState(null)
  const isMenuOpen = Boolean(anchorEl)

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseUserMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleCloseUserMenu()
    AuthService.logout()
    if (setIsLoginContext) setIsLoginContext(false)
    if (setUser) setUser(null)
    navigate(ROUTER.LOGIN, { replace: true })
  }

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        bgcolor: "#ffffff",
        borderBottom: "1px solid var(--border-default, #dce5e0)",
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 1px 4px rgba(29, 43, 38, 0.06)",
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Typography
          variant="h6"
          fontWeight={800}
          color="primary.main"
          sx={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 0.5 }}
          onClick={() => navigate(ROUTER.DEFAULT)}
        >
          🥗 FoodPrint
        </Typography>
        {user?.orgName && (
          <Chip
            label={user.orgName}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: "0.8rem", height: 24 }}
          />
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        {user && (
          <>
            <Box
              onClick={handleOpenUserMenu}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                cursor: "pointer",
                p: "4px 8px",
                borderRadius: 2,
                transition: "background 0.2s",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              <Avatar
                src={user.avatar}
                sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: "0.9rem" }}
              >
                {!user.avatar && <PersonIcon fontSize="small" />}
              </Avatar>
              <Box display="flex" flexDirection="column" textAlign="left">
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                  {user.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ROLE_LABELS[user.role]?.split("(")[0]?.trim() || user.role}
                </Typography>
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleCloseUserMenu}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: { width: 220, mt: 1, borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {user.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.orgName || user.orgType}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "error.main", gap: 1 }}>
                <LogoutIcon fontSize="small" />
                <Typography variant="body2" fontWeight={600}>
                  Đăng xuất
                </Typography>
              </MenuItem>
            </Menu>
          </>
        )}

        <Tooltip title="Đăng xuất">
          <IconButton size="small" onClick={handleLogout} sx={{ color: "text.secondary" }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export default TopHeader
