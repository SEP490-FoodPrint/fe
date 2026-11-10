import React from "react"
import PropTypes from "prop-types"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from "@mui/material"
import { HANDLING_TYPES } from "src/services/IngredientOrderService/adapter"
import styles from "./CatalogTable.module.scss"

export default function CatalogTable({ catalog = [] }) {
  return (
    <TableContainer component={Paper} className={styles.tableWrapper}>
      <Table className={styles.table} aria-label="Bảng danh mục nguyên liệu chuẩn">
        <TableHead className={styles.tableHead}>
          <TableRow>
            <TableCell>Tên nguyên liệu</TableCell>
            <TableCell>Nhóm mặt hàng</TableCell>
            <TableCell>Phân loại kho</TableCell>
            <TableCell align="center">Đơn vị</TableCell>
            <TableCell align="center">Hạn dùng tối đa</TableCell>
            <TableCell align="right">Đơn giá tham chiếu</TableCell>
            <TableCell>Nhà cung cấp đối tác</TableCell>
            <TableCell>Yêu cầu bảo quản & Quy cách</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {catalog.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" className={styles.emptyCell}>
                Không có nguyên liệu nào phù hợp với bộ lọc
              </TableCell>
            </TableRow>
          ) : (
            catalog.map(item => {
              const handling = HANDLING_TYPES[item.handlingType] || HANDLING_TYPES.DIRECT_USE
              return (
                <TableRow key={item.id} className={styles.tableRow} hover>
                  <TableCell>
                    <Typography variant="subtitle2" className={styles.ingName}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className={styles.categoryText}>
                      {item.category}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={handling.label}
                      size="small"
                      className={styles.handlingChip}
                      style={{ backgroundColor: handling.bg, color: handling.color }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" className={styles.unitText}>
                      {item.defaultUnit}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" className={styles.shelfLifeText}>
                      {item.shelfLifeDays ? `${item.shelfLifeDays} ngày` : "--"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" className={styles.amountText}>
                      {item.unitPriceFormatted || `${item.unitPrice?.toLocaleString("vi-VN")} đ`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className={styles.supplierText}>
                      {item.supplierName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" className={styles.storageText}>
                      {item.storageRequirements || "Bảo quản nhiệt độ thường"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

CatalogTable.propTypes = {
  catalog: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string,
      handlingType: PropTypes.string,
      defaultUnit: PropTypes.string,
      shelfLifeDays: PropTypes.number,
      unitPriceFormatted: PropTypes.string,
      supplierName: PropTypes.string,
      storageRequirements: PropTypes.string,
    })
  ),
}
