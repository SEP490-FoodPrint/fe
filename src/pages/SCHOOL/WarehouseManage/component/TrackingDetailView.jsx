import React, { useMemo } from "react"
import PropTypes from "prop-types"
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
      }
    }

    return {
      vehicle: item.vehiclePlate || "Chưa phân công (Chờ NCC điều xe)",
      expectedTime: item.deliverySchedule || "Chờ NCC cập nhật",
      qrCode: `QR-LOT-${item.deliveryNo || "DEL"}-0${idx + 1}`,
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
            <Chip
              label={item.statusLabel}
              size="small"
              className={
                item.status === "CREATED" || item.status === "PENDING"
                  ? styles.statusPending
                  : item.status === "IN_TRANSIT"
                    ? styles.statusInTransit
                    : item.status === "ARRIVED"
                      ? styles.statusArrived
                      : item.status === "COMPLETED" || item.status === "RECEIVED"
                        ? styles.statusCompleted
                        : styles.statusAccepted
              }
            />
          </Box>
          <Typography variant="body2" className={styles.subtitle}>
            {supplierCount > 1 ? (
              <strong>Bao gồm {supplierCount} Nhà cung cấp</strong>
            ) : (
              <>NCC: <strong>{supplierEntries[0]?.[0] || item.supplierName}</strong></>
            )}
          </Typography>
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
            Thông Tin Vận Chuyển &amp; Xe Giao Hàng ({supplierCount} Nhà cung cấp)
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Truck size={20} color="var(--color-primary, #0a8066)" />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "var(--text-primary, #1d2b26)",
                        fontSize: "1rem",
                      }}
                    >
                      {supplierCount > 1 ? `${idx + 1}. ${sName}` : sName}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Xe ${idx + 1} • ${sItems.length} NL`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                  />
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
                        {displayNote}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Cột 2: Mã QR Lô Hàng / Niêm phong xe của NCC */}
                  <Box
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
                    }}
                  >
                    <QrCode size={40} color="var(--color-primary, #0a8066)" style={{ flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
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
    </Box>
  )
}

TrackingDetailView.propTypes = {
  item: PropTypes.object,
  inventoryItems: PropTypes.array,
  onBack: PropTypes.func.isRequired,
}
