import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import IngredientOrderService from "src/services/IngredientOrderService";
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
  CircularProgress,
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
  Truck,
  Printer,
  Calendar,
  Users,
  Check,
  Layers,
  ChefHat,
} from "lucide-react";
import styles from "./DeliveryDetailView.module.scss";

// Helper format ngày theo chuẩn Việt Nam DD/MM/YYYY
const formatDateVN = (dateInput) => {
  if (!dateInput) return "";
  const str = String(dateInput).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return str;
};

// Helper gộp thông tin Tài xế & Phương tiện
const formatDriverVehicle = (driver, vehicle) => {
  const isDriverEmpty =
    !driver ||
    driver === "Chưa phân công (Chờ NCC điều xe)" ||
    driver === "Tài xế NCC" ||
    driver === "--";
  const isVehicleEmpty =
    !vehicle ||
    vehicle === "Chưa phân công (Chờ NCC điều xe)" ||
    vehicle === "Chưa có biển số xe" ||
    vehicle === "--";

  if (isDriverEmpty && isVehicleEmpty) {
    return "Chưa phân công (Chờ NCC điều xe)";
  }

  if (!isDriverEmpty && !isVehicleEmpty) {
    return `${driver} - ${vehicle}`;
  }

  if (!isDriverEmpty) {
    return `${driver} - Chờ gán xe`;
  }

  return `Chờ gán tài xế - ${vehicle}`;
};

// Helper format giờ HH:mm
const formatTimeStr = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (!isNaN(d.getTime())) {
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }
  } catch {
    // fallback
  }
  return "";
};

// Helper định dạng định lượng/suất: nếu đơn vị là kg thì quy đổi sang gam (g), tổng vẫn giữ kg
const formatPortionRate = (rate, unit) => {
  if (rate == null || isNaN(rate) || Number(rate) <= 0) return "";
  const u = String(unit || "").toLowerCase().trim();
  if (u === "kg" || u === "kilogram") {
    const grams = Number((Number(rate) * 1000).toFixed(2));
    return `${grams} g`;
  }
  return `${rate} ${unit}`;
};

