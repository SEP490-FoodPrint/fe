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
} from "lucide-react"
import styles from "./TrackingDetailView.module.scss"

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

  // Lấy thông tin phương tiện, tài xế cho từng Nhà cung cấp (Mỗi NCC 1 ô xe)
  const getSupplierTransportInfo = (sName, idx) => {
    const isPending =
      item.status === "CREATED" ||
      item.status === "PENDING" ||
      item.rawStatus === "CREATED" ||
      item.rawStatus === "PENDING"

    if (isPending) {
      return {
        driver: "Chưa phân công (Chờ NCC điều xe)",
        phone: "--",
        vehicle: "Chưa điều xe",
        temp: "Chưa đo (Chờ xe tới)",
        currentLocation: "Kho NCC (Chờ xác nhận đơn)",
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
        driver: "Đang phân công",
        phone: "--",
        vehicle: "Đang điều phối xe",
        temp: "Chưa đo (Chờ xuất xe)",
        currentLocation: "Kho NCC (Đang chuẩn bị hàng)",
        qrCode: `QR-CONFIRMED-${item.deliveryNo || "DEL"}-0${idx + 1}`,
      }
    }

    // Nếu chỉ có 1 NCC và đơn hàng đã có thông tin cụ thể từ hệ thống
    if (item.driverName && item.driverName !== "--" && !item.driverName.includes("Chờ") && item.vehiclePlate) {
      return {
        driver: item.driverName,
        phone: item.driverPhone || "--",
        vehicle: item.vehiclePlate,
        temp: item.refrigerationTemp || (item.orderType === "DRY_STOCK" ? "Nhiệt độ phòng (Khô ráo)" : "Chưa đo (Chờ xe tới)"),
        currentLocation: item.currentLocation || "Đang di chuyển trên đường đến trường",
        qrCode: `QR-LOT-${item.deliveryNo || "DEL"}-01`,
      }
    }

    return {
      driver: item.driverName && !item.driverName.includes("Chờ") ? item.driverName : "Chưa phân công (Chờ NCC điều xe)",
      phone: item.driverPhone || "--",
      vehicle: item.vehiclePlate || "Chưa điều xe",
      temp:
        item.refrigerationTemp ||
        (item.orderType === "DRY_STOCK"
          ? "Nhiệt độ phòng (Khô ráo)"
          : "Chưa đo (Chờ xe tới)"),
      currentLocation: item.currentLocation || "Chờ NCC xuất kho & điều xe",
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
              Chi Tiết Đơn Hàng: {item.orderNo}
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
            Mã phiếu giao: {item.deliveryNo} &bull; {item.orderTypeLabel} &bull;{" "}
            {supplierCount > 1 ? (
              <strong>Bao gồm {supplierCount} Nhà cung cấp đối tác</strong>
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
            Đơn hàng đang chờ Nhà cung cấp tiếp nhận và phân công xe giao. Thông tin tài xế và biển số xe sẽ được cập nhật ngay khi NCC xác nhận đơn.
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              supplierCount === 1
                ? "1fr"
                : "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 2,
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
                  gap: 1.5,
                  p: 2.2,
                  borderRadius: 3,
                  border: "1px solid var(--border-default, #dce5e0)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Truck size={18} color="var(--color-primary, #0a8066)" />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "var(--text-primary, #1d2b26)",
                        fontSize: "0.95rem",
                      }}
                    >
                      {supplierCount > 1 ? `${idx + 1}. ${sName}` : sName}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Xe ${idx + 1} • ${sItems.length} món`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                  />
                </Box>
                <Divider className={styles.cardDivider} />

                <Box
                  className={styles.infoRowGrid}
                  sx={{
                    gridTemplateColumns:
                      supplierCount > 1
                        ? "repeat(2, 1fr) !important"
                        : "repeat(3, 1fr)",
                    gap: 1.5,
                  }}
                >
                  <Box className={styles.infoField}>
                    <span className={styles.label}>Tài xế phụ trách:</span>
                    <span className={styles.valueBold}>{transport.driver}</span>
                  </Box>

                  <Box className={styles.infoField}>
                    <span className={styles.label}>Số điện thoại:</span>
                    {transport.phone && transport.phone !== "--" ? (
                      <span className={styles.phoneValue}>
                        <a href={`tel:${transport.phone}`}>
                          <Phone size={14} /> {transport.phone}
                        </a>
                      </span>
                    ) : (
                      <span className={styles.value}>--</span>
                    )}
                  </Box>

                  <Box className={styles.infoField}>
                    <span className={styles.label}>Biển số &amp; Loại xe:</span>
                    <span className={styles.valueBold}>{transport.vehicle}</span>
                  </Box>

                  <Box className={styles.infoField}>
                    <span className={styles.label}>Lịch hẹn giao:</span>
                    <span className={styles.value}>
                      <Calendar size={14} className={styles.inlineIcon} /> {item.deliverySchedule}
                    </span>
                  </Box>

                  <Box className={styles.infoField}>
                    <span className={styles.label}>Nhiệt độ thùng xe:</span>
                    <span className={styles.value}>
                      <Thermometer size={14} className={styles.inlineIcon} /> {transport.temp}
                    </span>
                  </Box>

                  <Box className={styles.infoField}>
                    <span className={styles.label}>Vị trí cập nhật:</span>
                    <span className={styles.value}>
                      <MapPin size={14} className={styles.inlineIcon} /> {transport.currentLocation}
                    </span>
                  </Box>
                </Box>

                {/* Mã QR Lô Hàng / Niêm phong xe của NCC */}
                <Box
                  sx={{
                    mt: "auto",
                    pt: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.2,
                    bgcolor: "var(--color-primary-soft, #e8f5f1)",
                    borderRadius: 2,
                    border: "1px solid var(--border-default, #dce5e0)",
                  }}
                >
                  <QrCode size={30} color="var(--color-primary, #0a8066)" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "var(--color-primary, #0a8066)",
                        display: "block",
                        fontSize: "0.8rem",
                      }}
                    >
                      {transport.qrCode}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--text-secondary, #52635c)", fontSize: "0.7rem" }}
                    >
                      Mã QR niêm phong xe &amp; kiểm dịch NCC
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
