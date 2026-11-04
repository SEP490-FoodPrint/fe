import React from "react"
import PropTypes from "prop-types"
import { Box, Typography } from "@mui/material"
import { BookOpen } from "lucide-react"
import styles from "./OrderListHeader.module.scss"

export default function OrderListHeader() {
  return (
    <Box className={styles.headerContainer}>
      <Box className={styles.titleGroup}>
        <Box className={styles.iconBadge}>
          <BookOpen className={styles.icon} size={24} />
        </Box>
        <Box>
          <Typography variant="h5" className={styles.pageTitle}>
            Phiếu Nhập & Đơn Hàng Nguyên Liệu
          </Typography>
          <Typography variant="body2" className={styles.pageSubtitle}>
            Quản lý danh mục nguyên liệu chuẩn của trường, theo dõi đơn đặt hàng và tiếp nhận phiếu nhập kho
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
