import React from "react"
import PropTypes from "prop-types"
import { Box, Pagination, Typography } from "@mui/material"
import styles from "./WarehousePagination.module.scss"

export default function WarehousePagination({ page, count, totalItems, pageSize, onPageChange }) {
  if (totalItems <= pageSize) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <Box className={styles.paginationContainer}>
      <Typography variant="body2" className={styles.pageInfo}>
        Hiển thị {from} - {to} trên tổng số {totalItems} mục
      </Typography>
      <Pagination
        count={count}
        page={page}
        onChange={(_, val) => onPageChange(val)}
        color="primary"
        shape="rounded"
        className={styles.pagination}
      />
    </Box>
  )
}

WarehousePagination.propTypes = {
  page: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
}
