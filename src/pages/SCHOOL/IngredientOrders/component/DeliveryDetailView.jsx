import React from "react"
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
} from "lucide-react"
import styles from "./DeliveryDetailView.module.scss"

export default function DeliveryDetailView({ delivery, onBack }) {
  if (!delivery) return null

  const isBatch1 = delivery.batchType === "BATCH_1"
  const approvals = delivery.approvals || {}

  const roles = [
    {
      key: "ingredientManagement",
      title: "1. Ban QL Nguyên liệu",
      icon: <ShieldCheck size={20} />,
      data: approvals.ingredientManagement,
      roleDuty: "Đối chiếu số lượng & hợp đồng",
    },
    {
      key: "healthOfficer",
      title: "2. Y tế học đường",
      icon: <Stethoscope size={20} />,
      data: approvals.healthOfficer,
      roleDuty: "Kiểm tra ATTP, nhiệt độ & kiểm dịch",
    },
    {
      key: "parentsCommittee",
      title: "3. Đại diện Ban Phụ huynh",
      icon: <HeartHandshake size={20} />,
      data: approvals.parentsCommittee,
      roleDuty: "Giám sát độc lập & cảm quan",
    },
    {
      key: "kitchenStaff",
      title: "4. Đại diện Nhà Bếp",
      icon: <Utensils size={20} />,
      data: approvals.kitchenStaff,
      roleDuty: "Nhận bàn giao sơ chế & nấu",
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
              Đơn đặt hàng gốc: <strong>{delivery.orderNo}</strong> | Thực đơn: <strong>{delivery.menuName}</strong>
            </Typography>
          </Box>
        </Box>

        <Box className={styles.navRight}>
          <Button
            variant="outlined"
            startIcon={<Printer size={16} />}
            className={styles.printBtn}
          >
            In biên bản nghiệm thu
          </Button>
        </Box>
      </Box>

      {/* 2. Cảnh báo Từ chối (nếu có 1/4 bên từ chối) */}
      {delivery.status === "REJECTED" && (
        <Alert severity="error" className={styles.rejectAlert}>
          <Typography variant="subtitle2" className={styles.rejectTitle}>
            LÔ HÀNG BỊ TỪ CHỐI NHẬP (QUY TẮC 1 TRONG 4 BÊN TỪ CHỐI):
          </Typography>
          <Typography variant="body2">{delivery.rejectionReason}</Typography>
        </Alert>
      )}

      {/* 3. Khối Thông tin Chuyến giao & Mã QR Lô Hàng */}
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

      {/* 4. HỘI ĐỒNG KIỂM TRA 4 BÊN TẠI CỔNG TRƯỜNG */}
      <Box className={styles.sectionWrapper}>
        <Box className={styles.sectionTitleRow}>
          <Typography variant="h6" className={styles.sectionHeading}>
            Hội Đồng Nghiệm Thu 4 Bên Tại Cổng Trường
          </Typography>
          <Chip
            label="Nguyên tắc Đồng thuận 4/4 (1 bên từ chối = Đổi hàng)"
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

      {/* 5. BẢNG CHI TIẾT NGUYÊN LIỆU ĐỢT GIAO */}
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
              {delivery.items?.map((item, idx) => (
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
                      {item.orderedQty} {item.unit}
                    </Typography>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 6. Footer actions */}
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
}
