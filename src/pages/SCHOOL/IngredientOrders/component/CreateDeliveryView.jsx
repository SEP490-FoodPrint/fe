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
  Clock,
  Sparkles,
  CalendarCheck,
} from "lucide-react"
import { MOCK_APPROVED_MENUS } from "../mockData"
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

  // Sĩ số GVCN báo cho Đợt 2 (mặc định để trống để test validate)
  const [actualAttendance, setActualAttendance] = useState("")

  // Checkbox đồ khô giao kèm xe Đợt 1
  const [attachedDryIds, setAttachedDryIds] = useState([])

  // =========================================================================
  // TỰ ĐỘNG NHẬN DIỆN CHẾ ĐỘ THEO NGÀY (VALIDATE THEO ORDER_DATE)
  // =========================================================================
  const { mode, batch1ForDate, batch2ForDate } = useMemo(() => {
    const forDate = deliveries.filter(d => d.deliveryDate === orderDate)
    const b1 = forDate.find(d => d.batchType === "BATCH_1")
    const b2 = forDate.find(d => d.batchType === "BATCH_2")

    let m = "BATCH_1"
    if (b1 && b2) {
      m = "COMPLETED"
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
              <ChefHat size={22} className={styles.titleIcon} />
              <Typography variant="h5" className={styles.mainTitle}>
                {mode === "BATCH_1" && "Tạo Yêu Cầu Mua Hàng Đợt 1 (Giao Sớm 05:30 Sáng)"}
                {mode === "BATCH_2" && "Tạo Đơn Giao Hàng Đợt 2 (Cân Đối Theo Sĩ Số GVCN)"}
                {mode === "COMPLETED" && "Trạng Thái Đơn Hàng Theo Ngày"}
              </Typography>
            </Box>
            <Typography variant="body2" className={styles.subTitle}>
              {mode === "BATCH_1" && "Tự động phân bổ 50% suất ăn cho ca sớm. Đồ khô nhập định kỳ 3 lần/tháng, mặc định dùng tồn kho."}
              {mode === "BATCH_2" && "Bê nguyên danh mục tươi sống của Đợt 1. Chờ GVCN chốt sĩ số để tính số kg cần giao bù."}
              {mode === "COMPLETED" && `Ngày ${orderDate} đã hoàn thành đầy đủ cả 2 đợt giao nhận.`}
            </Typography>
          </Box>
        </Box>

        {/* Badge nhận diện trạng thái tự động */}
        <Box className={styles.modeBadgeWrap}>
          {mode === "BATCH_1" && (
            <Chip
              icon={<Sunrise size={16} />}
              label="Đợt 1: 50% Suất tối đa"
              color="primary"
              className={styles.stepBadge1}
            />
          )}
          {mode === "BATCH_2" && (
            <Chip
              icon={<Users size={16} />}
              label="Đợt 2: Cân đối sĩ số GVCN"
              color="warning"
              className={styles.stepBadge2}
            />
          )}
          {mode === "COMPLETED" && (
            <Chip
              icon={<CheckCircle2 size={16} />}
              label="Đã hoàn tất cả 2 đợt"
              color="success"
              className={styles.stepBadgeCompleted}
            />
          )}
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

        {/* Các món trong thực đơn */}
        {currentMenu?.dishes && currentMenu.dishes.length > 0 && (
          <Box className={styles.dishListWrap}>
            <Typography variant="caption" className={styles.dishListLabel}>
              Món ăn ca nấu:
            </Typography>
            <Box className={styles.dishChips}>
              {currentMenu.dishes.map((dish, idx) => (
                <Chip
                  key={idx}
                  label={dish}
                  size="small"
                  icon={<Flame size={14} color="#ea580c" />}
                  className={styles.dishChip}
                />
              ))}
            </Box>
          </Box>
        )}
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
          CASE 1: TẠO ĐỢT 1 (CHƯA CÓ ĐỢT 1)
          ===================================================================== */}
      {mode === "BATCH_1" && (
        <>
          {/* Card tóm tắt Đợt 1 */}
          <Box className={styles.batch1SummaryCard}>
            <Box className={styles.batchCardHeader}>
              <Sunrise size={22} className={styles.batch1Icon} />
              <Typography variant="subtitle1" className={styles.batchCardTitle}>
                Quy Chuẩn Giao Hàng Đợt 1: Cố Định 50% Suất Tối Đa
              </Typography>
              <Chip label="50% Suất Chuẩn" size="small" className={styles.fixedChip} />
            </Box>
            <Typography variant="h4" className={styles.batchPortionCount}>
              {batch1Portions} <span className={styles.portionUnit}>suất ăn</span>
            </Typography>
            <Typography variant="body2" className={styles.batchCardDesc}>
              Xe lạnh chuyên dụng giao sớm lúc <strong>05:00 - 05:30 sáng</strong> để Nhà bếp kịp nổi lửa ninh xương, nấu nước dùng và sơ chế đợt 1. Sau khi tạo xong Đợt 1, hệ thống sẽ mở tạo Đợt 2 chờ GVCN chốt sĩ số.
            </Typography>
          </Box>

          {/* BẢNG 1: THỰC PHẨM TƯƠI SỐNG (ĐỢT 1: 50% SUẤT) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Package size={18} className={styles.tableIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    A. Thực Phẩm Tươi Sống Đợt 1 (50% Suất - Giao Sớm 05:30 Sáng)
                  </Typography>
                  <Typography variant="caption" className={styles.tableSubheading}>
                    Thịt, cá, rau củ quả dùng trong ngày, chuyển thẳng vào Bếp nấu, không lưu kho
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

          {/* BẢNG 2: GIA VỊ & ĐỒ KHÔ (CHỈ CÓ Ở ĐỢT 1 - CHU KỲ 3 LẦN/THÁNG) */}
          <Paper className={styles.dryTableCard} elevation={0}>
            <Box className={styles.dryHeaderRow}>
              <Box className={styles.tableTitleGroup}>
                <Boxes size={20} className={styles.warehouseIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    B. Gia Vị &amp; Lương Thực Khô (Chỉ Đi Kèm Đợt 1 — Mặc Định Dùng Tồn Kho)
                  </Typography>
                  <Typography variant="caption" className={styles.drySubheading}>
                    Trường nhập định kỳ 3 lần/tháng nên kho luôn dồi dào. Mặc định chưa tích = Bếp tự xuất kho; tích chọn nếu chuyến xe sáng mai này chở kèm đợt nhập tháng.
                  </Typography>
                </Box>
              </Box>

              {/* Badge chu kỳ 3 lần/tháng theo khảo sát */}
              <Chip
                icon={<Clock size={14} />}
                label="Chu kỳ nhập đồ khô: 3 lần / tháng (Đã giao: 1/3)"
                size="small"
                color="secondary"
                className={styles.cycleBadge}
              />
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell padding="checkbox">
                      <Tooltip title={isAllAttached ? "Bỏ chọn tất cả" : "Chọn giao kèm tất cả"}>
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
                    <TableCell align="center">Quy cách kho</TableCell>
                    <TableCell align="center">Định lượng / Suất</TableCell>
                    <TableCell align="right">Tổng nhu cầu ca nấu</TableCell>
                    <TableCell align="center">Giao kèm chuyến xe Đợt 1</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dryIngredients.map(ing => {
                    const totalQty = (ing.qtyPerPortion * maxPortions).toFixed(2)
                    const isAttached = attachedDryIds.includes(ing.id)

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

                        <TableCell align="center">
                          <Chip
                            label="Can/Bao/Thùng"
                            size="small"
                            variant="outlined"
                            className={styles.packChip}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" className={styles.unitText}>
                            {ing.qtyPerPortion} {ing.unit}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography variant="subtitle2" className={styles.totalDryQtyText}>
                            {totalQty} {ing.unit}
                          </Typography>
                        </TableCell>

                        <TableCell align="center" onClick={e => e.stopPropagation()}>
                          {isAttached ? (
                            <Chip
                              icon={<Truck size={14} />}
                              label="Giao kèm Đợt 1 (05:30)"
                              size="small"
                              color="warning"
                              className={styles.attachedChip}
                              onDelete={() => handleToggleAttached(ing.id)}
                            />
                          ) : (
                            <Typography variant="caption" className={styles.notAttachedText}>
                              Chưa giao (Dùng kho)
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
                  label={`${attachedDryIds.length} món khô giao kèm Đợt 1`}
                  size="small"
                  className={styles.summaryAttachedBadge}
                />
              ) : (
                <Chip
                  label="Đồ khô: Dùng tồn kho (Không giao kèm)"
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
          {/* Banner phát hiện Đợt 1 đã có */}
          <Alert severity="info" className={styles.batch2DetectedAlert}>
            <Typography variant="body2">
              <strong>Tự động nhận diện:</strong> Ngày <strong>{orderDate}</strong> đã tạo thành công{" "}
              <strong>Đợt 1 ({batch1ForDate?.deliveryNo} — {batch1ForDate?.plannedPortions} suất lúc 05:30)</strong>.
              Hệ thống tự động chuyển sang lập <strong>Đơn giao hàng Đợt 2</strong>.
            </Typography>
          </Alert>

          {/* KHỐI ĐIỂM DANH & CHỐT SĨ SỐ GVCN (ĐIỀU KIỆN TIÊN QUYẾT ĐỂ CHỐT ĐỢT 2) */}
          <Paper className={styles.attendanceCard} elevation={0}>
            <Box className={styles.attendanceHeader}>
              <Box className={styles.attendanceTitleGroup}>
                <Users size={22} className={styles.attendanceIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.attendanceHeading}>
                    Cập Nhật Sĩ Số Học Sinh Từ Giáo Viên Chủ Nhiệm (GVCN)
                  </Typography>
                  <Typography variant="caption" className={styles.attendanceSubheading}>
                    GVCN điểm danh và báo sĩ số lúc 07:30 sáng để Nhà bếp chốt lượng thực phẩm Đợt 2, chống lãng phí.
                  </Typography>
                </Box>
              </Box>

              {/* Nút hỗ trợ test nhanh */}
              <Button
                size="small"
                variant="outlined"
                startIcon={<Sparkles size={14} />}
                onClick={() => setActualAttendance("820")}
                className={styles.mockAttendanceBtn}
              >
                ⚡ Mô phỏng GVCN báo sĩ số (820 HS)
              </Button>
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
                      Cần giao bù Đợt 2:
                    </Typography>
                    <Typography variant="h6" className={styles.resultPortions}>
                      {parsedAttendance > 0 ? remainingPortions : "~425"} suất
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Cảnh báo khi CHƯA có sĩ số */}
              {parsedAttendance <= 0 ? (
                <Alert severity="warning" className={styles.waitingAlert} icon={<AlertTriangle size={18} />}>
                  <Typography variant="body2">
                    <strong>Chưa có sĩ số điểm danh:</strong> Nút chốt đơn Đợt 2 đang bị khóa. Vui lòng nhập sĩ số thực tế do GVCN báo sáng (hoặc bấm nút mô phỏng ở trên) để mở khóa chốt đơn.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="success" className={styles.readyAlert} icon={<CheckCircle2 size={18} />}>
                  <Typography variant="body2">
                    <strong>Đã có sĩ số ({parsedAttendance} học sinh):</strong> Đợt 2 sẽ giao bù chính xác{" "}
                    <strong>{remainingPortions} suất ăn</strong>. Bảng nguyên liệu bên dưới đã được tính lại theo đúng số lượng này.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Paper>

          {/* BẢNG NGUYÊN LIỆU TƯƠI SỐNG ĐỢT 2 (BÊ NGUYÊN TỪ ĐỢT 1, KHÔNG CÓ ĐỒ KHÔ) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Package size={18} className={styles.tableIcon} />
                <Box>
                  <Typography variant="subtitle1" className={styles.tableHeading}>
                    Bảng Thực Phẩm Tươi Sống Đợt 2 (Kế Thừa Từ Đợt 1 — Giao Bù Lúc 07:45)
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
