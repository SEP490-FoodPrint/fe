import React, { useContext } from "react"
import { Box, Typography, Button } from "@mui/material"
import SearchOffIcon from "@mui/icons-material/SearchOff"
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
        px: 2,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: "warning.main", mb: 2 }} />
      <Typography variant="h4" fontWeight={700} gutterBottom>
        404 - Không Tìm Thấy Trang
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={500} mb={3}>
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển.
      </Typography>
      <Button variant="contained" color="primary" onClick={handleBack}>
        Quay lại trang chủ
      </Button>
    </Box>
  )
}

export default NotFound
