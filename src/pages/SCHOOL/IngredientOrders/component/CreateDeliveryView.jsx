import React, { useState, useMemo, useEffect } from "react"
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
  Checkbox,
  Tooltip,
  Alert,
} from "@mui/material"
import {
  ArrowLeft,
  ChefHat,
  Sunrise,
  Users,
  Send,
  Package,
  Truck,
  Boxes,
  Flame,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  CalendarCheck,
} from "lucide-react"
import { MOCK_APPROVED_MENUS, MOCK_DRY_STOCK_INVENTORY } from "../mockData"
import styles from "./CreateDeliveryView.module.scss"

export default function CreateDeliveryView({
  menus = [],
  deliveries = [],
  initialDate = "2026-10-27",
  onBack,
  onSubmitBatch1,
  onSubmitBatch2,
}) {
  const effectiveMenus = useMemo(() => {
    return Array.isArray(menus) && menus.length > 0 ? menus : MOCK_APPROVED_MENUS
  }, [menus])

  const [orderDate, setOrderDate] = useState(initialDate)
  const [selectedMenuId, setSelectedMenuId] = useState(() => effectiveMenus[0]?.id || "")
  const [note, setNote] = useState("Vận chuyển bằng xe lạnh chuyên dụng, kiểm tra niêm phong nhiệt độ.")
  const [submitting, setSubmitting] = useState(false)

  // Đồng bộ ngày khi initialDate thay đổi (ví dụ bấm Thêm Đợt 2 từ bảng)
  useEffect(() => {
    if (initialDate) {
      setOrderDate(initialDate)
      setActualAttendance("")
    }
  }, [initialDate])

  // Sĩ số GVCN báo cho Đợt 2 (mặc định để trống để test validate)
  const [actualAttendance, setActualAttendance] = useState("")

  // Checkbox đồ khô giao cùng xe Đợt 1
  const [attachedDryIds, setAttachedDryIds] = useState([])

  // =========================================================================
  // TỰ ĐỘNG NHẬN DIỆN CHẾ ĐỘ THEO NGÀY (VALIDATE THEO ORDER_DATE)
  // =========================================================================
  const { mode, batch1ForDate, batch2ForDate } = useMemo(() => {
    const forDate = deliveries.filter(d => d.deliveryDate === orderDate)
    const b1 = forDate.find(d => d.batchType === "BATCH_1")
    const b2 = forDate.find(d => d.batchType === "BATCH_2")

    const rejectCount = Object.values(b1?.approvals || {}).filter(a => a?.approved === false).length
    const b1Failed = b1 && (b1.status === "CANCELLED" || b1.status === "REJECTED" || rejectCount >= 2)

    let m = "BATCH_1"
    if (b1 && b2) {
      m = "COMPLETED"
    } else if (b1 && b1Failed) {
      m = "BATCH_1_CANCELLED"
    } else if (b1 && !b2) {
      m = "BATCH_2"
    } else {
      m = "BATCH_1"
    }

    return { mode: m, batch1ForDate: b1, batch2ForDate: b2 }
  }, [deliveries, orderDate])

  // Menu áp dụng
  const currentMenu = useMemo(() => {
    if (mode === "BATCH_2" && batch1ForDate) {
      return effectiveMenus.find(m => m.id === batch1ForDate.menuId) || effectiveMenus[0]
    }
    return effectiveMenus.find(m => m.id === selectedMenuId) || effectiveMenus[0]
  }, [effectiveMenus, selectedMenuId, mode, batch1ForDate])

  const maxPortions = currentMenu?.maxPortions || 850
  const batch1Portions = Math.floor(maxPortions / 2) // 50%

  // Tính số suất giao bù ở Đợt 2
  const parsedAttendance = Number(actualAttendance) || 0
  const remainingPortions =
    parsedAttendance > 0 ? Math.max(0, parsedAttendance - batch1Portions) : maxPortions - batch1Portions

  // Nguyên liệu tươi sống (DIRECT_USE)
  const freshIngredients = useMemo(() => {
    return currentMenu?.ingredients?.filter(it => it.handlingType === "DIRECT_USE") || []
  }, [currentMenu])

  // Nguyên liệu khô (DRY_STOCK) - Chỉ dùng ở Đợt 1
  const dryIngredients = useMemo(() => {
    return currentMenu?.ingredients?.filter(it => it.handlingType === "DRY_STOCK") || []
  }, [currentMenu])

  // Danh sách supplierId của các món tươi sống (Đợt 1) để nhận diện đồ khô cùng xe tươi sống hay NCC đồ khô riêng
  const freshSupplierIds = useMemo(() => {
    return new Set(freshIngredients.map(f => f.supplierId).filter(Boolean))
  }, [freshIngredients])

  // Toggle đồ khô
  const handleToggleAttached = id => {
    setAttachedDryIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const isAllAttached =
    dryIngredients.length > 0 && attachedDryIds.length === dryIngredients.length

  const handleToggleSelectAll = () => {
    if (isAllAttached) {
      setAttachedDryIds([])
    } else {
      setAttachedDryIds(dryIngredients.map(it => it.id))
    }
  }

  // Đánh giá tồn kho & Nhu cầu ca nấu cho từng nguyên liệu khô
  const dryStockEvaluation = useMemo(() => {
    return dryIngredients.map(ing => {
      const totalDemand = Number((ing.qtyPerPortion * maxPortions).toFixed(2))
      const stockInfo = MOCK_DRY_STOCK_INVENTORY[ing.id] || {}
      const currentStock = ing.currentStock ?? stockInfo.currentStock ?? 50
      const safetyStock = ing.safetyStock ?? stockInfo.safetyStock ?? 20
      const stockAfter = Number((currentStock - totalDemand).toFixed(2))

      let status = "PLENTY" // "DEFICIT" | "LOW" | "PLENTY"
      let statusLabel = ""
      let statusSubtext = ""

      if (currentStock < totalDemand) {
        status = "DEFICIT"
        const deficitQty = Number((totalDemand - currentStock).toFixed(2))
        statusLabel = `Thiếu ${deficitQty} ${ing.unit}`
        statusSubtext = `Kho còn ${currentStock}/${totalDemand} ${ing.unit} (Không đủ ca nấu)`
      } else if (stockAfter < safetyStock) {
        status = "LOW"
        statusLabel = `Sắp hết`
        statusSubtext = `Sau nấu còn ${stockAfter} ${ing.unit} (Định mức an toàn: ≥${safetyStock} ${ing.unit})`
      } else {
        status = "PLENTY"
        statusLabel = `Đủ dùng trong kho`
        statusSubtext = `Sau nấu còn dư ${stockAfter} ${ing.unit}`
      }

      return {
        ...ing,
        totalDemand,
        currentStock,
        safetyStock,
        stockAfter,
        status,
        statusLabel,
        statusSubtext,
        needsDelivery: status !== "PLENTY",
      }
    })
  }, [dryIngredients, maxPortions])

  // Danh sách các món kho thiếu hụt hoặc sắp cạn cần gợi ý tích giao thêm
  const lowOrDeficitItems = useMemo(() => {
    return dryStockEvaluation.filter(it => it.needsDelivery)
  }, [dryStockEvaluation])

  // Chọn nhanh tất cả các món kho thiếu / sắp cạn
  const handleAutoSelectLowStock = () => {
    const lowIds = lowOrDeficitItems.map(it => it.id)
    setAttachedDryIds(prev => Array.from(new Set([...prev, ...lowIds])))
  }

  // Submit Đợt 1
  const handleSubmitBatch1 = async () => {
    if (!currentMenu) return
    setSubmitting(true)
    try {
      await onSubmitBatch1({
        menuId: currentMenu.id,
        orderDate,
        note,
        attachedDryIds,
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Đợt 2
  const handleSubmitBatch2 = async () => {
    if (!batch1ForDate || parsedAttendance <= 0) return
    setSubmitting(true)
    try {
      await onSubmitBatch2({
        batch1DeliveryId: batch1ForDate.id,
        actualAttendance: parsedAttendance,
        orderDate,
        note,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box className={styles.container}>
      {/* 1. Header Navigation */}
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
              <Typography variant="h5" className={styles.mainTitle}>
                {mode === "BATCH_1" && "Tạo Yêu Cầu Mua Hàng Đợt 1"}
                {mode === "BATCH_2" && "Tạo Đơn Giao Hàng Đợt 2"}
                {mode === "COMPLETED" && "Trạng Thái Đơn Hàng Theo Ngày"}
              </Typography>
            </Box>
          </Box>
        </Box>

      </Box>

      {/* 2. Thanh chọn Ngày giao & Thực đơn */}
      <Paper className={styles.formCard} elevation={0}>
        <Box className={styles.formRow}>
          <TextField
            type="date"
            label="Ngày áp dụng / Ngày giao hàng"
            value={orderDate}
            onChange={e => {
              setOrderDate(e.target.value)
              setActualAttendance("") // Reset sĩ số khi đổi ngày
            }}
            size="small"
            className={styles.dateInput}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {mode === "BATCH_1" ? (
            <TextField
              select
              label="Thực đơn áp dụng (Đã duyệt)"
              value={selectedMenuId}
              onChange={e => setSelectedMenuId(e.target.value)}
              className={styles.menuSelect}
              size="small"
              fullWidth
            >
              {effectiveMenus.map(menu => (
                <MenuItem key={menu.id} value={menu.id}>
                  {menu.name} — {menu.targetScope} ({menu.maxPortions} suất chuẩn)
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label="Thực đơn đã chọn (Kế thừa từ Đợt 1)"
              value={`${currentMenu?.name || ""} (${maxPortions} suất tối đa)`}
              size="small"
              disabled
              className={styles.menuSelect}
              fullWidth
            />
          )}
        </Box>
      </Paper>

      {/* =====================================================================
          CASE 3: NGÀY ĐÓ ĐÃ CÓ CẢ 2 ĐỢT (HOÀN TẤT)
          ===================================================================== */}
      {mode === "COMPLETED" && (
        <Paper className={styles.completedCard} elevation={0}>
          <Box className={styles.completedHeader}>
            <CalendarCheck size={36} className={styles.completedIcon} />
            <Box>
              <Typography variant="h6" className={styles.completedTitle}>
                Ngày {orderDate} Đã Hoàn Thành Lập Cả 2 Đợt Giao Hàng!
              </Typography>
              <Typography variant="body2" className={styles.completedDesc}>
                Đơn hàng đã được chia 2 đợt đầy đủ: Đợt 1 ({batch1ForDate?.plannedPortions} suất lúc 05:30) và Đợt 2 ({batch2ForDate?.plannedPortions} suất lúc 07:45 theo sĩ số GVCN).
              </Typography>
            </Box>
          </Box>

          <Box className={styles.completedActions}>
            <Button variant="outlined" onClick={onBack}>
              Quay lại danh sách phiếu
            </Button>
            <Button
              variant="contained"
              onClick={() => setOrderDate("2026-10-28")}
            >
              Chọn ngày tiếp theo (28/10/2026)
            </Button>
          </Box>
        </Paper>
      )}

      {/* =====================================================================
          CASE 4: ĐỢT 1 ĐÃ BỊ HỦY (TỪ 2 BÊN TỪ CHỐI TRỞ LÊN)
          ===================================================================== */}
      {mode === "BATCH_1_CANCELLED" && (
        <Paper className={styles.completedCard} elevation={0}>
          <Box className={styles.completedHeader}>
            <AlertTriangle size={36} color="#dc2626" />
            <Box>
              <Typography variant="h6" sx={{ color: "#dc2626", fontWeight: 700 }}>
                Đợt 1 Ngày {orderDate} Đã Bị Hủy Nghiệm Thu!
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", mt: 0.5 }}>
                Đợt 1 của ngày này đã bị từ chối từ 2 bên trở lên trong Hội đồng 4 bên nên đã hủy toàn bộ đơn. Không thể lập đơn giao hàng Đợt 2 khi Đợt 1 không được nghiệm thu đạt chuẩn.
              </Typography>
            </Box>
          </Box>

          <Box className={styles.completedActions}>
            <Button variant="outlined" onClick={onBack}>
              Quay lại danh sách phiếu
            </Button>
          </Box>
        </Paper>
      )}

      {/* =====================================================================
          CASE 1: TẠO ĐỢT 1 (CHƯA CÓ ĐỢT 1)
          ===================================================================== */}
      {mode === "BATCH_1" && (
        <>
          {/* Card tóm tắt Đợt 1 */}
          <Box className={styles.batch1SummaryCard}>
            <Box className={styles.batchCardHeader}>
              <Typography variant="subtitle1" className={styles.batchCardTitle}>
                Quy Chuẩn Giao Hàng Đợt 1: Cố Định 50% Suất Tối Đa
              </Typography>
            </Box>
            <Typography variant="h4" className={styles.batchPortionCount}>
              {batch1Portions} <span className={styles.portionTotal}>/ {maxPortions}</span>{" "}
              <span className={styles.portionUnit}>suất ăn</span>
            </Typography>
          </Box>

          {/* BẢNG 1: THỰC PHẨM TƯƠI SỐNG (ĐỢT 1: 50% SUẤT) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    A. Thực Phẩm Tươi Sống Đợt 1 (50% Suất - Giao Sớm 05:30 Sáng)
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${freshIngredients.length} mặt hàng tươi sống`}
                size="small"
                className={styles.freshItemCountBadge}
              />
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell>Tên thực phẩm tươi sống</TableCell>
                    <TableCell>Phân loại</TableCell>
                    <TableCell align="center">Định lượng / 1 Suất</TableCell>
                    <TableCell align="right" className={styles.batch1Col}>
                      Số lượng Đợt 1 ({batch1Portions} suất - 50%)
                    </TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {freshIngredients.map(ing => {
                    const batch1Qty = (ing.qtyPerPortion * batch1Portions).toFixed(2)

                    return (
                      <TableRow key={ing.id} hover className={styles.tableRow}>
                        <TableCell>
                          <Typography variant="subtitle2" className={styles.ingName}>
                            {ing.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Tươi sống (Dùng ngay)"
                            size="small"
                            className={styles.freshChip}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" className={styles.unitText}>
                            {ing.qtyPerPortion} {ing.unit}
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
          </Paper>

          {/* BẢNG 2: GIA VỊ & ĐỒ KHÔ (CHỈ CÓ Ở ĐỢT 1 — MẶC ĐỊNH DÙNG TỒN KHO) */}
          <Paper className={styles.dryTableCard} elevation={0}>
            <Box className={styles.dryHeaderRow}>
              <Box className={styles.tableTitleGroup}>
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    B. Gia Vị &amp; Lương Thực Khô
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.dryTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell padding="checkbox">
                      <Tooltip title={isAllAttached ? "Bỏ chọn tất cả" : "Chọn giao cùng tất cả"}>
                        <Checkbox
                          size="small"
                          checked={isAllAttached}
                          indeterminate={attachedDryIds.length > 0 && !isAllAttached}
                          onChange={handleToggleSelectAll}
                          color="warning"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>Tên nguyên liệu / Gia vị</TableCell>
                    <TableCell>Nhà cung cấp (NCC)</TableCell>
                    <TableCell align="right">Nhu cầu ca nấu</TableCell>
                    <TableCell align="right">Tồn kho hiện tại</TableCell>
                    <TableCell align="center">Mức tồn kho &amp; So sánh</TableCell>
                    <TableCell align="center">Giao cùng xe Đợt 1</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dryStockEvaluation.map(ing => {
                    const isAttached = attachedDryIds.includes(ing.id)

                    // Kiểm tra NCC: Cùng xe với đồ tươi hay NCC đồ khô riêng
                    const isSharedWithFresh = freshSupplierIds.has(ing.supplierId)

                    return (
                      <TableRow
                        key={ing.id}
                        hover
                        className={`${styles.tableRow} ${isAttached ? styles.rowAttached : ""}`}
                        onClick={() => handleToggleAttached(ing.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                          <Checkbox
                            size="small"
                            checked={isAttached}
                            onChange={() => handleToggleAttached(ing.id)}
                            color="warning"
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="subtitle2" className={styles.ingName}>
                            {ing.name}
                          </Typography>
                        </TableCell>

                        {/* Cột NCC: Hiển thị NCC và nhận diện xe tươi sống hay NCC riêng */}
                        <TableCell>
                          <Box className={styles.supplierCol}>
                            <Typography variant="body2" className={styles.supplierName}>
                              {ing.supplierName || "Tổng kho Lương thực & Gia vị"}
                            </Typography>
                            {isSharedWithFresh ? (
                              <Chip
                                size="small"
                                icon={<Truck size={12} />}
                                label="Chung NCC xe tươi sống"
                                className={styles.sharedSupplierChip}
                              />
                            ) : (
                              <Chip
                                size="small"
                                icon={<Boxes size={12} />}
                                label="NCC đồ khô riêng"
                                className={styles.separateSupplierChip}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* Cột Nhu cầu ca nấu: Tổng số lượng và định lượng/suất */}
                        <TableCell align="right">
                          <Box className={styles.demandCol}>
                            <Typography variant="subtitle2" className={styles.demandTotal}>
                              {ing.totalDemand} {ing.unit}
                            </Typography>
                            <Typography variant="caption" className={styles.demandPerPortion}>
                              ({ing.qtyPerPortion} {ing.unit}/suất)
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Cột Tồn kho hiện tại: Số lượng và ngưỡng an toàn */}
                        <TableCell align="right">
                          <Box className={styles.stockCol}>
                            <Typography variant="subtitle2" className={styles.stockQty}>
                              {ing.currentStock} {ing.unit}
                            </Typography>
                            <Typography variant="caption" className={styles.safetyStockText}>
                              (An toàn: ≥{ing.safetyStock} {ing.unit})
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Cột Mức tồn kho & So sánh: Phân loại DEFICIT / LOW / PLENTY */}
                        <TableCell align="center">
                          <Box className={styles.evaluationCol}>
                            {ing.status === "DEFICIT" && (
                              <Tooltip title={ing.statusSubtext}>
                                <Chip
                                  size="small"
                                  label={ing.statusLabel}
                                  className={styles.stockDeficitChip}
                                />
                              </Tooltip>
                            )}
                            {ing.status === "LOW" && (
                              <Tooltip title={ing.statusSubtext}>
                                <Chip
                                  size="small"
                                  label={ing.statusLabel}
                                  className={styles.stockLowChip}
                                />
                              </Tooltip>
                            )}
                            {ing.status === "PLENTY" && (
                              <Tooltip title={ing.statusSubtext}>
                                <Chip
                                  size="small"
                                  label={ing.statusLabel}
                                  className={styles.stockPlentyChip}
                                />
                              </Tooltip>
                            )}
                            <Typography variant="caption" className={styles.evalSubtext}>
                              {ing.statusSubtext}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Cột Trạng thái Giao cùng xe Đợt 1 */}
                        <TableCell align="center" onClick={e => e.stopPropagation()}>
                          {isAttached ? (
                            <Chip
                              icon={<Truck size={14} />}
                              label="Giao cùng Đợt 1"
                              size="small"
                              color="warning"
                              className={styles.attachedChip}
                              onDelete={() => handleToggleAttached(ing.id)}
                            />
                          ) : ing.status !== "PLENTY" ? (
                            <Chip
                              size="small"
                              variant="outlined"
                              color="warning"
                              label="+ Tích giao cùng"
                              className={styles.suggestAttachChip}
                              onClick={() => handleToggleAttached(ing.id)}
                            />
                          ) : (
                            <Typography variant="caption" className={styles.notAttachedText}>
                              Dùng kho (Không giao)
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          {/* Ghi chú & Footer Submit Đợt 1 */}
          <Paper className={styles.noteCard} elevation={0}>
            <TextField
              label="Ghi chú đơn hàng Đợt 1 gửi Nhà cung cấp"
              value={note}
              onChange={e => setNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              placeholder="Ghi chú về kiểm dịch, niêm phong xe lạnh..."
            />
          </Paper>

          <Box className={styles.footerWrap}>
            <Box className={styles.summaryBadges}>
              <Chip
                label={`${freshIngredients.length} mặt hàng tươi sống (Đợt 1: 50%)`}
                size="small"
                className={styles.summaryFreshBadge}
              />
              {attachedDryIds.length > 0 ? (
                <Chip
                  label={`${attachedDryIds.length} món khô giao cùng Đợt 1`}
                  size="small"
                  className={styles.summaryAttachedBadge}
                />
              ) : (
                <Chip
                  label="Đồ khô: Dùng tồn kho (Không giao cùng)"
                  size="small"
                  variant="outlined"
                  className={styles.summaryWarehouseBadge}
                />
              )}
            </Box>

            <Box className={styles.footerActions}>
              <Button onClick={onBack} variant="outlined" color="inherit">
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSubmitBatch1}
                variant="contained"
                startIcon={<Send size={18} />}
                disabled={submitting}
                className={styles.submitBtn}
              >
                {submitting ? "Đang gửi..." : "Tạo đơn mua hàng Đợt 1 & Gửi NCC"}
              </Button>
            </Box>
          </Box>
        </>
      )}

      {/* =====================================================================
          CASE 2: ĐÃ CÓ ĐỢT 1 -> TỰ ĐỘNG CHUYỂN SANG FORM TẠO ĐỢT 2
          ===================================================================== */}
      {mode === "BATCH_2" && (
        <>

          {/* KHỐI ĐIỂM DANH & CHỐT SĨ SỐ GVCN (ĐIỀU KIỆN TIÊN QUYẾT ĐỂ CHỐT ĐỢT 2) */}
          <Paper className={styles.attendanceCard} elevation={0}>
            <Box className={styles.attendanceHeader}>
              <Box className={styles.attendanceTitleGroup}>
                <Users size={22} className={styles.attendanceIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.attendanceHeading}>
                    Cập Nhật Sĩ Số Học Sinh Từ Giáo Viên Chủ Nhiệm (GVCN)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className={styles.attendanceBody}>
              <Box className={styles.attendanceInputRow}>
                <TextField
                  type="number"
                  label="Sĩ số thực tế GVCN báo sáng (Học sinh)"
                  placeholder="Nhập sĩ số điểm danh..."
                  value={actualAttendance}
                  onChange={e => setActualAttendance(e.target.value)}
                  size="small"
                  className={styles.attendanceInput}
                  slotProps={{
                    htmlInput: { min: batch1Portions, max: maxPortions },
                  }}
                />

                <Box className={styles.attendanceFormula}>
                  <Box className={styles.formulaItem}>
                    <Typography variant="caption" color="text.secondary">
                      Suất tối đa:
                    </Typography>
                    <Typography variant="subtitle2">{maxPortions} suất</Typography>
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    -
                  </Typography>
                  <Box className={styles.formulaItem}>
                    <Typography variant="caption" color="text.secondary">
                      Đợt 1 đã nhận:
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      {batch1Portions} suất
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    =
                  </Typography>
                  <Box className={styles.formulaItemResult}>
                    <Typography variant="caption" color="text.secondary">
                      Cần giao thêm Đợt 2:
                    </Typography>
                    <Typography variant="h6" className={styles.resultPortions}>
                      {parsedAttendance > 0 ? remainingPortions : "~425"} suất
                    </Typography>
                  </Box>
                </Box>
              </Box>

            </Box>
          </Paper>

          {/* BẢNG NGUYÊN LIỆU TƯƠI SỐNG ĐỢT 2 (BÊ NGUYÊN TỪ ĐỢT 1, KHÔNG CÓ ĐỒ KHÔ) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Package size={18} className={styles.tableIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    Bảng Thực Phẩm Tươi Sống Đợt 2
                  </Typography>
                  <Typography variant="caption" className={styles.tableSubheading}>
                    Tự động tính số lượng kg theo số suất giao bù ({parsedAttendance > 0 ? remainingPortions : 425} suất). Hoàn toàn không có đồ khô.
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`Đợt 2: ${parsedAttendance > 0 ? remainingPortions : 425} suất`}
                size="small"
                color={parsedAttendance > 0 ? "warning" : "default"}
              />
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell>Tên thực phẩm tươi sống</TableCell>
                    <TableCell>Phân loại</TableCell>
                    <TableCell align="center">Định lượng / 1 Suất</TableCell>
                    <TableCell align="right" className={styles.batch2Col}>
                      Số lượng Đợt 2 ({parsedAttendance > 0 ? remainingPortions : 425} suất)
                    </TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {freshIngredients.map(ing => {
                    const activeQty = (
                      ing.qtyPerPortion * (parsedAttendance > 0 ? remainingPortions : batch1Portions)
                    ).toFixed(2)

                    return (
                      <TableRow key={ing.id} hover className={styles.tableRow}>
                        <TableCell>
                          <Typography variant="subtitle2" className={styles.ingName}>
                            {ing.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Tươi sống (Dùng ngay)"
                            size="small"
                            className={styles.freshChip}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" className={styles.unitText}>
                            {ing.qtyPerPortion} {ing.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" className={styles.batch2Cell}>
                          <Typography variant="subtitle2" className={styles.batch2QtyText}>
                            {activeQty} {ing.unit}
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
          </Paper>

          {/* Ghi chú & Footer Submit Đợt 2 */}
          <Paper className={styles.noteCard} elevation={0}>
            <TextField
              label="Ghi chú đơn giao hàng Đợt 2 gửi Nhà cung cấp"
              value={note}
              onChange={e => setNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              placeholder="Yêu cầu giao bù đúng 07:45 sáng, kiểm tra niêm phong xe lạnh..."
            />
          </Paper>

          <Box className={styles.footerWrap}>
            <Box className={styles.summaryBadges}>
              <Chip
                label={`${freshIngredients.length} mặt hàng tươi sống (Đợt 2: ${parsedAttendance > 0 ? remainingPortions : 425} suất)`}
                size="small"
                className={styles.summaryFreshBadge}
              />
              <Chip
                label="Đồ khô: Không áp dụng cho Đợt 2"
                size="small"
                variant="outlined"
                className={styles.summaryWarehouseBadge}
              />
            </Box>

            <Box className={styles.footerActions}>
              <Button onClick={onBack} variant="outlined" color="inherit">
                Hủy bỏ
              </Button>

              {/* NÚT CHỐT ĐƠN ĐỢT 2: CHỈ BẤM ĐƯỢC KHI ĐÃ CÓ SĨ SỐ GVCN */}
              <Tooltip
                title={
                  parsedAttendance <= 0
                    ? "Nút bị khóa: Vui lòng nhập sĩ số GVCN báo để chốt đơn Đợt 2"
                    : ""
                }
              >
                <span>
                  <Button
                    onClick={handleSubmitBatch2}
                    variant="contained"
                    color="warning"
                    startIcon={<Send size={18} />}
                    disabled={submitting || parsedAttendance <= 0}
                    className={styles.submitBtnBatch2}
                  >
                    {submitting ? "Đang gửi..." : "Chốt đơn Đợt 2 & Gửi NCC"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}

CreateDeliveryView.propTypes = {
  menus: PropTypes.array,
  deliveries: PropTypes.array,
  initialDate: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onSubmitBatch1: PropTypes.func.isRequired,
  onSubmitBatch2: PropTypes.func.isRequired,
}
