import React, { useContext } from "react"
import { Box, Typography, Button } from "@mui/material"
import BlockIcon from "@mui/icons-material/Block"
import { useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"
import { getDefaultRedirectByOrg } from "src/lib/utils"

function Forbidden() {
  const navigate = useNavigate()
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  const handleGoHome = () => {
    const redirectUrl = getDefaultRedirectByOrg(user?.orgType)
    navigate(redirectUrl)
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="70vh"
      textAlign="center"
      px={2}
    >
      <BlockIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
      <Typography variant="h4" fontWeight={700} gutterBottom>
        403 - Không Có Quyền Truy Cập
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={600} mb={1}>
        Tài khoản của bạn không được phân quyền để truy cập vào màn hình này.
      </Typography>
      {user && (
        <Typography variant="body2" color="text.secondary" mb={3}>
          Vai trò hiện tại của bạn: <b>{ROLE_LABELS[user?.role] || user?.role}</b> (Thuộc tổ chức: {user?.orgName || user?.orgType})
        </Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoHome}
        sx={{ mt: 2 }}
      >
        Quay lại trang tổng quan của bạn
      </Button>
    </Box>
  )
}

export default Forbidden
