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

  // State cho Popup Modal hiển thị nhãn QR dán bao bì nguyên liệu (giống NCC)
  const [itemQrModalOpen, setItemQrModalOpen] = useState(false)
  const [focusedItemId, setFocusedItemId] = useState(null)
  const [showAllLabels, setShowAllLabels] = useState(true)
  const [copiedLabelId, setCopiedLabelId] = useState("")

  const handleOpenItemQrModal = (it) => {
    const targetId = it?.id || it?.ingredientId || it?.name || null
    setFocusedItemId(targetId)
    setShowAllLabels(false)
    setItemQrModalOpen(true)
    setCopiedLabelId("")
  }

  const handleCloseItemQrModal = () => {
    setItemQrModalOpen(false)
    setFocusedItemId(null)
    setCopiedLabelId("")
  }

  const handleCopyTraceUrl = async (labelId, url) => {
    if (!url) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      }
      setCopiedLabelId(labelId)
      notice({ msg: "Đã sao chép liên kết truy xuất nguồn gốc!", isSuccess: true })
      setTimeout(() => setCopiedLabelId(""), 2000)
    } catch {
      // fallback
    }
  }

  // Kiểm tra NCC đã bàn giao xe vận chuyển xong hay chưa
  const isVehicleDispatched = (it, idx) => {
    const dStatus = String(item?.status || item?.rawStatus || "").toUpperCase()
    if (
      dStatus === "CREATED" ||
      dStatus === "PENDING" ||
      dStatus === "DRAFT" ||
      dStatus === "IN_PROGRESS" ||
      dStatus === "SENT"
    ) {
      return false
    }

    const sName = getItemSupplierName(it)
    const transport = getSupplierTransportInfo(sName, idx)
    const sStatus = String(transport?.status || "").toUpperCase()

    if (
      sStatus === "CREATED" ||
      sStatus === "PENDING" ||
      sStatus === "DRAFT" ||
      sStatus === "IN_PROGRESS" ||
      sStatus === "SENT"
    ) {
      return false
    }

    const validDispatchedStatuses = [
      "IN_TRANSIT",
      "ARRIVED",
      "INSPECTING",
      "PENDING_APPROVAL",
      "RECEIVED",
      "APPROVED",
      "COMPLETED",
    ]

    if (validDispatchedStatuses.includes(sStatus) || validDispatchedStatuses.includes(dStatus)) {
      return true
    }

    const transportVehicle = String(transport?.vehicle || "")
    const hasValidTransportVehicle =
      Boolean(transportVehicle) &&
      !transportVehicle.includes("Chưa") &&
      !transportVehicle.includes("Chờ")

    const itemVehicle = String(item?.vehiclePlate || "")
    const hasValidItemVehicle =
      Boolean(itemVehicle) &&
      !itemVehicle.includes("Chưa") &&
      !itemVehicle.includes("Chờ")

    return hasValidTransportVehicle || hasValidItemVehicle
  }

  const rawItems = (item.items || item.deliveryItems || [])
  const allLabels = useMemo(() => {
    return rawItems.map((it, idx) => {
      const sName = getItemSupplierName(it)
      const idKey = it.id || it.ingredientId || `dry-item-${idx + 1}`
      const token =
        it.qrToken ||
        it.qrCode ||
        `TOKEN-${item?.deliveryNo || "DRY"}-${String(idKey).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`

      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const traceUrl =
        it.qrUrl ||
        it.traceUrl ||
        `${origin}/api/public/delivery-items/${token}`

      return {
        deliveryItemId: idKey,
        deliveryNo: item?.deliveryNo || "DRY",
        supplierName: sName,
        ingredientName: it.name || it.ingredientName || "Nguyên liệu khô",
        actualQuantity: it.qty ?? it.quantity ?? it.requestedQuantity ?? 0,
        unit: it.unit || "kg",
        sourceFacility: {
          name: it.sourceFacility?.name || it.sourceFacilityName || "Kho tổng nguyên liệu khô chuẩn VietGAP",
          facilityCode: it.sourceFacility?.facilityCode || it.sourceFacilityCode || "",
        },
        traceUrl,
        qrToken: token,
        qrImageDataUrl: it.qrImageDataUrl || null,
      }
    })
  }, [rawItems, item?.deliveryNo])

  const visibleLabels = useMemo(() => {
    if (showAllLabels || !focusedItemId) return allLabels
    const matched = allLabels.filter(
      (lb) =>
        lb.deliveryItemId === focusedItemId ||
        lb.ingredientName === focusedItemId ||
        String(lb.deliveryItemId) === String(focusedItemId),
    )
    return matched.length > 0 ? matched : allLabels
  }, [allLabels, showAllLabels, focusedItemId])

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

                {/* Thông tin vận chuyển của chuyến xe */}
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
                <TableCell className={styles.itemTh} align="center">QR bao bì</TableCell>
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
                  <TableCell align="center">
                    {isVehicleDispatched(it, idx) ? (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenItemQrModal(it)}
                        startIcon={<QrCode size={15} color="#0a8066" />}
                        sx={{
                          borderColor: "#cbd5e1",
                          bgcolor: "#ffffff",
                          color: "#0a8066",
                          textTransform: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          borderRadius: 1.5,
                          py: 0.5,
                          px: 1.25,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                          "&:hover": {
                            borderColor: "#0a8066",
                            bgcolor: "#e8f5f1",
                            color: "#08604d",
                          },
                        }}
                      >
                        Xem QR
                      </Button>
                    ) : (
                      <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
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

      {/* Modal hiển thị Nhãn QR dán bao bì nguyên liệu (Giống NCC) */}
      <Dialog
        open={itemQrModalOpen}
        onClose={handleCloseItemQrModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <QrCode size={22} color="#0a8066" />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b" }}>
              Nhãn QR dán bao bì · {item.deliveryNo || ""}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseItemQrModal} size="small" sx={{ color: "#64748b" }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        {focusedItemId && allLabels.length > 1 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              px: 3,
              py: 1.25,
              bgcolor: "#e8f5f1",
              borderBottom: "1px solid #bbf7d0",
              flexShrink: 0,
            }}
          >
            <Typography variant="body2" sx={{ color: "#08604d", fontWeight: 600, fontSize: "0.85rem" }}>
              {showAllLabels
                ? `Đang xem toàn bộ ${allLabels.length} nhãn nguyên liệu trong đơn giao.`
                : "Đang xem nhãn QR của nguyên liệu đã chọn."}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowAllLabels((prev) => !prev)}
              sx={{
                bgcolor: "#ffffff",
                borderColor: "#6ee7b7",
                color: "#08604d",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.78rem",
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#fafbfa", borderColor: "#0a8066" },
              }}
            >
              {showAllLabels ? "Chỉ xem dòng đã chọn" : `Hiển thị tất cả (${allLabels.length} nhãn)`}
            </Button>
          </Box>
        )}

        <DialogContent sx={{ p: 3, bgcolor: "#f8faf9", flex: 1, overflowY: "auto" }}>
          {visibleLabels.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5, color: "#64748b" }}>
              <Typography variant="body2">Chưa có nhãn QR bao bì nào cho đợt giao này.</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: visibleLabels.length > 1 ? "repeat(2, 1fr)" : "1fr" },
                gap: 2,
              }}
            >
              {visibleLabels.map((label, idx) => (
                <Paper
                  key={label.deliveryItemId || idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid #e1e6e2",
                    bgcolor: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pb: 1,
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <Chip
                      label={label.deliveryNo || item.deliveryNo}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        bgcolor: "#f1f5f3",
                        color: "#24312d",
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "#6b7772",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label.supplierName}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "116px 1fr", gap: 1.75, alignItems: "start" }}>
                    <Box
                      sx={{
                        width: 116,
                        height: 116,
                        p: 0.75,
                        borderRadius: 2,
                        border: "1px solid #e1e6e2",
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      <img
                        src={
                          label.qrImageDataUrl ||
                          `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=${encodeURIComponent(
                            label.traceUrl || label.qrToken || label.ingredientName,
                          )}`
                        }
                        alt={`Mã QR ${label.ingredientName}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                          borderRadius: 4,
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
                          width: "100%",
                          height: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <QrCode size={48} color="#0a8066" />
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#24312d",
                          lineHeight: 1.3,
                        }}
                      >
                        {label.ingredientName}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          color: "#0a8066",
                        }}
                      >
                        Định lượng: {label.actualQuantity} {label.unit}
                      </Typography>

                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "#f8faf9",
                          borderRadius: 1.5,
                          border: "1px solid #e1e6e2",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#6b7772", display: "block", fontSize: "0.7rem" }}>
                          Cơ sở nguồn cung:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "#24312d",
                            display: "block",
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {label.sourceFacility?.name || "Kho tổng nguyên liệu khô chuẩn VietGAP"}
                          {label.sourceFacility?.facilityCode ? ` (${label.sourceFacility.facilityCode})` : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      pt: 1,
                      borderTop: "1px dashed #e1e6e2",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6b7772",
                        fontSize: "0.72rem",
                        fontFamily: "monospace",
                        maxWidth: "calc(100% - 110px)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={label.traceUrl}
                    >
                      {label.traceUrl}
                    </Typography>

                    <Button
                      size="small"
                      variant="text"
                      onClick={() => handleCopyTraceUrl(label.deliveryItemId, label.traceUrl)}
                      startIcon={copiedLabelId === label.deliveryItemId ? <Check size={13} /> : <Copy size={13} />}
                      sx={{
                        fontSize: "0.72rem",
                        color: copiedLabelId === label.deliveryItemId ? "#0a8066" : "#2563eb",
                        textTransform: "none",
                        p: "2px 6px",
                        minWidth: 0,
                        flexShrink: 0,
                      }}
                    >
                      {copiedLabelId === label.deliveryItemId ? "Đã sao chép" : "Sao chép URL"}
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #e1e6e2" }}>
          <Button onClick={handleCloseItemQrModal} variant="contained" sx={{ borderRadius: 2, bgcolor: "#0a8066", "&:hover": { bgcolor: "#086a55" } }}>
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
