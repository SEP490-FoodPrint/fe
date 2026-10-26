import React, { useContext } from "react"
import PropTypes from "prop-types"
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material"
import {
  CheckCircle2,
  Layers,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"
import { StoreContext } from "src/contexts"
import { ROLE_LABELS } from "src/constants/roles"

function ExamplePageStub({ title, description, allowedRoles = [] }) {
  const { userStore } = useContext(StoreContext)
  const user = userStore?.user

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Header Banner của Màn hình */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          boxShadow: "0 1px 4px rgba(29, 43, 38, 0.05)",
          border: "1px solid var(--border-default)",
          bgcolor: "var(--bg-surface)",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          flexDirection={{ xs: "column", md: "row" }}
          gap={2}
        >
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Chip
                label="FoodPrint Architecture"
                size="small"
                sx={{
                  bgcolor: "var(--color-primary-soft)",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                  fontSize: "11px",
                  borderRadius: "6px",
                  height: "22px",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                • Phân hệ: {user?.orgName || user?.orgType || "Nhà trường"}
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" maxWidth={720}>
              {description}
            </Typography>
          </Box>

          <Chip
            icon={<CheckCircle2 size={16} color="var(--color-success)" />}
            label="Xác thực quyền thành công"
            sx={{
              bgcolor: "var(--color-success-bg)",
              color: "var(--color-success)",
              border: "1px solid var(--color-success-border)",
              fontWeight: 600,
              fontSize: "12px",
              py: 0.5,
            }}
          />
        </Box>
      </Card>

      {/* 2. Khối Thông tin Người dùng & Phân quyền */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 1px 4px rgba(29, 43, 38, 0.05)",
          border: "1px solid var(--border-default)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              p: 2.5,
              bgcolor: "var(--color-primary-soft)",
              borderRadius: 2,
              border: "1px solid rgba(var(--color-primary-rgb), 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <User size={16} color="var(--color-primary)" />
              <Typography variant="body2" color="text.primary">
                Tài khoản đang đăng nhập: <b>{user?.fullName}</b> (<code>{user?.username}</code>)
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <ShieldCheck size={16} color="var(--color-primary)" />
              <Typography variant="body2" color="text.primary">
                Vai trò của bạn:
              </Typography>
              <Chip
                label={ROLE_LABELS[user?.role] || user?.role}
                size="small"
                sx={{
                  bgcolor: "var(--color-primary)",
                  color: "var(--white)",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              />
            </Box>

            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Users size={16} color="var(--color-primary)" />
              <Typography variant="body2" color="text.primary">
                Các vai trò được phép truy cập màn hình này:
              </Typography>
              {allowedRoles.map(role => (
                <Chip
                  key={role}
                  label={ROLE_LABELS[role]?.split("(")[0]?.trim() || role}
                  size="small"
                  variant={role === user?.role ? "filled" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "11px",
                    bgcolor: role === user?.role ? "var(--color-primary)" : "transparent",
                    color: role === user?.role ? "var(--white)" : "var(--text-secondary)",
                    borderColor: "var(--border-default)",
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Vùng Placeholder Canvas chuẩn */}
          <Box
            sx={{
              py: 8,
              px: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              bgcolor: "var(--bg-muted)",
              borderRadius: 2.5,
              border: "2px dashed var(--border-default)",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "var(--color-primary-soft)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Layers size={32} />
            </Box>

            <Typography variant="h6" fontWeight={700} color="text.primary" mb={0.5}>
              Vùng nội dung theo màn hình
            </Typography>
            <Typography variant="body2" color="text.secondary" maxWidth={540} lineHeight={1.6}>
              Khu vực hiển thị nội dung động đặc thù theo từng vai trò nghiệp vụ (Biểu đồ, Bảng tra cứu, Báo cáo, Giám sát bữa ăn, Tiếp nhận nguyên liệu...). Kích thước tự co giãn linh hoạt theo tỷ lệ màn hình.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

ExamplePageStub.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  allowedRoles: PropTypes.array,
}

export default ExamplePageStub
