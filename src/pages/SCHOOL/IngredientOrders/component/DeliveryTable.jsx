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
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Utensils,
  Eye,
  PlusCircle,
  RotateCcw,
} from "lucide-react"
import styles from "./DeliveryTable.module.scss"

export default function DeliveryTable({ deliveries = [], onViewDetail, onAddBatch2 }) {
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

  // Đếm số bên từ chối trong hội đồng nghiệm thu 4 bên
  const getRejectCount = approvals => {
    if (!approvals) return 0
    return Object.values(approvals).filter(a => a?.approved === false).length
  }

  const getStatusBadge = item => {
    const rejectCount = getRejectCount(item.approvals)

    // Quy tắc nghiệm thu: >= 2 bên từ chối -> Hủy luôn
    if (item.status === "CANCELLED" || rejectCount >= 2) {
      return (
        <Chip
          icon={<AlertTriangle size={14} />}
          label="Đã hủy (≥ 2 bên từ chối)"
          size="small"
          className={styles.statusCancelled}
        />
      )
    }

    // Quy tắc nghiệm thu: 1 bên từ chối -> Giao lại
    if (item.status === "RE_DELIVER" || rejectCount === 1) {
      return (
        <Chip
          icon={<RotateCcw size={14} />}
          label="Yêu cầu giao lại (1 bên từ chối)"
          size="small"
          className={styles.statusRedeliver}
        />
      )
    }

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
      case "CONFIRMED":
        return (
          <Chip
            icon={<Clock size={14} />}
            label={item.statusLabel || "NCC chuẩn bị giao"}
            size="small"
            className={styles.statusConfirmed}
          />
        )
      default:
        return <Chip label={item.statusLabel || item.status} size="small" />
    }
  }

  return (
    <TableContainer component={Paper} className={styles.tableCard} elevation={0}>
      <Table className={styles.deliveryTable} size="small">
        <TableHead>
          <TableRow className={styles.headerRow}>
            <TableCell>Số phiếu / Đơn hàng</TableCell>
            <TableCell>Đợt giao &amp; Thời gian</TableCell>
            <TableCell>Nhà cung cấp</TableCell>
            <TableCell align="center">Hội đồng 4 bên</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="center">Thao tác</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {deliveries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" className={styles.emptyCell}>
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy phiếu giao nhận nào phù hợp với bộ lọc.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            deliveries.map(item => {
              const isBatch1 = item.batchType === "BATCH_1"
              // Kiểm tra ngày này đã có Đợt 2 chưa
              const hasBatch2ForDate = deliveries.some(
                d => d.deliveryDate === item.deliveryDate && d.batchType === "BATCH_2"
              )
              // Đợt 1 "đi tong" (bị hủy do >= 2 bên từ chối hoặc đang bị yêu cầu giao lại)
              const rejectCount = getRejectCount(item.approvals)
              const isBatch1Failed =
                item.status === "CANCELLED" ||
                item.status === "REJECTED" ||
                item.status === "RE_DELIVER" ||
                rejectCount > 0

              const canAddBatch2 = isBatch1 && !hasBatch2ForDate && !isBatch1Failed

              return (
                <TableRow
                  key={item.id}
                  hover
                  className={styles.tableRow}
                  onClick={() => onViewDetail && onViewDetail(item)}
                >
                  {/* Số phiếu & Đơn hàng */}
                  <TableCell>
                    <Typography variant="subtitle2" className={styles.deliveryNo}>
                      {item.deliveryNo}
                    </Typography>
                    <Typography variant="caption" className={styles.orderNo}>
                      {item.orderNo}
                    </Typography>
                  </TableCell>

                  {/* Đợt giao & Thời gian */}
                  <TableCell>
                    <Box className={styles.batchWrap}>
                      <Chip
                        label={isBatch1 ? "Đợt 1 (50% Suất)" : "Đợt 2 (Sĩ số)"}
                        size="small"
                        className={isBatch1 ? styles.batch1Chip : styles.batch2Chip}
                      />
                      <Typography variant="caption" className={styles.timeText}>
                        {item.deliveryTime} • {item.deliveryDate}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Nhà cung cấp */}
                  <TableCell>
                    <Typography variant="body2" className={styles.supplierText}>
                      {item.supplierName}
                    </Typography>
                  </TableCell>

                  {/* Kiểm tra 4 bên */}
                  <TableCell align="center">
                    {renderApprovalMatrix(item.approvals)}
                  </TableCell>

                  {/* Trạng thái */}
                  <TableCell>{getStatusBadge(item)}</TableCell>

                  {/* Thao tác */}
                  <TableCell align="center" onClick={e => e.stopPropagation()}>
                    <Box className={styles.actionCellWrap}>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<Eye size={15} />}
                        onClick={() => onViewDetail && onViewDetail(item)}
                        className={styles.viewBtn}
                      >
                        Chi tiết
                      </Button>

                      {/* Nút Tạo Đợt 2 nếu phiếu này là Đợt 1, ngày đó chưa có Đợt 2, và Đợt 1 không bị hủy/từ chối */}
                      {canAddBatch2 && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlusCircle size={14} />}
                          onClick={() => onAddBatch2 && onAddBatch2(item)}
                          className={styles.addBatch2Btn}
                        >
                          Thêm Đợt 2
                        </Button>
                      )}
                    </Box>
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
  onAddBatch2: PropTypes.func,
}