export default function DeliveryDetailView({
  delivery: propDelivery,
  onBack,
  onConfirmAttendance,
}) {
  const [internalDelivery, setInternalDelivery] = useState(propDelivery);

  useEffect(() => {
    setInternalDelivery(propDelivery);
  }, [propDelivery]);

  useEffect(() => {
    if (
      internalDelivery?.id &&
      (!internalDelivery.items || internalDelivery.items.length === 0)
    ) {
      let isMounted = true;
      IngredientOrderService.getDeliveryDetail(
        internalDelivery.id,
        internalDelivery,
      ).then((res) => {
        if (isMounted && res && res.items && res.items.length > 0) {
          setInternalDelivery(res);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [internalDelivery?.id, internalDelivery?.items?.length]);

  const delivery = internalDelivery || propDelivery;

  const [attendanceInput, setAttendanceInput] = useState(
    delivery?.actualAttendance || 820,
  );

  useEffect(() => {
    if (delivery?.actualAttendance) {
      setAttendanceInput(delivery.actualAttendance);
    }
  }, [delivery?.actualAttendance]);
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
    // 1. Kiểm tra nếu có dữ liệu vận chuyển chi tiết của từng NCC trong đơn gộp
    const tMap = delivery.transportsBySupplier || {};
    const norm = String(sName || "").trim().toLowerCase();
    const supInfo =
      tMap[sName] ||
      tMap[norm] ||
      Object.entries(tMap).find(([k]) => {
        const kNorm = String(k).trim().toLowerCase();
        return kNorm === norm || norm.includes(kNorm) || kNorm.includes(norm);
      })?.[1] ||
      (Array.isArray(delivery.transportsList) ? delivery.transportsList[idx] : null);

    if (supInfo) {
      const hasSpecificDispatched =
        supInfo.hasDispatched ||
        Boolean(supInfo.vehicle && !supInfo.vehicle.includes("Chưa phân công")) ||
        supInfo.status === "IN_TRANSIT" ||
        supInfo.status === "ARRIVED" ||
        supInfo.status === "INSPECTING" ||
        supInfo.status === "RECEIVED" ||
        supInfo.status === "APPROVED" ||
        supInfo.status === "COMPLETED";

      const driverDisplay =
        supInfo.driver && supInfo.driver !== "Chưa phân công (Chờ NCC điều xe)"
          ? `${supInfo.driver}${supInfo.phone && supInfo.phone !== "--" && !supInfo.driver.includes("(") ? ` (${supInfo.phone})` : ""}`
          : hasSpecificDispatched
            ? "Tài xế NCC"
            : "Chưa phân công (Chờ NCC điều xe)";

      return {
        driver: driverDisplay,
        phone: supInfo.phone || "--",
        vehicle:
          supInfo.vehicle ||
          (hasSpecificDispatched ? "Xe giao hàng NCC" : "Chưa phân công (Chờ NCC điều xe)"),
        expectedTime: supInfo.expectedTime || "Chờ NCC cập nhật",
        qrCode:
          supInfo.qrCode ||
          `QR-PENDING-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
      };
    }

    const hasDispatched =
      delivery.status === "IN_TRANSIT" ||
      delivery.status === "ARRIVED" ||
      delivery.status === "INSPECTING" ||
      delivery.status === "RECEIVED" ||
      delivery.status === "APPROVED" ||
      delivery.status === "COMPLETED";

    if (!hasDispatched && !delivery.vehiclePlate) {
      return {
        driver:
          delivery.driverName &&
          delivery.driverName !== "Chưa phân công (Chờ NCC điều xe)"
            ? `${delivery.driverName}${delivery.driverPhone ? ` (${delivery.driverPhone})` : ""}`
            : "Chưa phân công (Chờ NCC điều xe)",
        phone: delivery.driverPhone || delivery.phone || "--",
        vehicle: delivery.vehiclePlate || "Chưa phân công (Chờ NCC điều xe)",
        expectedTime: delivery.expectedArrivalAt
          ? `${formatTimeStr(delivery.expectedArrivalAt)} — Ngày ${formatDateVN(delivery.expectedArrivalAt)}`
          : "Chờ NCC cập nhật",
        qrCode: `QR-PENDING-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
      };
    }

    return {
      driver:
        delivery.driverName &&
        delivery.driverName !== "Chưa phân công (Chờ NCC điều xe)"
          ? `${delivery.driverName}${delivery.driverPhone ? ` (${delivery.driverPhone})` : ""}`
          : "Tài xế NCC",
      phone: delivery.driverPhone || delivery.phone || "--",
      vehicle: delivery.vehiclePlate || "Chưa có biển số xe",
      expectedTime: delivery.expectedArrivalAt
        ? `${formatTimeStr(delivery.expectedArrivalAt)} — Ngày ${formatDateVN(delivery.expectedArrivalAt)}`
        : delivery.deliveryTime
          ? `${delivery.deliveryTime} — Ngày ${formatDateVN(delivery.deliveryDate)}`
          : "Chờ NCC cập nhật",
      qrCode:
        delivery.deliveryQr ||
        `QR-LOT-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
    };
  };

  const displayNote = useMemo(() => {
    const raw = String(delivery?.note || delivery?.menuName || "").trim();
    const cleaned = raw
      .replace(/^Lịch hẹn giao:[^.\n]*?(\.|\n|$)\s*/i, "")
      .trim();
    return cleaned || "Không có ghi chú thêm";
  }, [delivery?.note, delivery?.menuName]);

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

  const getRolesForSupplier = (sName) => {
    const sMap = delivery.supplierApprovals || {};
    const norm = String(sName || "").trim().toLowerCase();
    const matchedApp =
      sMap[sName] ||
      sMap[norm] ||
      Object.entries(sMap).find(([k]) => {
        const kNorm = String(k).trim().toLowerCase();
        return kNorm === norm || norm.includes(kNorm) || kNorm.includes(norm);
      })?.[1];

    const sApp = matchedApp || delivery.approvals || {};
    return [
      {
        key: "ingredientManagement",
        title: "1. Ban QL Nguyên liệu",
        icon: <ShieldCheck size={16} />,
        data: sApp.ingredientManagement,
      },
      {
        key: "healthOfficer",
        title: "2. Y tế học đường",
        icon: <Stethoscope size={16} />,
        data: sApp.healthOfficer,
      },
      {
        key: "parentsCommittee",
        title: "3. Ban Phụ huynh",
        icon: <HeartHandshake size={16} />,
        data: sApp.parentsCommittee,
      },
      {
        key: "kitchenStaff",
        title: "4. Đại diện Nhà Bếp",
        icon: <Utensils size={16} />,
        data: sApp.kitchenStaff,
      },
    ];
  };

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
                Mã nhập hàng: {delivery.deliveryNo}
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
                startIcon={
                  updating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : null
                }
              >
                {updating
                  ? "Đang cập nhật..."
                  : "Chốt số lượng & Báo NCC giao Đợt 2"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {Boolean(
        isBatch2 &&
          !isWaitingAttendance &&
          Number(delivery.actualAttendance) > 0,
      ) && (
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

      {/* 4. Khối Thông tin Chuyến giao & Xe của từng Nhà cung cấp (Mỗi NCC là 1 hàng độc lập) */}
      <Box className={styles.sectionWrapper}>
        <Box className={styles.sectionTitleRow}>
          <Typography variant="h6" className={styles.sectionHeading}>
            Thông Tin Vận Chuyển &amp; Nghiệm Thu Từng Xe (
            {Object.keys(itemsBySupplier).length} Nhà cung cấp)
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
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
                  gap: 2,
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                }}
              >
                {/* Header NCC & Badge Xe */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Truck size={20} color="#2563eb" />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 750,
                        color: "#0f172a",
                        fontSize: "1rem",
                      }}
                    >
                      {idx + 1}. {sName}
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
                    <Box className={styles.infoItem}>
                      <Truck size={16} className={styles.infoIcon} />
                      <Typography
                        variant="body2"
                        className={styles.infoLabel}
                        sx={{ minWidth: { sm: 165 }, flexShrink: 0 }}
                      >
                        Tài xế &amp; Phương tiện:
                      </Typography>
                      <Typography variant="body2" className={styles.infoValue}>
                        {formatDriverVehicle(transport.driver, transport.vehicle)}
                      </Typography>
                    </Box>

                    <Box className={styles.infoItem}>
                      <Calendar size={16} className={styles.infoIcon} />
                      <Typography
                        variant="body2"
                        className={styles.infoLabel}
                        sx={{ minWidth: { sm: 165 }, flexShrink: 0 }}
                      >
                        Thời gian dự kiến:
                      </Typography>
                      <Typography variant="body2" className={styles.infoValue}>
                        {transport.expectedTime}
                      </Typography>
                    </Box>

                    <Box className={styles.infoItem}>
                      <Clock size={16} className={styles.infoIcon} />
                      <Typography
                        variant="body2"
                        className={styles.infoLabel}
                        sx={{ minWidth: { sm: 165 }, flexShrink: 0 }}
                      >
                        Ghi chú:
                      </Typography>
                      <Typography variant="body2" className={styles.infoValue}>
                        {displayNote}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Cột 2: Mã QR Lô Hàng / Chuyến xe của NCC */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.75,
                      p: 1.75,
                      bgcolor: "#f0fdf4",
                      borderRadius: 2.5,
                      border: "1px solid #bbf7d0",
                      minWidth: { xs: "auto", sm: 280, md: 300 },
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      flexShrink: 0,
                    }}
                  >
                    <QrCode size={40} color="#16a34a" style={{ flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#166534",
                          display: "block",
                          fontSize: "0.825rem",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {transport.qrCode}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "#15803d", fontSize: "0.72rem", display: "block", mt: 0.25 }}
                      >
                        Mã QR niêm phong xe &amp; kiểm dịch NCC
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider className={styles.cardDivider} />

                {/* Hội đồng nghiệm thu 4 bên riêng cho chuyến xe này (4 cột dàn đều ngang hàng) */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 750,
                        color: "#0f172a",
                        fontSize: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      <ShieldCheck size={17} color="#2563eb" />
                      Hội đồng nghiệm thu 4 bên tại cổng trường (Xe {idx + 1}):
                    </Typography>
                    <Chip
                      label="Cổng tiếp nhận"
                      size="small"
                      sx={{
                        fontSize: "0.7rem",
                        height: 22,
                        bgcolor: "#f1f5f9",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                      },
                      gap: 1.25,
                    }}
                  >
                    {getRolesForSupplier(sName).map((r) => {
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
                          sx={{ p: 1.25, borderRadius: 2 }}
                        >
                          <Box className={styles.cardTop} sx={{ mb: 0.5 }}>
                            <Box className={styles.roleTitleGroup} sx={{ gap: 0.6 }}>
                              {r.icon}
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.78rem",
                                  lineHeight: 1.2,
                                }}
                              >
                                {r.title}
                              </Typography>
                            </Box>

                            {isApproved && (
                              <CheckCircle2 size={16} className={styles.checkIcon} />
                            )}
                            {isRejected && (
                              <XCircle size={16} className={styles.rejectIcon} />
                            )}
                            {isPending && (
                              <Clock size={16} className={styles.clockIcon} />
                            )}
                          </Box>

                          <Divider sx={{ my: 0.5 }} />

                          <Box className={styles.cardBottom}>
                            {isApproved && (
                              <>
                                <Typography
                                  variant="caption"
                                  className={styles.signerName}
                                  sx={{ fontSize: "0.74rem", fontWeight: 600, display: "block" }}
                                >
                                  {data?.name || "Đại diện đã ký"}
                                </Typography>
                                {data?.time && (
                                  <Typography
                                    variant="caption"
                                    className={styles.signTime}
                                    sx={{ fontSize: "0.68rem" }}
                                  >
                                    Ký lúc: {data.time}
                                  </Typography>
                                )}
                              </>
                            )}
                            {isRejected && (
                              <Typography
                                variant="caption"
                                className={styles.rejectSignText}
                                sx={{ fontSize: "0.74rem", fontWeight: 700 }}
                              >
                                {data?.name || "TỪ CHỐI NHẬP HÀNG"}
                              </Typography>
                            )}
                            {isPending && (
                              <Typography
                                variant="caption"
                                className={styles.pendingSignText}
                                sx={{ fontSize: "0.72rem" }}
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
              </Paper>
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
                <TableCell align="right">Số lượng đặt</TableCell>
                <TableCell align="left">Đơn vị</TableCell>
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
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          className={styles.orderedQty}
                        >
                          {displayedOrderedQty}
                        </Typography>
                        {isMulti && (
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
                        )}
                      </TableCell>
                      <TableCell align="left">
                        <Typography variant="body2">{item.unit}</Typography>
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
                          colSpan={5}
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
                                    {b.portions} suất ×{" "}
                                    {formatPortionRate(
                                      b.qtyPerPortion,
                                      b.unit || item.unit,
                                    )}
                                    /suất
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      color: "#2563eb",
                                      mt: 0.5,
                                    }}
                                  >
                                    = {b.calculatedQty} {b.unit || item.unit}
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
