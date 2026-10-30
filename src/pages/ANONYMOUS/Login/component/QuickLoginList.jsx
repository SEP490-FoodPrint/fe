import React from "react"
import { Box, Button, Card, CardContent, CardHeader, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { ROLES, ROLE_LABELS } from "src/constants/roles"
import ROUTER from "src/router/ROUTER"
import styles from "./QuickLoginList.module.scss"

function QuickLoginList() {
  const navigate = useNavigate()
  return <Card className={styles.quickLoginCard}>
    <CardHeader title="Chọn vai trò đăng nhập" subheader="Sử dụng tài khoản được cấp. Quyền truy cập được xác nhận bởi máy chủ." />
    <CardContent>
      <Box display="flex" flexDirection="column" gap={1}>
        {Object.values(ROLES).map(role => <Button key={role} variant="outlined" onClick={() => navigate(ROUTER.LOGIN, { state: { role }, replace: true })}>
          <Typography>{ROLE_LABELS[role]}</Typography>
        </Button>)}
      </Box>
    </CardContent>
  </Card>
}

export default QuickLoginList
