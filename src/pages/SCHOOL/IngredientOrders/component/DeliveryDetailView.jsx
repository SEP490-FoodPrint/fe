import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
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
  Tooltip,
} from "@mui/material";
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
  Layers,
  ChefHat,
} from "lucide-react";
import styles from "./DeliveryDetailView.module.scss";

export default function DeliveryDetailView({
  delivery,
  onBack,
  onConfirmAttendance,
}) {
  const [attendanceInput, setAttendanceInput] = useState(
    delivery?.actualAttendance || 820,
  );
  const [updating, setUpdating] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpandItem = (idx) => {
    setExpandedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Danh sách các Nhà cung cấp duy nhất tham gia đợt giao này
  const uniqueSuppliers = useMemo(() => {
    const list = [];
    if (Array.isArray(delivery?.items)) {
      delivery.items.forEach((it) => {
        const supName = it.supplierName;
        if (supName && !list.includes(supName)) {
          list.push(supName);
        }
      });
    }
    if (
      list.length === 0 &&
      delivery?.supplierName &&
      !delivery.supplierName.includes("Nhiều NCC")
    ) {
      list.push(delivery.supplierName);
    }
    return list;
  }, [delivery]);

  // Phân nhóm nguyên liệu theo từng Nhà cung cấp để hiển thị chi tiết NCC giao gì
  const itemsBySupplier = useMemo(() => {
    const map = {};
    if (Array.isArray(delivery?.items)) {
      delivery.items.forEach((it) => {
        const supName =
          it.supplierName || delivery?.supplierName || "Nhà cung cấp đối tác";
        if (!map[supName]) {
          map[supName] = [];
        }
        map[supName].push(it);
      });
    }
    return map;
  }, [delivery]);

  // Lấy thông tin xe, tài xế & QR riêng cho từng Nhà cung cấp (Mỗi NCC 1 ô xe)
  const getSupplierTransportInfo = (sName, idx) => {
    const hasDispatched =
      delivery.status === "IN_TRANSIT" ||
      delivery.status === "ARRIVED" ||
      delivery.status === "INSPECTING" ||
      delivery.status === "RECEIVED" ||
      delivery.status === "APPROVED" ||
      delivery.status === "COMPLETED";

    if (!hasDispatched && !delivery.vehiclePlate) {
      return {
        driver: "Chưa phân công (Chờ NCC điều xe)",
        phone: "--",
        vehicle: "Chưa điều xe",
        temp: "Chưa đo (Chờ xe tới)",
        qrCode: `QR-PENDING-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
      };
    }

    return {
      driver: delivery.driverName || "Tài xế NCC",
      phone: delivery.driverPhone || delivery.phone || "--",
      vehicle: delivery.vehiclePlate || "Xe giao hàng",
      temp: delivery.refrigerationTemp || "--",
      qrCode:
        delivery.deliveryQr ||
        `QR-LOT-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
    };
  };

  if (!delivery) return null;

  const isBatch1 = delivery.batchType === "BATCH_1";
  const isBatch2 = delivery.batchType === "BATCH_2";
  const isWaitingAttendance = delivery.status === "WAITING_ATTENDANCE";
  const approvals = delivery.approvals || {};

  // Đếm số bên từ chối theo nguyên tắc nghiệm thu
  const rejectCount = Object.values(approvals).filter(
    (a) => a?.approved === false,
  ).length;
  const isCancelled = delivery.status === "CANCELLED" || rejectCount >= 2;
  const isRedeliver =
    (delivery.status === "RE_DELIVER" || delivery.status === "REJECTED") &&
    rejectCount === 1;

  const maxPortions = Number(delivery.maxPortions) || 0;
  const batch1Portions =
    Number(delivery.batch1Portions) || Math.floor(maxPortions / 2);
  const remainingNeeded = Math.max(0, attendanceInput - batch1Portions);
  const savedPortions = Math.max(0, maxPortions - attendanceInput);

  const handleConfirm = async () => {
    if (!onConfirmAttendance) return;
    setUpdating(true);
    try {
      await onConfirmAttendance(delivery.id, Number(attendanceInput));
    } finally {
      setUpdating(false);
    }
  };

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
  ];

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
                label={
                  isBatch1
                    ? "Đợt 1 (50% Suất tối đa)"
                    : "Đợt 2 (Theo sĩ số GVCN)"
                }
                size="small"
                className={isBatch1 ? styles.batch1Chip : styles.batch2Chip}
              />
              {delivery.targetScope && (
                <Chip
                  icon={<Layers size={13} />}
                  label={`Áp dụng: ${delivery.targetScope}`}
                  size="small"
                  sx={{
                    bgcolor: "#f1f5f9",
                    color: "#334155",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" className={styles.subTitle}>
              Đơn đặt hàng gốc: <strong>{delivery.orderNo}</strong>
              {delivery.menuName && ` • Thực đơn: ${delivery.menuName}`}
            </Typography>
            {Array.isArray(delivery.menusSummary) &&
              delivery.menusSummary.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  {delivery.menusSummary.map((ms) => (
                    <Chip
                      key={ms.id}
                      icon={<ChefHat size={13} />}
                      label={`${ms.targetScope || ms.name}: ${ms.batch1Portions || Math.floor((ms.maxPortions || 400) / 2)}/${ms.maxPortions || 400} suất`}
                      size="small"
                      sx={{
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                        fontWeight: 600,
                        fontSize: "0.725rem",
                        border: "1px solid #bfdbfe",
                      }}
                    />
                  ))}
                </Box>
              )}
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
            {delivery.rejectionReason ||
              "Theo quy chế nghiệm thu, từ 2 bên từ chối trở lên thì hủy toàn bộ đơn hàng. Đợt 1 đã bị hủy nên không thể triển khai Đợt 2."}
          </Typography>
        </Alert>
      )}

      {isRedeliver && (
        <Alert severity="warning" className={styles.redeliverAlert}>
          <Typography variant="subtitle2" className={styles.rejectTitle}>
            YÊU CẦU NCC GIAO LẠI LÔ HÀNG KHÁC (1 BÊN TỪ CHỐI):
          </Typography>
          <Typography variant="body2">
            {delivery.rejectionReason ||
              "Có 1 bên không đồng thuận nhận hàng. NCC phải thu hồi lô này và chuyển xe khác đạt chuẩn trước giờ chế biến."}
          </Typography>
        </Alert>
      )}

      {/* 3. KHỐI CHỐT SĨ SỐ ĐỢT 2 (Dành cho phiếu Đợt 2) */}
      {isBatch2 && isWaitingAttendance && (
        <Paper className={styles.attendanceCard} elevation={0}>
          <Box className={styles.attendanceHeader}>
            <Users size={22} className={styles.attendanceIcon} />
            <Box>
              <Typography
                variant="subtitle1"
                className={styles.attendanceTitle}
              >
                Điểm Danh & Chốt Sĩ Số Đợt 2 Từ GVCN
              </Typography>
              <Typography variant="body2" className={styles.attendanceSubtitle}>
                Dựa trên sĩ số điểm danh học sinh sáng nay do GVCN báo lên, hệ
                thống sẽ tính lại số suất ăn Đợt 2 cần giao để sát thực tế nhất,
                tránh lãng phí thức ăn.
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
                onChange={(e) =>
                  setAttendanceInput(
                    Math.max(batch1Portions, Number(e.target.value)),
                  )
                }
                helperText={`Tối thiểu phải bằng số suất Đợt 1 (${batch1Portions} suất) đã nhận.`}
                className={styles.attendanceInputField}
              />

              <Box className={styles.calcResultBox}>
                <Typography variant="body2" className={styles.calcResultText}>
                  Số suất Đợt 2 cần bổ sung:{" "}
                  <strong>{remainingNeeded} suất</strong>
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
                {updating
                  ? "Đang cập nhật..."
                  : "Chốt số lượng & Báo NCC giao Đợt 2"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {isBatch2 && !isWaitingAttendance && delivery.actualAttendance && (
        <Alert
          severity="success"
          icon={<CheckCircle2 size={18} />}
          className={styles.confirmedAlert}
        >
          GVCN đã chốt sĩ số sáng:{" "}
          <strong>
            {delivery.actualAttendance} / {delivery.maxPortions} học sinh
          </strong>
          . Đợt 2 đã giao bù <strong>{delivery.plannedPortions} suất</strong>{" "}
          (Tiết kiệm {delivery.maxPortions - delivery.actualAttendance} suất ăn
          so với định mức tối đa).
        </Alert>
      )}

      {/* 4. Khối Thông tin Chuyến giao & Xe của từng Nhà cung cấp (Mỗi NCC hiện 1 ô) */}
      <Box className={styles.sectionWrapper}>
        <Box className={styles.sectionTitleRow}>
          <Typography variant="h6" className={styles.sectionHeading}>
            Thông Tin Vận Chuyển &amp; Xe Giao Hàng (
            {Object.keys(itemsBySupplier).length} Nhà cung cấp)
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              Object.keys(itemsBySupplier).length === 1
                ? "1fr"
                : "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 2,
          }}
        >
          {Object.entries(itemsBySupplier).map(([sName, sItems], idx) => {
            const transport = getSupplierTransportInfo(sName, idx);
            return (
              <Paper
                key={idx}
                className={styles.infoCard}
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  p: 2.2,
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Truck size={18} color="#2563eb" />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 750,
                        color: "#0f172a",
                        fontSize: "0.95rem",
                      }}
                    >
                      {idx + 1}. {sName}
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

                <Box className={styles.infoItem}>
                  <Users size={16} className={styles.infoIcon} />
                  <Typography variant="body2" className={styles.infoLabel}>
                    Tài xế &amp; Phương tiện:
                  </Typography>
                  <Typography variant="body2" className={styles.infoValue}>
                    {transport.driver}
                  </Typography>
                </Box>

                <Box className={styles.infoItem}>
                  <Thermometer size={16} className={styles.infoIcon} />
                  <Typography variant="body2" className={styles.infoLabel}>
                    Nhiệt độ thùng xe:
                  </Typography>
                  <Typography
                    variant="body2"
                    className={
                      delivery.status === "REJECTED"
                        ? styles.tempDanger
                        : styles.infoValue
                    }
                  >
                    {transport.temp}
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

                {/* Mã QR Lô Hàng / Chuyến xe của NCC */}
                <Box
                  sx={{
                    mt: "auto",
                    pt: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.2,
                    bgcolor: "#f0fdf4",
                    borderRadius: 2,
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <QrCode size={34} color="#16a34a" />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: "#166534",
                        display: "block",
                        fontSize: "0.8rem",
                      }}
                    >
                      {transport.qrCode}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#15803d", fontSize: "0.7rem" }}
                    >
                      Mã QR niêm phong xe &amp; kiểm dịch NCC
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* 5. HỘI ĐỒNG KIỂM TRA 4 BÊN TẠI CỔNG TRƯỜNG */}
      <Box className={styles.sectionWrapper}>
        <Box className={styles.sectionTitleRow}>
          <Typography variant="h6" className={styles.sectionHeading}>
            Hội Đồng Nghiệm Thu 4 Bên Tại Cổng Trường
          </Typography>
        </Box>

        <Box className={styles.approvalsGrid}>
          {roles.map((r) => {
            const data = r.data;
            const isApproved = data?.approved === true;
            const isRejected = data?.approved === false;
            const isPending =
              data?.approved === null || data?.approved === undefined;

            return (
              <Box
                key={r.key}
                className={`${styles.approvalCard} ${
                  isApproved
                    ? styles.approvedCard
                    : isRejected
                      ? styles.rejectedCard
                      : styles.pendingCard
                }`}
              >
                <Box className={styles.cardTop}>
                  <Box className={styles.roleTitleGroup}>
                    {r.icon}
                    <Typography
                      variant="subtitle2"
                      className={styles.roleTitle}
                    >
                      {r.title}
                    </Typography>
                  </Box>

                  {isApproved && (
                    <CheckCircle2 size={20} className={styles.checkIcon} />
                  )}
                  {isRejected && (
                    <XCircle size={20} className={styles.rejectIcon} />
                  )}
                  {isPending && (
                    <Clock size={20} className={styles.clockIcon} />
                  )}
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
                        <Typography
                          variant="caption"
                          className={styles.signTime}
                        >
                          Ký lúc: {data.time}
                        </Typography>
                      )}
                    </>
                  )}
                  {isRejected && (
                    <Typography
                      variant="body2"
                      className={styles.rejectSignText}
                    >
                      {data?.name || "TỪ CHỐI NHẬP HÀNG"}
                    </Typography>
                  )}
                  {isPending && (
                    <Typography
                      variant="caption"
                      className={styles.pendingSignText}
                    >
                      Đang chờ đại diện kiểm tra...
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 6. BẢNG CHI TIẾT NGUYÊN LIỆU ĐỢT GIAO */}
      <Box className={styles.sectionWrapper}>
        <Typography variant="h6" className={styles.sectionHeading}>
          Chi Tiết Mặt Hàng Thực Giao Trong Đợt Này
        </Typography>

        <TableContainer
          component={Paper}
          elevation={0}
          className={styles.tableWrapper}
        >
          <Table size="small" className={styles.itemsTable}>
            <TableHead>
              <TableRow className={styles.tableHeaderRow}>
                <TableCell style={{ minWidth: 160 }}>Tên nguyên liệu</TableCell>
                <TableCell style={{ minWidth: 200 }}>
                  Nhà cung cấp (NCC)
                </TableCell>
                <TableCell>Phân loại kho</TableCell>
                <TableCell align="center">Đơn vị</TableCell>
                <TableCell align="right">Số lượng đặt</TableCell>
                <TableCell align="center">
                  Đánh giá cảm quan &amp; ATTP
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {delivery.items?.map((item, idx) => {
                const isDiscrete = [
                  "quả",
                  "trứng",
                  "hộp",
                  "gói",
                  "chai",
                  "can",
                  "lon",
                  "hũ",
                  "cái",
                  "củ",
                  "bắp",
                  "ổ",
                  "bó",
                  "túi",
                  "con",
                ].includes(
                  String(item.unit || "")
                    .toLowerCase()
                    .trim(),
                );
                const isExtraItem =
                  item.isExtraItem === true || item.isExtra === true;
                const hasExtraQty =
                  typeof item.extraQty === "number" && item.extraQty > 0;
                const portionRate =
                  !isExtraItem &&
                  typeof item.qtyPerPortion === "number" &&
                  item.qtyPerPortion > 0
                    ? item.qtyPerPortion
                    : !isExtraItem
                      ? Number(
                          (
                            (item.orderedQty || 0) /
                            (delivery.plannedPortions || batch1Portions || 1)
                          ).toFixed(4),
                        )
                      : 0;

                const rawNeeded = portionRate * remainingNeeded;
                const displayedOrderedQty =
                  isWaitingAttendance && !isExtraItem
                    ? isDiscrete
                      ? Math.ceil(rawNeeded + (item.extraQty || 0))
                      : Number((rawNeeded + (item.extraQty || 0)).toFixed(2))
                    : isDiscrete && typeof item.orderedQty === "number"
                      ? Math.ceil(item.orderedQty)
                      : item.orderedQty;

                const isMulti = Boolean(
                  item.breakdown && item.breakdown.length > 1,
                );
                const isExpanded = Boolean(expandedItems[idx]);

                return (
                  <React.Fragment key={idx}>
                    <TableRow hover className={styles.tableRow}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            className={styles.ingName}
                          >
                            {item.ingredientName}
                          </Typography>
                          {isMulti && (
                            <Tooltip
                              title="Nguyên liệu dùng chung cho nhiều thực đơn - Bấm để xem phân rã chi tiết"
                              arrow
                            >
                              <Chip
                                icon={<Layers size={12} />}
                                label={`${item.breakdown.length} thực đơn`}
                                size="small"
                                onClick={() => toggleExpandItem(idx)}
                                sx={{
                                  cursor: "pointer",
                                  bgcolor: "#eff6ff",
                                  color: "#1d4ed8",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  height: 22,
                                  border: "1px solid #bfdbfe",
                                  "&:hover": { bgcolor: "#dbeafe" },
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1e293b",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {item.supplierName ||
                            delivery.supplierName ||
                            "Nhà cung cấp đối tác"}
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
                        <Typography variant="body2">{item.unit}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          className={styles.orderedQty}
                        >
                          {displayedOrderedQty} {item.unit}
                        </Typography>
                        {isMulti ? (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => toggleExpandItem(idx)}
                            sx={{
                              fontSize: "0.6875rem",
                              p: 0,
                              minWidth: 0,
                              textTransform: "none",
                              color: "#2563eb",
                              display: "block",
                              ml: "auto",
                            }}
                          >
                            {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                          </Button>
                        ) : hasExtraQty && !isExtraItem ? (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#15803d",
                              display: "block",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                            }}
                          >
                            (Gồm {item.standardQty} theo suất + {item.extraQty}{" "}
                            giao thêm)
                          </Typography>
                        ) : portionRate > 0 && !isExtraItem && !hasExtraQty ? (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              display: "block",
                              fontSize: "0.7rem",
                            }}
                          >
                            ({portionRate} {item.unit}/suất)
                          </Typography>
                        ) : null}
                        {isWaitingAttendance && !isExtraItem && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#d97706",
                              display: "block",
                              fontSize: "0.7rem",
                            }}
                          >
                            (Theo {remainingNeeded} suất)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.status === "ACCEPTED" ? (
                          <Chip
                            label="Đạt chuẩn tươi ngon"
                            size="small"
                            className={styles.itemAccepted}
                          />
                        ) : item.status === "REJECTED" ? (
                          <Chip
                            label="Không đạt (Dập nát/Mùi lạ)"
                            size="small"
                            className={styles.itemRejected}
                          />
                        ) : (
                          <Chip
                            label="Đang kiểm tra"
                            size="small"
                            className={styles.itemChecking}
                          />
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Dòng mở rộng chi tiết phân rã cho nguyên liệu đa thực đơn */}
                    {isExpanded && isMulti && (
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell
                          colSpan={6}
                          sx={{
                            py: 1.25,
                            px: 3,
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "#ffffff",
                              borderRadius: 1.5,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: "#1e293b",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                mb: 1,
                              }}
                            >
                              <Layers size={14} color="#2563eb" /> Chi tiết định
                              lượng &amp; số lượng theo từng thực đơn / khối
                              lớp:
                            </Typography>
                            <Box
                              sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                            >
                              {item.breakdown.map((b, bIdx) => (
                                <Box
                                  key={bIdx}
                                  sx={{
                                    bgcolor: "#f8fafc",
                                    p: 1,
                                    px: 1.5,
                                    borderRadius: 1.25,
                                    border: "1px solid #e2e8f0",
                                    minWidth: 200,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {b.targetScope || b.menuName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: "block", mt: 0.25 }}
                                  >
                                    {b.portions} suất × {b.qtyPerPortion}{" "}
                                    {b.unit}/suất
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      color: "#2563eb",
                                      mt: 0.5,
                                    }}
                                  >
                                    = {b.calculatedQty} {b.unit}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
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
  );
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirmAttendance: PropTypes.func,
};
