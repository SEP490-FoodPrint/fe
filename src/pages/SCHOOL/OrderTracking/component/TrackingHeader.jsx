import React from "react"
import PropTypes from "prop-types"
import { Box, Typography, Button, CircularProgress } from "@mui/material"
import { Truck, RotateCw } from "lucide-react"
import styles from "./TrackingHeader.module.scss"

export default function TrackingHeader({ onRefresh, loading = false }) {
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
        </Box>
      </Box>
    </Box>
  )
}

TrackingHeader.propTypes = {
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
}
