import React from "react"
import { Box, Typography } from "@mui/material"
import { Truck } from "lucide-react"
import styles from "./DeliveryHeader.module.scss"

export default function DeliveryHeader() {
  return (
    <Box className={styles.headerContainer}>
      <Box className={styles.titleGroup}>
        <Box className={styles.iconBadge}>
          <Truck size={24} />
        </Box>
        <Box>
          <Typography variant="h5" className={styles.pageTitle}>
            Phiếu Nhập Hàng
          </Typography>
          <Typography variant="body2" className={styles.pageSubtitle}>
            Quản lý phiếu giao nhận thực phẩm 2 đợt theo thực đơn, nghiệm thu 4 bên và kiểm soát số lượng
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
