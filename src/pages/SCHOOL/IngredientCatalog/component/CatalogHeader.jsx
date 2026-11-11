import React from "react"
import { Box, Typography } from "@mui/material"
import { BookOpen } from "lucide-react"
import styles from "./CatalogHeader.module.scss"

export default function CatalogHeader() {
  return (
    <Box className={styles.headerContainer}>
      <Box className={styles.titleGroup}>
        <Box className={styles.iconBadge}>
          <BookOpen size={24} />
        </Box>
        <Box>
          <Typography variant="h5" className={styles.pageTitle}>
            Danh Mục Nguyên Liệu Chuẩn
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
