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
  Tooltip,
  Box,
  Button,
} from "@mui/material"
import {
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Utensils,
  Eye,
} from "lucide-react"
import styles from "./DeliveryTable.module.scss"

export default function DeliveryTable({ deliveries = [], onViewDetail }) {
  // Render badge trạng thái 4 bên
  const renderApprovalMatrix = approvals => {
    if (!approvals) return null
    const roles = [
      { key: "ingredientManagement", label: "Ban QL NL", icon: <ShieldCheck size={14} /> },
      { key: "healthOfficer", label: "Y tế", icon: <Stethoscope size={14} /> },
      { key: "parentsCommittee", label: "Phụ huynh", icon: <HeartHandshake size={14} /> },
      { key: "kitchenStaff", label: "Bên Bếp", icon: <Utensils size={14} /> },
    ]

    return (
      <Box className={styles.approvalMatrix}>
        {roles.map(r => {
          const app = approvals[r.key]
          let statusClass = styles.pendingDot
          let tooltipText = `${r.label}: Đang chờ kiểm tra`

          if (app?.approved === true) {
            statusClass = styles.approvedDot
            tooltipText = `${r.label}: Đã duyệt (${app.name || "Đạt"})`
          } else if (app?.approved === false) {
            statusClass = styles.rejectedDot
            tooltipText = `${r.label}: TỪ CHỐI (${app.name || "Không đạt"})`
          }

          return (
            <Tooltip key={r.key} title={tooltipText} arrow>
              <Box className={`${styles.roleIconBadge} ${statusClass}`}>
                {r.icon}
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    )
  }

  const getStatusBadge = item => {
    switch (item.status) {
      case "COMPLETED":
        return (
          <Chip
            icon={<CheckCircle2 size={14} />}
            label="4/4 Đã duyệt & Bàn giao bếp"
            size="small"
            className={styles.statusSuccess}
          />
        )
      case "INSPECTING":
        return (
          <Chip
            icon={<Clock size={14} />}
            label="Đang kiểm tra 4 bên"
            size="small"
            className={styles.statusWarning}
          />
        )
      case "WAITING_ATTENDANCE":
        return (
          <Chip
            icon={<Users size={14} />}
            label="Chờ GVCN báo sĩ số"
            size="small"
            className={styles.statusPending}
          />
        )
      case "CONFIRMED":
        return (
          <Chip
            label="NCC đang chuẩn bị"
            size="small"
            className={styles.statusInfo}
          />
        )
      case "REJECTED":
        return (
          <Chip
            icon={<AlertTriangle size={14} />}
            label="Từ chối (Giao lại)"
            size="small"
            className={styles.statusDanger}
          />
        )
      default:
        return <Chip label={item.statusLabel || item.status} size="small" />
    }
  }

  return (
    <TableContainer component={Paper} className={styles.tableWrapper}>
      <Table className={styles.table} aria-label="Bảng danh sách phiếu giao nhận">
        <TableHead className={styles.tableHead}>
          <TableRow>
            <TableCell>Mã phiếu & Mã đơn</TableCell>
            <TableCell>Đợt giao nhận</TableCell>
            <TableCell>Giờ & Ngày giao</TableCell>
            <TableCell>Thực đơn & Suất ăn</TableCell>
            <TableCell>Nhà cung cấp & Lô QR</TableCell>
            <TableCell align="center">Kiểm tra 4 bên</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" className={styles.emptyCell}>
                Không có phiếu giao nhận nào phù hợp với bộ lọc
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map(item => {
              const isBatch1 = item.batchType === "BATCH_1"

              return (
                <TableRow
                  key={item.id}
                  className={`${styles.tableRow} ${styles.clickableRow}`}
                  hover
                  onClick={() => onViewDetail && onViewDetail(item)}
                >
                  {/* Mã phiếu & Mã đơn */}
                  <TableCell>
                    <Typography variant="subtitle2" className={styles.deliveryNo}>
                      {item.deliveryNo}
                    </Typography>
                    <Typography variant="caption" className={styles.orderNo}>
                      Đơn: {item.orderNo}
                    </Typography>
                  </TableCell>

                  {/* Đợt giao */}
                  <TableCell>
                    <Chip
                      label={isBatch1 ? "Đợt 1 (50% Suất tối đa)" : "Đợt 2 (Theo sĩ số GVCN)"}
                      size="small"
                      className={isBatch1 ? styles.batch1Chip : styles.batch2Chip}
                    />
                  </TableCell>

                  {/* Giờ & Ngày */}
                  <TableCell>
                    <Typography variant="subtitle2" className={styles.timeText}>
                      {item.deliveryTime}
                    </Typography>
                    <Typography variant="caption" className={styles.dateText}>
                      {item.deliveryDate}
                    </Typography>
                  </TableCell>

                  {/* Thực đơn */}
                  <TableCell>
                    <Typography variant="body2" className={styles.menuName}>
                      {item.menuName}
                    </Typography>
                    <Typography variant="caption" className={styles.portionsText}>
                      {isBatch1
                        ? `Giao: ${item.plannedPortions} / ${item.maxPortions} suất`
                        : item.actualAttendance
                        ? `Sĩ số chốt: ${item.actualAttendance} HS (Giao bù: ${item.plannedPortions} suất)`
                        : `Dự kiến: ${item.plannedPortions} suất`}
                    </Typography>
                  </TableCell>

                  {/* Nhà cung cấp & Mã QR */}
                  <TableCell>
                    <Typography variant="body2" className={styles.supplierText}>
                      {item.supplierName}
                    </Typography>
                    {item.deliveryQr && item.deliveryQr !== "--" && (
                      <Box className={styles.qrBadge}>
                        <QrCode size={13} className={styles.qrIcon} />
                        <span>{item.deliveryQr}</span>
                      </Box>
                    )}
                  </TableCell>

                  {/* Kiểm tra 4 bên */}
                  <TableCell align="center">
                    {renderApprovalMatrix(item.approvals)}
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell>{getStatusBadge(item)}</TableCell>

                  {/* Thao tác */}
                  <TableCell align="center" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Eye size={15} />}
                      onClick={() => onViewDetail && onViewDetail(item)}
                      className={styles.viewBtn}
                    >
                      Chi tiết
                    </Button>
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

DeliveryTable.propTypes = {
  deliveries: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewDetail: PropTypes.func,
}
