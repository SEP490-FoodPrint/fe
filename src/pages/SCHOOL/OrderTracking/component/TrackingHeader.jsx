import React from "react"
import { Box, Typography } from "@mui/material"
import { Truck } from "lucide-react"
import styles from "./TrackingHeader.module.scss"

export default function TrackingHeader() {
  return (
    <Box className={styles.headerContainer}>
      <Box className={styles.titleGroup}>
        <Box className={styles.iconBadge}>
          <Truck size={24} />
        </Box>
        <Box>
          <Typography variant="h5" className={styles.pageTitle}>
            Theo Dõi Đơn Hàng &amp; Vận Chuyển
          </Typography>
          <Typography variant="body2" className={styles.pageSubtitle}>
            Giám sát thời gian thực tiến độ giao nhận thực phẩm tươi sống (Đợt 1 / Đợt 2) và đồ khô
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
