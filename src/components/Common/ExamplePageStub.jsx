import React, { useContext } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Chip,
  Typography,
  Breadcrumbs,
  Box,
} from "@mui/material"
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import LayersIcon from "@mui/icons-material/Layers"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"

function ExamplePageStub({ title, description, allowedRoles = [] }) {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  return (
    <Box sx={{ py: 1 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Typography color="text.secondary">
          {user?.orgName || user?.orgType || "FoodPrint"}
        </Typography>
        <Typography color="text.primary" fontWeight={600}>
          {title}
        </Typography>
      </Breadcrumbs>

      <Card sx={{ borderRadius: 3, boxShadow: "0 1px 4px rgba(29, 43, 38, 0.08)" }}>
        <CardHeader
          title={
            <Typography variant="h5" fontWeight={700} color="primary.main">
              {title}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {description}
            </Typography>
          }
          action={
            <Chip
              icon={<CheckCircleOutlinedIcon />}
              label="Đã xác thực quyền thành công"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          }
          sx={{ borderBottom: "1px solid var(--border-default, #DCE5E0)", pb: 2 }}
        />

        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "var(--green-50, #E8F5F1)",
              borderRadius: 2,
              border: "1px solid var(--green-200, #9BD6C5)",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="body2">
              👤 Người dùng hiện tại: <b>{user?.fullName}</b> (Tài khoản: <code>{user?.username}</code>)
            </Typography>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="body2">🏷️ Vai trò đang hoạt động:</Typography>
              <Chip
                label={ROLE_LABELS[user?.role] || user?.role}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="body2">🔒 Các vai trò được phép truy cập:</Typography>
              {allowedRoles.map((role) => (
                <Chip
                  key={role}
                  label={ROLE_LABELS[role] || role}
                  size="small"
                  variant={role === user?.role ? "filled" : "outlined"}
                  color={role === user?.role ? "primary" : "default"}
                />
              ))}
            </Box>
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
            textAlign="center"
          >
            <LayersIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} mb={0.5}>
              Màn hình mẫu: {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" maxWidth={500}>
              Trang này đã được cấu hình route và phân quyền hoàn chỉnh. Sẵn sàng để xây dựng giao diện chi tiết.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ExamplePageStub
