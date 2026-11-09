import React, { useState } from "react"
import PropTypes from "prop-types"
import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Paper,
  TextField,
  TableContainer,
} from "@mui/material"
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Utensils,
  CheckCircle2,
  XCircle,
  Clock,
  Thermometer,
  Truck,
  Printer,
  Calendar,
  Users,
  Check,
} from "lucide-react"
import styles from "./DeliveryDetailView.module.scss"

export default function DeliveryDetailView({ delivery, onBack, onConfirmAttendance }) {
  const [attendanceInput, setAttendanceInput] = useState(
    delivery?.actualAttendance || 820
  )
  const [updating, setUpdating] = useState(false)

  if (!delivery) return null

  const isBatch1 = delivery.batchType === "BATCH_1"
  const isBatch2 = delivery.batchType === "BATCH_2"
  const isWaitingAttendance = delivery.status === "WAITING_ATTENDANCE"
  const approvals = delivery.approvals || {}

  // Đếm số bên từ chối theo nguyên tắc nghiệm thu
  const rejectCount = Object.values(approvals).filter(a => a?.approved === false).length
  const isCancelled = delivery.status === "CANCELLED" || rejectCount >= 2
  const isRedeliver = (delivery.status === "RE_DELIVER" || delivery.status === "REJECTED") && rejectCount === 1

  const maxPortions = delivery.maxPortions || 850
  const batch1Portions = delivery.batch1Portions || 425
  const remainingNeeded = Math.max(0, attendanceInput - batch1Portions)
  const savedPortions = Math.max(0, maxPortions - attendanceInput)

  const handleConfirm = async () => {
    if (!onConfirmAttendance) return
    setUpdating(true)
    try {
      await onConfirmAttendance(delivery.id, Number(attendanceInput))
    } finally {
      setUpdating(false)
    }
  }

  const roles = [
    {
      key: "ingredientManagement",
      title: "1. Ban QL Nguyên liệu",
      icon: <ShieldCheck size={20} />,
      data: approvals.ingredientManagement,
    },
    {
      key: "healthOfficer",
      title: "2. Y tế học đường",
      icon: <Stethoscope size={20} />,
      data: approvals.healthOfficer,
    },
    {
      key: "parentsCommittee",
      title: "3. Đại diện Ban Phụ huynh",
      icon: <HeartHandshake size={20} />,
      data: approvals.parentsCommittee,
    },
    {
      key: "kitchenStaff",
      title: "4. Đại diện Nhà Bếp",
      icon: <Utensils size={20} />,
      data: approvals.kitchenStaff,
    },
  ]

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
            <Box className={styles.titleWithBadge}>
              <Typography variant="h5" className={styles.mainTitle}>
                Phiếu Giao Nhận: {delivery.deliveryNo}
              </Typography>
              <Chip
                label={isBatch1 ? "Đợt 1 (50% Suất tối đa)" : "Đợt 2 (Theo sĩ số GVCN)"}
                size="small"
                className={isBatch1 ? styles.batch1Chip : styles.batch2Chip}
              />
            </Box>
            <Typography variant="body2" className={styles.subTitle}>
              Đơn đặt hàng gốc: <strong>{delivery.orderNo}</strong>
            </Typography>
          </Box>
        </Box>

      </Box>

      {/* 2. Cảnh báo Từ chối / Hủy đơn theo quy tắc nghiệm thu */}
      {isCancelled && (
        <Alert severity="error" className={styles.rejectAlert}>
          <Typography variant="subtitle2" className={styles.rejectTitle}>
            ĐƠN HÀNG ĐÃ BỊ HỦY TOÀN BỘ ({rejectCount} BÊN TỪ CHỐI):
          </Typography>
          <Typography variant="body2">
            {delivery.rejectionReason || "Theo quy chế nghiệm thu, từ 2 bên từ chối trở lên thì hủy toàn bộ đơn hàng. Đợt 1 đã bị hủy nên không thể triển khai Đợt 2."}
          </Typography>
        </Alert>
      )}

      {isRedeliver && (
        <Alert severity="warning" className={styles.redeliverAlert}>
          <Typography variant="subtitle2" className={styles.rejectTitle}>
            YÊU CẦU NCC GIAO LẠI LÔ HÀNG KHÁC (1 BÊN TỪ CHỐI):
          </Typography>
          <Typography variant="body2">
            {delivery.rejectionReason || "Có 1 bên không đồng thuận nhận hàng. NCC phải thu hồi lô này và chuyển xe khác đạt chuẩn trước giờ chế biến."}
          </Typography>
        </Alert>
      )}

      {/* 3. KHỐI CHỐT SĨ SỐ ĐỢT 2 (Dành cho phiếu Đợt 2) */}
      {isBatch2 && isWaitingAttendance && (
        <Paper className={styles.attendanceCard} elevation={0}>
          <Box className={styles.attendanceHeader}>
            <Users size={22} className={styles.attendanceIcon} />
            <Box>
              <Typography variant="subtitle1" className={styles.attendanceTitle}>
                Điểm Danh & Chốt Sĩ Số Đợt 2 Từ GVCN
              </Typography>
              <Typography variant="body2" className={styles.attendanceSubtitle}>
                Dựa trên sĩ số điểm danh học sinh sáng nay do GVCN báo lên, hệ thống sẽ tính lại số suất ăn Đợt 2 cần giao để sát thực tế nhất, tránh lãng phí thức ăn.
              </Typography>
            </Box>
          </Box>

          <Divider className={styles.attendanceDivider} />

          <Box className={styles.attendanceBody}>
            <Box className={styles.attendanceCompareGrid}>
              <Box className={styles.compareItem}>
                <Typography variant="caption" className={styles.compareLabel}>
                  Sĩ số tối đa (dự kiến):
                </Typography>
                <Typography variant="h6" className={styles.compareValue}>
                  {maxPortions} suất
                </Typography>
              </Box>

              <Box className={styles.compareItem}>
                <Typography variant="caption" className={styles.compareLabel}>
                  Đợt 1 đã nhận lúc 5h30 sáng (50%):
                </Typography>
                <Typography variant="h6" className={styles.compareValuePrimary}>
                  {batch1Portions} suất
                </Typography>
              </Box>
            </Box>

            <Box className={styles.attendanceActionBox}>
              <TextField
                label="Sĩ số thực tế GVCN báo sáng nay"
                type="number"
                size="small"
                value={attendanceInput}
                onChange={e =>
                  setAttendanceInput(Math.max(batch1Portions, Number(e.target.value)))
                }
                helperText={`Tối thiểu phải bằng số suất Đợt 1 (${batch1Portions} suất) đã nhận.`}
                className={styles.attendanceInputField}
              />

              <Box className={styles.calcResultBox}>
                <Typography variant="body2" className={styles.calcResultText}>
                  Số suất Đợt 2 cần bổ sung: <strong>{remainingNeeded} suất</strong>
                </Typography>
                {savedPortions > 0 && (
                  <Chip
                    icon={<Check size={14} />}
                    label={`Tiết kiệm được ${savedPortions} suất ăn so với dự kiến`}
                    size="small"
                    className={styles.savedChip}
                  />
                )}
              </Box>

              <Button
                variant="contained"
                onClick={handleConfirm}
                disabled={updating}
                className={styles.confirmAttendanceBtn}
              >
                {updating ? "Đang cập nhật..." : "Chốt số lượng & Báo NCC giao Đợt 2"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {isBatch2 && !isWaitingAttendance && delivery.actualAttendance && (
        <Alert severity="success" icon={<CheckCircle2 size={18} />} className={styles.confirmedAlert}>
          GVCN đã chốt sĩ số sáng: <strong>{delivery.actualAttendance} / {delivery.maxPortions} học sinh</strong>. Đợt 2 đã giao bù <strong>{delivery.plannedPortions} suất</strong> (Tiết kiệm {delivery.maxPortions - delivery.actualAttendance} suất ăn so với định mức tối đa).
        </Alert>
      )}

      {/* 4. Khối Thông tin Chuyến giao & Mã QR Lô Hàng */}
      <Box className={styles.infoGrid}>
        <Paper className={styles.infoCard} elevation={0}>
          <Typography variant="subtitle2" className={styles.cardHeaderTitle}>
            Thông Tin Vận Chuyển & Xe Lạnh
          </Typography>
          <Divider className={styles.cardDivider} />

          <Box className={styles.infoItem}>
            <Truck size={16} className={styles.infoIcon} />
            <Typography variant="body2" className={styles.infoLabel}>
              Nhà cung cấp:
            </Typography>
            <Typography variant="body2" className={styles.infoValue}>
              {delivery.supplierName}
            </Typography>
          </Box>

          <Box className={styles.infoItem}>
            <Calendar size={16} className={styles.infoIcon} />
            <Typography variant="body2" className={styles.infoLabel}>
              Thời gian giao:
            </Typography>
            <Typography variant="body2" className={styles.infoValue}>
              {delivery.deliveryTime} — Ngày {delivery.deliveryDate}
            </Typography>
          </Box>

          <Box className={styles.infoItem}>
            <Thermometer size={16} className={styles.infoIcon} />
            <Typography variant="body2" className={styles.infoLabel}>
              Nhiệt độ thùng xe:
            </Typography>
            <Typography
              variant="body2"
              className={delivery.status === "REJECTED" ? styles.tempDanger : styles.infoValue}
            >
              {delivery.refrigerationTemp}
            </Typography>
          </Box>

          <Box className={styles.infoItem}>
            <Utensils size={16} className={styles.infoIcon} />
            <Typography variant="body2" className={styles.infoLabel}>
              Quy mô suất ăn:
            </Typography>
            <Typography variant="body2" className={styles.infoValue}>
              {isBatch1
                ? `${delivery.plannedPortions} / ${delivery.maxPortions} suất chuẩn (50%)`
                : delivery.actualAttendance
                  ? `Sĩ số chốt: ${delivery.actualAttendance} HS (Giao bù ${delivery.plannedPortions} suất)`
                  : `${delivery.plannedPortions} suất`}
            </Typography>
          </Box>

          <Box className={styles.infoItem}>
            <Typography variant="body2" className={styles.infoLabel}>
              Tài xế & Phương tiện:
            </Typography>
            <Typography variant="body2" className={styles.infoValue}>
              {delivery.driverName}
            </Typography>
          </Box>
        </Paper>

        {/* Khối Mã QR Truy xuất Lô Hàng */}
        <Paper className={styles.qrCard} elevation={0}>
          <Box className={styles.qrHeader}>
            <QrCode size={18} className={styles.qrIcon} />
            <Typography variant="subtitle2" className={styles.qrTitle}>
              Mã QR Truy Xuất Nguồn Gốc Lô Hàng
            </Typography>
          </Box>
          <Divider className={styles.cardDivider} />

          <Box className={styles.qrBody}>
            <Box className={styles.qrPlaceholder}>
              <QrCode size={64} className={styles.qrBigIcon} />
            </Box>
            <Box className={styles.qrDetails}>
              <Typography variant="subtitle1" className={styles.qrCodeText}>
                {delivery.deliveryQr || "Chưa phát hành"}
              </Typography>
              <Typography variant="caption" className={styles.qrDesc}>
                Mã QR do NCC cấp kèm theo chuyến xe, chứa nguồn gốc xuất xưởng nông trại, chứng chỉ kiểm dịch thú y và hạn sử dụng.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* 5. HỘI ĐỒNG KIỂM TRA 4 BÊN TẠI CỔNG TRƯỜNG */}
      <Box className={styles.sectionWrapper}>
        <Box className={styles.sectionTitleRow}>
          <Typography variant="h6" className={styles.sectionHeading}>
            Hội Đồng Nghiệm Thu 4 Bên Tại Cổng Trường
          </Typography>
          <Chip
            label="Nguyên tắc nghiệm thu: 1 bên từ chối = Giao lại | ≥ 2 bên từ chối = Hủy luôn"
            size="small"
            className={styles.consensusChip}
          />
        </Box>

        <Box className={styles.approvalsGrid}>
          {roles.map(r => {
            const data = r.data
            const isApproved = data?.approved === true
            const isRejected = data?.approved === false
            const isPending = data?.approved === null || data?.approved === undefined

            return (
              <Box
                key={r.key}
                className={`${styles.approvalCard} ${isApproved ? styles.approvedCard : isRejected ? styles.rejectedCard : styles.pendingCard
                  }`}
              >
                <Box className={styles.cardTop}>
                  <Box className={styles.roleTitleGroup}>
                    {r.icon}
                    <Typography variant="subtitle2" className={styles.roleTitle}>
                      {r.title}
                    </Typography>
                  </Box>

                  {isApproved && <CheckCircle2 size={20} className={styles.checkIcon} />}
                  {isRejected && <XCircle size={20} className={styles.rejectIcon} />}
                  {isPending && <Clock size={20} className={styles.clockIcon} />}
                </Box>

                <Typography variant="caption" className={styles.roleDuty}>
                  {r.roleDuty}
                </Typography>

                <Divider className={styles.roleDivider} />

                <Box className={styles.cardBottom}>
                  {isApproved && (
                    <>
                      <Typography variant="body2" className={styles.signerName}>
                        {data?.name || "Đại diện đã ký"}
                      </Typography>
                      {data?.time && (
                        <Typography variant="caption" className={styles.signTime}>
                          Ký lúc: {data.time}
                        </Typography>
                      )}
                    </>
                  )}
                  {isRejected && (
                    <Typography variant="body2" className={styles.rejectSignText}>
                      {data?.name || "TỪ CHỐI NHẬP HÀNG"}
                    </Typography>
                  )}
                  {isPending && (
                    <Typography variant="caption" className={styles.pendingSignText}>
                      Đang chờ đại diện kiểm tra...
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* 6. BẢNG CHI TIẾT NGUYÊN LIỆU ĐỢT GIAO */}
      <Box className={styles.sectionWrapper}>
        <Typography variant="h6" className={styles.sectionHeading}>
          Chi Tiết Mặt Hàng Thực Giao Trong Đợt Này
        </Typography>

        <TableContainer component={Paper} elevation={0} className={styles.tableWrapper}>
          <Table size="small" className={styles.itemsTable}>
            <TableHead>
              <TableRow className={styles.tableHeaderRow}>
                <TableCell>Tên nguyên liệu</TableCell>
                <TableCell>Phân loại kho</TableCell>
                <TableCell align="center">Đơn vị</TableCell>
                <TableCell align="right">Số lượng đặt</TableCell>
                <TableCell align="right">Số lượng thực cân nhận</TableCell>
                <TableCell align="center">Đánh giá cảm quan & ATTP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {delivery.items?.map((item, idx) => {
                const displayedOrderedQty = isWaitingAttendance
                  ? Number((((item.orderedQty || 0) / (delivery.plannedPortions || 425)) * remainingNeeded).toFixed(2))
                  : item.orderedQty

                return (
                  <TableRow key={idx} hover className={styles.tableRow}>
                    <TableCell>
                      <Typography variant="subtitle2" className={styles.ingName}>
                        {item.ingredientName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.handlingType === "DIRECT_USE" ? "Tươi sống (Dùng ngay)" : "Kho khô"}
                        size="small"
                        className={item.handlingType === "DIRECT_USE" ? styles.freshChip : styles.dryChip}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">{item.unit}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" className={styles.orderedQty}>
                        {displayedOrderedQty} {item.unit}
                      </Typography>
                      {isWaitingAttendance && (
                        <Typography variant="caption" sx={{ color: "#d97706", display: "block", fontSize: "0.7rem" }}>
                          (Theo {remainingNeeded} suất)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" className={styles.deliveredQty}>
                        {item.deliveredQty > 0 ? `${item.deliveredQty} ${item.unit}` : "Chờ cân thực tế"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {item.status === "ACCEPTED" ? (
                        <Chip label="Đạt chuẩn tươi ngon" size="small" className={styles.itemAccepted} />
                      ) : item.status === "REJECTED" ? (
                        <Chip label="Không đạt (Dập nát/Mùi lạ)" size="small" className={styles.itemRejected} />
                      ) : (
                        <Chip label="Đang kiểm tra" size="small" className={styles.itemChecking} />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 7. Footer actions */}
      <Box className={styles.footerActions}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={onBack}
          variant="outlined"
          className={styles.backBtnBottom}
        >
          Quay lại danh sách phiếu giao nhận
        </Button>
      </Box>
    </Box>
  )
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirmAttendance: PropTypes.func,
}
