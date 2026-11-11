import React from "react"
import { Box, Typography } from "@mui/material"
import { Warehouse } from "lucide-react"
import styles from "./WarehouseHeader.module.scss"

export default function WarehouseHeader() {
  return (
    <Box className={styles.headerContainer}>
      <Box className={styles.titleGroup}>
        <Box className={styles.iconBadge}>
          <Warehouse size={24} />
        </Box>
        <Box>
          <Typography variant="h5" className={styles.pageTitle}>
            Quản Lý Kho Đồ Khô &amp; Gia Vị
          </Typography>
          <Typography variant="body2" className={styles.pageSubtitle}>
            Kiểm soát tồn kho gạo, dầu ăn, gia vị, theo dõi định mức an toàn và lập phiếu nhập hàng linh hoạt
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
