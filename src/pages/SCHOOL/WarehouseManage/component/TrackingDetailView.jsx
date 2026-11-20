import React, { useMemo, useState } from "react"
import PropTypes from "prop-types"
import notice from "src/components/Notice"
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material"
import {
  ArrowLeft,
  Phone,
  Truck,
  Thermometer,
  MapPin,
  Calendar,
  QrCode,
  Clock,
  Maximize2,
  Copy,
  Check,
  X,
} from "lucide-react"
import styles from "./TrackingDetailView.module.scss"

// Helper format thông tin Phương tiện vận chuyển
const formatVehicle = (vehicle) => {
  if (
    !vehicle ||
    vehicle.includes("Chưa điều") ||
    vehicle.includes("Chưa phân công") ||
    vehicle.includes("Chờ") ||
    vehicle === "--"
  ) {
    return "Chưa phân công (Chờ NCC điều xe)"
  }
  return vehicle
}

export default function TrackingDetailView({ item, inventoryItems = [], onBack }) {
  if (!item) return null

  // Xác định chuẩn xác tên NCC của từng mặt hàng (kết hợp đối chiếu tồn kho nếu đơn cũ chưa lưu NCC trên từng dòng)
  const getItemSupplierName = (it) => {
    const rawItName = (it.name || it.ingredientName || "").trim().toLowerCase()

    // 1. Nếu có danh mục kho truyền vào, đối chiếu theo tên để lấy NCC chính xác trong cơ sở dữ liệu
    if (Array.isArray(inventoryItems) && inventoryItems.length > 0 && rawItName) {
      const matched = inventoryItems.find(inv => {
        const invName = (inv.name || "").trim().toLowerCase()
        return invName === rawItName || invName.includes(rawItName) || rawItName.includes(invName)
      })
      if (matched?.supplierName) {
        return matched.supplierName
      }
    }

    // 2. Sử dụng supplierName đã lưu trực tiếp trên dòng mặt hàng
    if (it.supplierName && it.supplierName !== "Nhà cung cấp đối tác") {
      return it.supplierName
    }

    return item?.supplierName || "Nhà cung cấp đối tác"
  }

  // Phân nhóm nguyên liệu theo từng Nhà cung cấp để hiển thị chi tiết từng NCC giao gì
  const itemsBySupplier = useMemo(() => {
    const map = {}
    const rawItemList = Array.isArray(item?.items) && item.items.length > 0 ? item.items : Array.isArray(item?.deliveryItems) ? item.deliveryItems : []
    if (rawItemList.length > 0) {
      rawItemList.forEach(it => {
        const supName = getItemSupplierName(it)
        if (!map[supName]) {
          map[supName] = []
        }
        map[supName].push({
          ...it,
          resolvedSupplierName: supName,
        })
      })
    } else if (item?.suppliers && Array.isArray(item.suppliers) && item.suppliers.length > 0) {
      item.suppliers.forEach(s => {
        if (!map[s]) map[s] = []
      })
    } else if (item?.supplierName) {
      map[item.supplierName] = []
    }
    return map
  }, [item, inventoryItems])

  const supplierEntries = Object.entries(itemsBySupplier)
  const supplierCount = supplierEntries.length

  // Ghi chú không lặp lại lịch hẹn giao
  const displayNote = useMemo(() => {
    const raw = String(item?.note || "").trim()
    const cleaned = raw.replace(/^Lịch hẹn giao:[^.\n]*?(\.|\n|$)\s*/i, "").trim()
    return cleaned || "Vận chuyển hàng khô, kiểm tra bao bì nguyên đai nguyên kiện."
  }, [item?.note])

  // Lấy thông tin phương tiện cho từng Nhà cung cấp (Mỗi NCC 1 ô xe)
  const getSupplierTransportInfo = (sName, idx) => {
    const tMap = item?.transportsBySupplier || {}
    const norm = String(sName || "").trim().toLowerCase()
    const supInfo =
      tMap[sName] ||
      tMap[norm] ||
      Object.entries(tMap).find(([k]) => {
        const kNorm = String(k).trim().toLowerCase()
        return kNorm === norm || norm.includes(kNorm) || kNorm.includes(norm)
      })?.[1]

    if (supInfo) {
      const hasSpecificDispatched =
        supInfo.hasDispatched ||
        Boolean(supInfo.vehicle && !supInfo.vehicle.includes("Chưa phân công") && !supInfo.vehicle.includes("Chưa điều")) ||
        supInfo.status === "IN_TRANSIT" ||
        supInfo.status === "ARRIVED" ||
        supInfo.status === "INSPECTING" ||
        supInfo.status === "RECEIVED" ||
        supInfo.status === "APPROVED" ||
        supInfo.status === "COMPLETED"

      return {
        vehicle:
          supInfo.vehicle ||
          (hasSpecificDispatched ? "Xe giao hàng NCC" : "Chưa phân công (Chờ NCC điều xe)"),
        expectedTime: supInfo.expectedTime || item.deliverySchedule || "Chờ NCC cập nhật",
        qrCode:
          supInfo.qrCode ||
          `QR-PENDING-${item.deliveryNo || "DEL"}-0${idx + 1}`,
        note: supInfo.note || "",
        status: supInfo.status || item.status || "CREATED",
      }
    }

    const isPending =
      item.status === "CREATED" ||
      item.status === "PENDING" ||
      item.rawStatus === "CREATED" ||
      item.rawStatus === "PENDING"

    if (isPending) {
      return {
        vehicle: "Chưa phân công (Chờ NCC điều xe)",
        expectedTime: item.deliverySchedule || "Chờ NCC cập nhật",
        qrCode: `QR-PENDING-${item.deliveryNo || "DEL"}-0${idx + 1}`,
        status: "CREATED",
      }
    }

    const isAccepted =
      item.status === "ACCEPTED" ||
      item.status === "CONFIRMED" ||
      item.rawStatus === "ACCEPTED" ||
      item.rawStatus === "CONFIRMED"

    if (isAccepted) {
      return {
        vehicle: "Đang phân công (Chờ điều xe)",
        expectedTime: item.deliverySchedule || "Chờ NCC cập nhật",
        qrCode: `QR-CONFIRMED-${item.deliveryNo || "DEL"}-0${idx + 1}`,
        status: "CONFIRMED",
      }
    }

    return {
      vehicle: item.vehiclePlate || "Chưa phân công (Chờ NCC điều xe)",
      expectedTime: item.deliverySchedule || "Chờ NCC cập nhật",
      qrCode: `QR-LOT-${item.deliveryNo || "DEL"}-0${idx + 1}`,
      status: item.status || "CREATED",
    }
  }

  // Render badge trạng thái riêng của từng Nhà cung cấp
  const renderSupplierStatusBadge = (status) => {
    const raw = String(status || "").toUpperCase()
    if (
      raw === "CREATED" ||
      raw === "PENDING" ||
      raw === "SENT" ||
      raw === "DRAFT" ||
      raw === "IN_PROGRESS"
    ) {
      return (
        <Chip
          label="Chờ NCC xác nhận"
          size="small"
          className={styles.statusPending}
        />
      )
    }

    switch (status) {
      case "ACCEPTED":
      case "CONFIRMED":
        return (
          <Chip
            label="NCC đã xác nhận"
            size="small"
            className={styles.statusAccepted}
          />
        )
      case "IN_TRANSIT":
        return (
          <Chip
            label="Đang giao"
            size="small"
            className={styles.statusInTransit}
          />
        )
      case "ARRIVED":
        return (
          <Chip
            label="Đã tới trường (Chờ kiểm duyệt)"
            size="small"
            className={styles.statusArrived}
          />
        )
      case "COMPLETED":
      case "RECEIVED":
        return (
          <Chip
            label="Đã hoàn tất"
            size="small"
            className={styles.statusCompleted}
          />
        )
      case "REJECTED":
        return (
          <Chip
            label="Bị từ chối"
            size="small"
            color="error"
          />
        )
      case "CANCELLED":
        return (
          <Chip
            label="Đã hủy"
            size="small"
          />
        )
      default:
        return (
          <Chip
            label={status || "Chờ NCC xác nhận"}
            size="small"
            className={styles.statusPending}
          />
        )
    }
  }

  // State cho Popup Modal phóng to mã QR niêm phong xe
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedQrData, setSelectedQrData] = useState(null)
  const [qrCopied, setQrCopied] = useState(false)

  const handleOpenQrModal = (transport, sName) => {
    setSelectedQrData({
      ...transport,
      supplierName: sName,
    })
    setQrModalOpen(true)
    setQrCopied(false)
  }

  const handleCloseQrModal = () => {
    setQrModalOpen(false)
    setSelectedQrData(null)
    setQrCopied(false)
  }

  const handleCopyQrCode = async (text) => {
    if (!text) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
      setQrCopied(true)
      notice({ msg: `Đã sao chép mã QR: ${text}`, isSuccess: true })
      setTimeout(() => setQrCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const isPendingOverall =
    !item.isAssigned ||
    item.status === "CREATED" ||
    item.status === "PENDING" ||
    item.rawStatus === "CREATED" ||
    item.rawStatus === "PENDING"

  return (
    <Box className={styles.container}>
      {/* 1. Header & Nút Quay lại */}
      <Box className={styles.header}>
        <Button
          onClick={onBack}
          startIcon={<ArrowLeft size={18} />}
          variant="outlined"
          color="inherit"
          className={styles.backBtn}
        >
          Quay lại danh sách theo dõi
        </Button>

        <Box className={styles.headerTextGroup}>
          <Box className={styles.titleRow}>
            <Typography variant="h5" className={styles.title}>
              Mã nhập hàng: {item.deliveryNo || item.orderNo}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. Tiến trình đơn hàng (Đơn giản hóa, tinh gọn)
      <Paper className={styles.card} elevation={0}>
        <Typography variant="subtitle1" className={styles.cardTitle}>
          Tiến trình đơn hàng
        </Typography>

        <Box className={styles.simpleTimeline}>
          {item.timeline?.map((step, idx) => (
            <Box key={idx} className={styles.timelineStep}>
              <Box
                className={`${styles.stepDot} ${step.done ? styles.stepDotDone : step.current ? styles.stepDotCurrent : ""
                  }`}
              >
                {step.step}
              </Box>
              <Box className={styles.stepInfo}>
                <Typography className={styles.stepName}>{step.title}</Typography>
                <Typography className={styles.stepDate}>{step.time}</Typography>
              </Box>
              {idx < item.timeline.length - 1 && <Box className={styles.stepConnector} />}
            </Box>
          ))}
        </Box>
      </Paper> */}

      {/* 3. Khối thông tin Vận chuyển & Xe của từng Nhà cung cấp (Mỗi NCC hiện 1 ô) */}
      <Box className={styles.sectionWrapper}>
        <Box className={styles.sectionTitleRow}>
          <Box className={styles.cardHeaderIcon}>
            <Truck size={20} />
          </Box>
          <Typography variant="subtitle1" className={styles.cardTitle}>
            Thông Tin Vận Chuyển ({supplierCount} Nhà cung cấp)
          </Typography>
        </Box>

        {isPendingOverall && (
          <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2 }}>
            Đơn hàng đang chờ Nhà cung cấp tiếp nhận và phân công xe giao. Thông tin biển số xe sẽ được cập nhật ngay khi NCC xác nhận đơn.
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {supplierEntries.map(([sName, sItems], idx) => {
            const transport = getSupplierTransportInfo(sName, idx)
            return (
              <Paper
                key={idx}
                className={styles.card}
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid var(--border-default, #dce5e0)",
                }}
              >
                {/* Header NCC & Badge Xe */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1.25,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Truck size={20} color="var(--color-primary, #0a8066)" />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 750,
                        color: "var(--text-primary, #1d2b26)",
                        fontSize: "1rem",
                      }}
                    >
                      {supplierCount > 1 ? `${idx + 1}. ${sName}` : sName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {renderSupplierStatusBadge(transport.status)}
                    <Chip
                      label={`${sItems.length} mặt hàng`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                    />
                  </Box>
                </Box>
                <Divider className={styles.cardDivider} />

                {/* 2 Cột: Bên trái là Thông tin vận chuyển, Bên phải là Mã QR */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                    gap: 3,
                    alignItems: "center",
                  }}
                >
                  {/* Cột 1: Thông tin vận chuyển */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.25,
                      minWidth: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Truck size={16} color="#64748b" style={{ flexShrink: 0 }} />
                      <Typography
                        variant="body2"
                        sx={{ minWidth: { sm: 165 }, flexShrink: 0, color: "#64748b", fontWeight: 500 }}
                      >
                        Phương tiện vận chuyển:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {formatVehicle(transport.vehicle)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Calendar size={16} color="#64748b" style={{ flexShrink: 0 }} />
                      <Typography
                        variant="body2"
                        sx={{ minWidth: { sm: 165 }, flexShrink: 0, color: "#64748b", fontWeight: 500 }}
                      >
                        Thời gian dự kiến:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {transport.expectedTime}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Clock size={16} color="#64748b" style={{ flexShrink: 0 }} />
                      <Typography
                        variant="body2"
                        sx={{ minWidth: { sm: 165 }, flexShrink: 0, color: "#64748b", fontWeight: 500 }}
                      >
                        Ghi chú:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                        {formatVehicle(transport.vehicle) === "Chưa phân công (Chờ NCC điều xe)"
                          ? "Chưa có ghi chú"
                          : (transport.note || displayNote || "Chưa có ghi chú")}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Cột 2: Mã QR Lô Hàng / Niêm phong xe của NCC (Bấm để xem nổi) */}
                  <Tooltip title="Bấm để xem nổi mã QR niêm phong chuyến xe" arrow>
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenQrModal(transport, sName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleOpenQrModal(transport, sName)
                        }
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.75,
                        p: 1.75,
                        bgcolor: "var(--color-primary-soft, #e8f5f1)",
                        borderRadius: 2.5,
                        border: "1px solid var(--border-default, #bbf7d0)",
                        minWidth: { xs: "auto", sm: 280, md: 300 },
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        flexShrink: 0,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          bgcolor: "#d1fae5",
                          borderColor: "var(--color-primary, #0a8066)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(10, 128, 102, 0.15)",
                        },
                      }}
                    >
                      <QrCode size={40} color="var(--color-primary, #0a8066)" style={{ flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: "var(--color-primary, #0a8066)",
                            display: "block",
                            fontSize: "0.825rem",
                            letterSpacing: "0.01em",
                          }}
                        >
                          {transport.qrCode}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "var(--text-secondary, #52635c)", fontSize: "0.72rem", display: "block", mt: 0.25 }}
                        >
                          Mã QR niêm phong xe &amp; kiểm dịch NCC
                        </Typography>
                      </Box>
                      <Maximize2 size={16} color="var(--color-primary, #0a8066)" style={{ flexShrink: 0, opacity: 0.7 }} />
                    </Box>
                  </Tooltip>
                </Box>
              </Paper>
            )
          })}
        </Box>
      </Box>

      {/* 4. Danh sách nguyên liệu bàn giao */}
      <Paper className={styles.card} elevation={0}>
        <Typography variant="subtitle1" className={styles.cardTitle}>
          Danh mục nguyên liệu ({item.items?.length || 0} mặt hàng)
        </Typography>

        <Box className={styles.itemsTableWrapper}>
          <Table size="small">
            <TableHead>
              <TableRow className={styles.itemHeadRow}>
                <TableCell className={styles.itemTh}>Tên Nguyên Liệu</TableCell>
                <TableCell className={styles.itemTh}>Nhà Cung Cấp (NCC)</TableCell>
                <TableCell className={styles.itemTh} align="right">Số Lượng</TableCell>
                <TableCell className={styles.itemTh}>Đơn Vị</TableCell>
                <TableCell className={styles.itemTh}>Quy Cách / Tiêu Chuẩn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(item.items || item.deliveryItems || [])?.map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell className={styles.itemTdName}>{it.name || it.ingredientName}</TableCell>
                  <TableCell className={styles.itemTd}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "var(--text-primary, #1d2b26)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      {getItemSupplierName(it)}
                    </Typography>
                  </TableCell>
                  <TableCell className={styles.itemTdQty} align="right">
                    {it.qty ?? it.quantity ?? it.requestedQuantity ?? 0}
                  </TableCell>
                  <TableCell className={styles.itemTd}>{it.unit || "kg"}</TableCell>
                  <TableCell className={styles.itemTdSpec}>{it.spec || it.note || "Bao bì nguyên đai nguyên kiện, hạn sử dụng rõ ràng"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {item.note && (
          <>
            <Divider className={styles.cardDivider} />
            <Box className={styles.noteBox}>
              <Typography variant="caption" className={styles.noteTitle}>
                Ghi chú:
              </Typography>
              <Typography variant="body2" className={styles.noteText}>
                {item.note}
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Modal phóng to mã QR niêm phong xe & kiểm dịch NCC */}
      <Dialog
        open={qrModalOpen}
        onClose={handleCloseQrModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
            pt: 1.5,
            px: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <QrCode size={22} color="var(--color-primary, #0a8066)" />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a" }}>
              Mã QR Niêm Phong Vận Chuyển
            </Typography>
          </Box>
          <IconButton onClick={handleCloseQrModal} size="small" sx={{ color: "#64748b" }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2, py: 1.5, textAlign: "center" }}>
          {selectedQrData && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
                Đơn vị cung cấp: <strong style={{ color: "#0f172a" }}>{selectedQrData.supplierName || "Nhà cung cấp đối tác"}</strong>
              </Typography>

              {/* Khung hiển thị QR lớn */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#ffffff",
                  borderRadius: 3,
                  border: "2px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                  display: "inline-flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={
                    selectedQrData.qrImageDataUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
                      selectedQrData.qrCode || "FOODPRINT-DELIVERY",
                    )}`
                  }
                  alt={`Mã QR ${selectedQrData.qrCode}`}
                  style={{
                    width: 220,
                    height: 220,
                    display: "block",
                    borderRadius: 8,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = "flex"
                    }
                  }}
                />
                <Box
                  sx={{
                    display: "none",
                    width: 220,
                    height: 220,
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <QrCode size={96} color="var(--color-primary, #0a8066)" />
                  <Typography variant="caption" sx={{ mt: 1, color: "#64748b", textAlign: "center" }}>
                    {selectedQrData.qrCode}
                  </Typography>
                </Box>
              </Box>

              {/* Khối sao chép mã */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  bgcolor: "#f1f5f9",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#0f172a",
                    letterSpacing: "0.03em",
                  }}
                >
                  {selectedQrData.qrCode}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleCopyQrCode(selectedQrData.qrCode)}
                  sx={{ color: qrCopied ? "#16a34a" : "#475569" }}
                  title="Sao chép mã QR"
                >
                  {qrCopied ? <Check size={16} /> : <Copy size={16} />}
                </IconButton>
              </Box>

              {/* Thông tin chuyến xe đi kèm */}
              <Box
                sx={{
                  width: "100%",
                  bgcolor: "#f8fafc",
                  borderRadius: 2,
                  p: 1.5,
                  border: "1px solid #e2e8f0",
                  textAlign: "left",
                  fontSize: "0.8rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.75,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>Phương tiện:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {formatVehicle(selectedQrData.vehicle)}
                  </Typography>
                </Box>
                {selectedQrData.driver && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Tài xế:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {selectedQrData.driver} {selectedQrData.phone ? `(${selectedQrData.phone})` : ""}
                    </Typography>
                  </Box>
                )}
                {selectedQrData.expectedTime && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Thời gian dự kiến:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {selectedQrData.expectedTime}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 1.5 }}>
          <Button onClick={handleCloseQrModal} variant="contained" fullWidth sx={{ borderRadius: 2 }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

TrackingDetailView.propTypes = {
  item: PropTypes.object,
  inventoryItems: PropTypes.array,
  onBack: PropTypes.func.isRequired,
}
