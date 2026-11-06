import React, { useState, useMemo } from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
} from "@mui/material"
import {
  ArrowLeft,
  ChefHat,
  Sunrise,
  Users,
  Send,
  Calendar,
  Package,
} from "lucide-react"
import styles from "./CreateDeliveryView.module.scss"

export default function CreateDeliveryView({
  menus = [],
  onBack,
  onSubmit,
}) {
  const [selectedMenuId, setSelectedMenuId] = useState(menus[0]?.id || "")
  const [orderDate, setOrderDate] = useState("2026-10-27")
  const [note, setNote] = useState("Yêu cầu NCC vận chuyển bằng xe lạnh chuyên dụng đạt 2 - 6°C, giao Đợt 1 đúng 05:30 sáng.")
  const [submitting, setSubmitting] = useState(false)

  // Thực đơn đang được chọn
  const currentMenu = useMemo(() => {
    return menus.find(m => m.id === selectedMenuId) || menus[0]
  }, [menus, selectedMenuId])

  const maxPortions = currentMenu?.maxPortions || 850
  const batch1Portions = Math.floor(maxPortions / 2) // 50%
  const batch2Portions = maxPortions - batch1Portions

  const handleSubmit = async () => {
    if (!currentMenu) return
    setSubmitting(true)
    try {
      await onSubmit({
        menuId: currentMenu.id,
        orderDate,
        note,
      })
    } catch (err) {
      console.error("Lỗi tạo đơn:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box className={styles.container}>
      {/* 1. Navigation Header */}
      <Box className={styles.navHeader}>
        <Box className={styles.navLeft}>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={onBack}
            className={styles.backBtn}
            variant="outlined"
          >
            Quay lại danh sách
          </Button>

          <Box className={styles.titleInfo}>
            <Box className={styles.titleWithIcon}>
              <ChefHat size={22} className={styles.titleIcon} />
              <Typography variant="h5" className={styles.mainTitle}>
                Tạo Đơn Mua Hàng Từ Thực Đơn Đã Duyệt
              </Typography>
            </Box>
            <Typography variant="body2" className={styles.subTitle}>
              Tự động tính định lượng theo suất ăn và phân bổ 2 đợt nhập hàng theo đúng quy chuẩn bán trú
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. Form thiết lập Thực đơn & Ngày giao */}
      <Paper className={styles.formCard} elevation={0}>
        <Typography variant="subtitle2" className={styles.cardHeaderTitle}>
          1. Lựa Chọn Thực Đơn Đã Được BGH & Y Tế Phê Duyệt
        </Typography>

        <Box className={styles.formRow}>
          <TextField
            select
            label="Thực đơn áp dụng (Đã duyệt)"
            value={selectedMenuId}
            onChange={e => setSelectedMenuId(e.target.value)}
            className={styles.menuSelect}
            size="small"
            fullWidth
          >
            {menus.map(menu => (
              <MenuItem key={menu.id} value={menu.id}>
                {menu.name} — {menu.targetScope} ({menu.maxPortions} suất tối đa)
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="date"
            label="Ngày áp dụng / Ngày giao hàng"
            value={orderDate}
            onChange={e => setOrderDate(e.target.value)}
            size="small"
            className={styles.dateInput}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </Paper>

      {/* 3. Khối trực quan phân bổ 2 Đợt nhập hàng */}
      <Box className={styles.batchSplitCards}>
        <Box className={styles.batchCard1}>
          <Box className={styles.batchCardHeader}>
            <Sunrise size={20} className={styles.batch1Icon} />
            <Typography variant="subtitle1" className={styles.batchCardTitle}>
              Đợt 1: 50% Sĩ số tối đa
            </Typography>
            <Chip label="Cố định" size="small" className={styles.fixedChip} />
          </Box>
          <Typography variant="h4" className={styles.batchPortionCount}>
            {batch1Portions} <span className={styles.portionUnit}>suất ăn</span>
          </Typography>
          <Typography variant="body2" className={styles.batchCardDesc}>
            Giao sớm lúc <strong>05:00 - 05:30 sáng</strong> để Nhà bếp kịp nổi lửa ninh xương, nấu cơm và sơ chế món chính.
          </Typography>
        </Box>

        <Box className={styles.batchCard2}>
          <Box className={styles.batchCardHeader}>
            <Users size={20} className={styles.batch2Icon} />
            <Typography variant="subtitle1" className={styles.batchCardTitle}>
              Đợt 2: Cân đối theo sĩ số GVCN
            </Typography>
            <Chip label="Linh hoạt" size="small" className={styles.dynamicChip} />
          </Box>
          <Typography variant="h4" className={styles.batchPortionCount}>
            ~{batch2Portions} <span className={styles.portionUnit}>suất (dự kiến)</span>
          </Typography>
          <Typography variant="body2" className={styles.batchCardDesc}>
            Chờ GVCN điểm danh chốt lúc <strong>07:30 sáng</strong> để gửi số lượng thực tế, giao lúc <strong>07:45</strong> chống lãng phí thức ăn.
          </Typography>
        </Box>
      </Box>

      {/* 4. Bảng bóc tách nguyên liệu tự động từ Thực đơn */}
      <Paper className={styles.tableCard} elevation={0}>
        <Box className={styles.tableCardHeader}>
          <Box className={styles.tableTitleGroup}>
            <Package size={18} className={styles.tableIcon} />
            <Typography variant="subtitle1" className={styles.tableHeading}>
              Chi Tiết Nguyên Liệu Bóc Tách Từ Thực Đơn ({currentMenu?.ingredients?.length || 0} mặt hàng)
            </Typography>
          </Box>
          <Chip
            label={`Tính theo chuẩn: ${maxPortions} suất tối đa`}
            size="small"
            className={styles.portionBadge}
          />
        </Box>

        <Box className={styles.tableWrapper}>
          <Table size="small" className={styles.ingTable}>
            <TableHead>
              <TableRow className={styles.tableHeaderRow}>
                <TableCell>Tên nguyên liệu</TableCell>
                <TableCell>Phân loại kho</TableCell>
                <TableCell align="center">Định lượng / 1 Suất</TableCell>
                <TableCell align="right">Tổng nhu cầu ({maxPortions} suất)</TableCell>
                <TableCell align="right" className={styles.batch1Col}>
                  Đợt 1 (50% Giao sớm)
                </TableCell>
                <TableCell>Nhà cung cấp đối tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentMenu?.ingredients?.map(ing => {
                const totalQty = (ing.qtyPerPortion * maxPortions).toFixed(2)
                const batch1Qty = (ing.qtyPerPortion * batch1Portions).toFixed(2)
                const isDryStock = ing.handlingType === "DRY_STOCK"

                return (
                  <TableRow key={ing.id} hover className={styles.tableRow}>
                    <TableCell>
                      <Typography variant="subtitle2" className={styles.ingName}>
                        {ing.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isDryStock ? "Kho khô (Lưu kho)" : "Tươi sống (Dùng ngay)"}
                        size="small"
                        className={isDryStock ? styles.dryChip : styles.freshChip}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {ing.qtyPerPortion} {ing.unit}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" className={styles.totalQtyText}>
                        {totalQty} {ing.unit}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" className={styles.batch1Cell}>
                      <Typography variant="subtitle2" className={styles.batch1QtyText}>
                        {batch1Qty} {ing.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" className={styles.supplierText}>
                        {ing.supplierName}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Box>

        {/* Ghi chú giao hàng */}
        <Box className={styles.noteSection}>
          <TextField
            label="Ghi chú giao hàng gửi Nhà cung cấp"
            value={note}
            onChange={e => setNote(e.target.value)}
            multiline
            rows={2}
            fullWidth
            size="small"
            placeholder="Ví dụ: Giao đúng giờ, kiểm tra niêm phong xe lạnh, gửi kèm hóa đơn..."
          />
        </Box>
      </Paper>

      {/* 5. Footer actions */}
      <Box className={styles.footerActions}>
        <Button
          onClick={onBack}
          variant="outlined"
          color="inherit"
          className={styles.cancelBtn}
        >
          Hủy bỏ
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Send size={18} />}
          disabled={submitting}
          className={styles.submitBtn}
        >
          {submitting ? "Đang gửi yêu cầu..." : "Tạo đơn & Gửi yêu cầu mua hàng sang NCC"}
        </Button>
      </Box>
    </Box>
  )
}

CreateDeliveryView.propTypes = {
  menus: PropTypes.array,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
