import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import IngredientOrderService from "src/services/IngredientOrderService";
import notice from "src/components/Notice";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
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
  Maximize2,
  Copy,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ROUTER from "src/router/ROUTER";
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

// Helper format thông tin Phương tiện vận chuyển
const formatVehicle = (vehicle) => {
  if (
    !vehicle ||
    vehicle === "Chưa phân công (Chờ NCC điều xe)" ||
    vehicle === "Chưa có biển số xe" ||
    vehicle === "--" ||
    vehicle.includes("Chờ")
  ) {
    return "Chưa phân công (Chờ NCC điều xe)";
  }
  return vehicle;
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
  const navigate = useNavigate();

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

  // State cho Popup Modal hiển thị nhãn QR dán bao bì nguyên liệu (giống NCC)
  const [itemQrModalOpen, setItemQrModalOpen] = useState(false);
  const [focusedItemId, setFocusedItemId] = useState(null);
  const [showAllLabels, setShowAllLabels] = useState(true);
  const [copiedLabelId, setCopiedLabelId] = useState("");

  const handleOpenItemQrModal = (item) => {
    const targetId = item?.id || item?.ingredientId || item?.name || null;
    setFocusedItemId(targetId);
    setShowAllLabels(false);
    setItemQrModalOpen(true);
    setCopiedLabelId("");
  };

  const handleCloseItemQrModal = () => {
    setItemQrModalOpen(false);
    setFocusedItemId(null);
    setCopiedLabelId("");
  };

  const handleCopyTraceUrl = async (labelId, url) => {
    if (!url) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedLabelId(labelId);
      notice({ msg: "Đã sao chép liên kết", isSuccess: true });
      setTimeout(() => setCopiedLabelId(""), 2000);
    } catch {
      // fallback
    }
  };

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

  // Lấy chính xác tên NCC cho từng dòng nguyên liệu trong bảng chi tiết
  const getItemSupplierName = (item) => {
    // 1. Tên NCC trực tiếp trên dòng nếu là tên hợp lệ (không phải tên chung chung)
    if (
      item?.supplierName &&
      item.supplierName !== "Nhà cung cấp đối tác" &&
      !item.supplierName.includes("Nhiều NCC")
    ) {
      return item.supplierName;
    }

    // 2. Tra cứu trong nhóm nguyên liệu itemsBySupplier của từng NCC
    if (itemsBySupplier) {
      for (const [sName, sItems] of Object.entries(itemsBySupplier)) {
        if (sName && sName !== "Nhà cung cấp đối tác" && !sName.includes("Nhiều NCC")) {
          const matched = sItems.some((si) => {
            if (si.id && item.id && si.id === item.id) return true;
            if (si.ingredientId && item.ingredientId && si.ingredientId === item.ingredientId) return true;
            const n1 = (si.name || si.ingredientName || "").trim().toLowerCase();
            const n2 = (item.name || item.ingredientName || "").trim().toLowerCase();
            return n1 && n2 && n1 === n2;
          });
          if (matched) return sName;
        }
      }
    }

    // 3. Khớp theo supplierId với danh sách xe transportsBySupplier
    if (item?.supplierId && delivery?.transportsBySupplier) {
      for (const [sName, tInfo] of Object.entries(delivery.transportsBySupplier)) {
        if (String(tInfo?.supplierId) === String(item.supplierId) && sName && sName !== "Nhà cung cấp đối tác") {
          return sName;
        }
      }
    }

    // 4. Nếu đơn hàng chỉ có 1 NCC duy nhất
    if (
      Array.isArray(delivery?.suppliers) &&
      delivery.suppliers.length === 1 &&
      delivery.suppliers[0] &&
      delivery.suppliers[0] !== "Nhà cung cấp đối tác"
    ) {
      return delivery.suppliers[0];
    }

    // 5. Nếu tên NCC chính của phiếu là tên cụ thể
    if (
      delivery?.supplierName &&
      !delivery.supplierName.includes("Nhiều NCC") &&
      delivery.supplierName !== "Nhà cung cấp đối tác"
    ) {
      return delivery.supplierName;
    }

    if (item?.Supplier?.name) return item.Supplier.name;
    if (item?.supplier?.name) return item.supplier.name;
    if (delivery?.Supplier?.name) return delivery.Supplier.name;

    return item?.supplierName || delivery?.supplierName || "Nhà cung cấp đối tác";
  };

  // Lấy thông tin phương tiện & QR riêng cho từng Nhà cung cấp (Mỗi NCC 1 ô xe)
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

      return {
        vehicle:
          supInfo.vehicle ||
          (hasSpecificDispatched ? "Xe giao hàng NCC" : "Chưa phân công (Chờ NCC điều xe)"),
        expectedTime: supInfo.expectedTime || "Chờ NCC cập nhật",
        qrCode:
          supInfo.qrCode ||
          `QR-PENDING-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
        note: supInfo.note || "",
        status: supInfo.status || delivery.status || "CREATED",
      };
    }

    const hasDispatched =
      delivery.status === "IN_TRANSIT" ||
      delivery.status === "ARRIVED" ||
      delivery.status === "INSPECTING" ||
      delivery.status === "RECEIVED" ||
      delivery.status === "APPROVED" ||
      delivery.status === "COMPLETED";

    const hasSpecificPlate = Boolean(
      delivery.vehiclePlate &&
      !delivery.vehiclePlate.includes("Chưa") &&
      !delivery.vehiclePlate.includes("Chờ")
    );

    if (!hasDispatched && !hasSpecificPlate) {
      return {
        vehicle: "Chưa phân công (Chờ NCC điều xe)",
        expectedTime: delivery.expectedArrivalAt
          ? `${formatTimeStr(delivery.expectedArrivalAt)} — Ngày ${formatDateVN(delivery.expectedArrivalAt)}`
          : "Chờ NCC cập nhật",
        qrCode: `QR-PENDING-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
        status: delivery.status || "CREATED",
      };
    }

    return {
      vehicle: delivery.vehiclePlate || "Chưa phân công (Chờ NCC điều xe)",
      expectedTime: delivery.expectedArrivalAt
        ? `${formatTimeStr(delivery.expectedArrivalAt)} — Ngày ${formatDateVN(delivery.expectedArrivalAt)}`
        : delivery.deliveryTime
          ? `${delivery.deliveryTime} — Ngày ${formatDateVN(delivery.deliveryDate)}`
          : "Chờ NCC cập nhật",
      qrCode:
        delivery.deliveryQr ||
        `QR-LOT-${delivery.deliveryNo || "DEL"}-0${idx + 1}`,
      status: delivery.status || "IN_TRANSIT",
    };
  };

  // Render badge trạng thái riêng của từng Nhà cung cấp trong đợt giao đồ tươi
  const renderSupplierStatusBadge = (status) => {
    const raw = String(status || "").toUpperCase();
    if (
      raw === "CREATED" ||
      raw === "PENDING" ||
      raw === "SENT" ||
      raw === "DRAFT" ||
      raw === "IN_PROGRESS"
    ) {
      return (
        <Chip
          icon={<Clock size={13} />}
          label="Chờ NCC xác nhận"
          size="small"
          sx={{
            bgcolor: "#f1f5f9",
            color: "#475569",
            fontWeight: 600,
            fontSize: "0.75rem",
            border: "1px solid #cbd5e1",
          }}
        />
      );
    }

    switch (status) {
      case "CONFIRMED":
      case "ACCEPTED":
        return (
          <Chip
            icon={<CheckCircle2 size={13} />}
            label="NCC đã xác nhận"
            size="small"
            sx={{
              bgcolor: "#e0f2fe",
              color: "#0369a1",
              fontWeight: 600,
              fontSize: "0.75rem",
              border: "1px solid #bae6fd",
            }}
          />
        );
      case "IN_TRANSIT":
        return (
          <Chip
            icon={<Truck size={13} />}
            label="NCC đang vận chuyển"
            size="small"
            sx={{
              bgcolor: "#e0f2fe",
              color: "#0284c7",
              fontWeight: 600,
              fontSize: "0.75rem",
              border: "1px solid #b9e6fe",
            }}
          />
        );
      case "ARRIVED":
        return (
          <Chip
            icon={<Clock size={13} />}
            label="Đã đến cổng - Chờ kiểm tra"
            size="small"
            sx={{
              bgcolor: "#fef3c7",
              color: "#b45309",
              fontWeight: 600,
              fontSize: "0.75rem",
              border: "1px solid #fde68a",
            }}
          />
        );
      case "PENDING_APPROVAL":
      case "INSPECTING":
        return (
          <Chip
            icon={<Clock size={13} />}
            label="Đang kiểm tra 4 bên"
            size="small"
            sx={{
              bgcolor: "#fef3c7",
              color: "#b45309",
              fontWeight: 600,
              fontSize: "0.75rem",
              border: "1px solid #fde68a",
            }}
          />
        );
      case "APPROVED":
      case "COMPLETED":
        return (
          <Chip
            icon={<CheckCircle2 size={13} />}
            label="Đã duyệt & Bàn giao bếp"
            size="small"
            sx={{
              bgcolor: "#dcfce7",
              color: "#15803d",
              fontWeight: 600,
              fontSize: "0.75rem",
              border: "1px solid #bbf7d0",
            }}
          />
        );
      case "RECEIVED":
        return (
          <Chip
            icon={<CheckCircle2 size={13} />}
            label="Đã nhận hàng & Vào bếp"
            size="small"
            sx={{
              bgcolor: "#dcfce7",
              color: "#15803d",
              fontWeight: 600,
              fontSize: "0.75rem",
              border: "1px solid #bbf7d0",
            }}
          />
        );
      case "REJECTED":
        return (
          <Chip
            icon={<XCircle size={13} />}
            label="Bị từ chối"
            size="small"
            sx={{
              bgcolor: "#fee2e2",
              color: "#b91c1c",
              fontWeight: 600,
              fontSize: "0.75rem",
              border: "1px solid #fca5a5",
            }}
          />
        );
      case "CANCELLED":
        return (
          <Chip
            label="Đã hủy"
            size="small"
            sx={{
              bgcolor: "#f1f5f9",
              color: "#64748b",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        );
      default: {
        const norm = String(status || "").toUpperCase();
        const displayLabel =
          norm === "IN_PROGRESS" ||
            norm === "SENT" ||
            norm === "PENDING" ||
            norm === "CREATED" ||
            norm === "DRAFT" ||
            !status
            ? "Chờ NCC xác nhận"
            : status;
        return (
          <Chip
            label={displayLabel}
            size="small"
            sx={{
              bgcolor: "#f1f5f9",
              color: "#475569",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
        );
      }
    }
  };

  const displayNote = useMemo(() => {
    const raw = String(delivery?.note || delivery?.menuName || "").trim();
    const cleaned = raw
      .replace(/^Lịch hẹn giao:[^.\n]*?(\.|\n|$)\s*/i, "")
      .trim();
    return cleaned || "Không có ghi chú thêm";
  }, [delivery?.note, delivery?.menuName]);

  // Kiểm tra NCC đã bàn giao xe vận chuyển xong hay chưa
  const isItemVehicleDispatched = (item, idx) => {
    // 1. Nếu phiếu nhập ở trạng thái sơ khai (chờ chốt sĩ số, chờ xác nhận, nháp), tuyệt đối KHÔNG hiện QR
    const dStatus = String(delivery?.status || delivery?.rawStatus || "").toUpperCase();
    if (
      dStatus === "WAITING_ATTENDANCE" ||
      dStatus === "CREATED" ||
      dStatus === "PENDING" ||
      dStatus === "DRAFT" ||
      dStatus === "IN_PROGRESS" ||
      dStatus === "SENT"
    ) {
      return false;
    }

    const sName = getItemSupplierName(item);
    const transport = getSupplierTransportInfo(sName, idx);
    const sStatus = String(transport?.status || "").toUpperCase();

    if (
      sStatus === "CREATED" ||
      sStatus === "PENDING" ||
      sStatus === "DRAFT" ||
      sStatus === "IN_PROGRESS" ||
      sStatus === "SENT"
    ) {
      return false;
    }

    // 2. Chỉ hiện khi trạng thái thực sự là đang giao hoặc đã đến / đã kiểm tra / hoàn thành
    const validDispatchedStatuses = [
      "IN_TRANSIT",
      "ARRIVED",
      "INSPECTING",
      "PENDING_APPROVAL",
      "RECEIVED",
      "APPROVED",
      "COMPLETED",
    ];

    if (validDispatchedStatuses.includes(sStatus) || validDispatchedStatuses.includes(dStatus)) {
      return true;
    }

    // 3. Hoặc khi phương tiện đã được phân công biển số xe thực tế
    const transportVehicle = String(transport?.vehicle || "");
    const hasValidTransportVehicle =
      Boolean(transportVehicle) &&
      !transportVehicle.includes("Chưa") &&
      !transportVehicle.includes("Chờ");

    const deliveryVehicle = String(delivery?.vehiclePlate || "");
    const hasValidDeliveryVehicle =
      Boolean(deliveryVehicle) &&
      !deliveryVehicle.includes("Chưa") &&
      !deliveryVehicle.includes("Chờ");

    return hasValidTransportVehicle || hasValidDeliveryVehicle;
  };

  // Cấu trúc dữ liệu Nhãn QR dán bao bì cho từng dòng nguyên liệu (chuẩn hóa giống NCC)
  const getLabelDataForItem = (item, idx) => {
    const sName = getItemSupplierName(item);
    const idKey = item?.id || item?.ingredientId || `item-${idx + 1}`;
    const token =
      item?.qrToken ||
      item?.qrCode ||
      `TOKEN-${delivery?.deliveryNo || "DEL"}-${String(idKey).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}`;

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const traceUrl =
      item?.qrUrl ||
      item?.traceUrl ||
      `${origin}/api/public/delivery-items/${token}`;

    const facilityName =
      item?.sourceFacility?.name ||
      item?.sourceFacilityName ||
      item?.sourceFacilityNameSnapshot ||
      item?.facilityName ||
      "Cơ sở nguồn cung đạt chuẩn VietGAP";

    const facilityCode =
      item?.sourceFacility?.facilityCode ||
      item?.sourceFacilityCode ||
      item?.sourceFacilityCodeSnapshot ||
      "";

    const actualQty =
      item?.deliveredQty ??
      item?.actualQuantity ??
      item?.orderedQty ??
      item?.quantity ??
      0;

    return {
      deliveryItemId: idKey,
      deliveryNo: delivery?.deliveryNo || "DEL",
      supplierName: sName,
      ingredientName: item?.ingredientName || item?.name || "Nguyên liệu",
      actualQuantity: actualQty,
      unit: item?.unit || "kg",
      sourceFacility: {
        name: facilityName,
        facilityCode: facilityCode,
      },
      traceUrl,
      qrToken: token,
      qrImageDataUrl: item?.qrImageDataUrl || null,
    };
  };

  const allLabels = useMemo(() => {
    if (!Array.isArray(delivery?.items)) return [];
    return delivery.items.map((it, idx) => getLabelDataForItem(it, idx));
  }, [delivery?.items]);

  const visibleLabels = useMemo(() => {
    if (showAllLabels || !focusedItemId) return allLabels;
    const matched = allLabels.filter(
      (lb) =>
        lb.deliveryItemId === focusedItemId ||
        lb.ingredientName === focusedItemId ||
        String(lb.deliveryItemId) === String(focusedItemId),
    );
    return matched.length > 0 ? matched : allLabels;
  }, [allLabels, showAllLabels, focusedItemId]);

  if (!delivery) return null;

  const isBatch1 = delivery.batchType === "BATCH_1";
  const isBatch2 = delivery.batchType === "BATCH_2";
  const isWaitingAttendance = delivery.status === "WAITING_ATTENDANCE";
  const approvals = delivery.approvals || {};
  const isCancelled =
    delivery.status === "CANCELLED" || Boolean(delivery.cancellationNotice);
  const isRedeliver =
    delivery.status === "REJECTED" &&
    !isCancelled &&
    (delivery.redeliveryRequiredCount === null ||
      delivery.redeliveryRequiredCount === undefined ||
      delivery.redeliveryRequiredCount <= 2);

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
        {/* TASK-10 v8: kế hoạch mẻ, phần cắt/bù lưu mẫu và bước kho xác nhận lượng bổ sung của đợt */}
        {(isBatch1 || isBatch2) && delivery.deliveryDate && (
          <Button
            variant={isBatch2 ? "contained" : "outlined"}
            startIcon={<Layers size={16} />}
            onClick={() =>
              navigate(
                `${ROUTER.SCHOOL_SUPPLY_ROUND_PLAN}?date=${String(delivery.deliveryDate).slice(0, 10)}&batchNo=${isBatch2 ? 2 : 1}`,
              )
            }
          >
            {isBatch2 ? "Xác nhận lưu mẫu Đợt 2" : "Kế hoạch mẻ Đợt 1"}
          </Button>
        )}
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
            Thông Tin Vận Chuyển (
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
                    flexWrap: "wrap",
                    gap: 1.25,
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
                  <Box className={styles.infoItem}>
                    <Truck size={16} className={styles.infoIcon} />
                    <Typography
                      variant="body2"
                      className={styles.infoLabel}
                      sx={{ minWidth: { sm: 165 }, flexShrink: 0 }}
                    >
                      Phương tiện vận chuyển:
                    </Typography>
                    <Typography variant="body2" className={styles.infoValue}>
                      {formatVehicle(transport.vehicle)}
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
                      {formatVehicle(transport.vehicle) === "Chưa phân công (Chờ NCC điều xe)"
                        ? "Chưa có ghi chú"
                        : (transport.note || displayNote || "Chưa có ghi chú")}
                    </Typography>
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
                <TableCell align="right">Lưu mẫu</TableCell>
                <TableCell align="left">Đơn vị</TableCell>
                <TableCell align="center">
                  Đánh giá cảm quan &amp; ATTP
                </TableCell>
                <TableCell align="center" style={{ minWidth: 120 }}>
                  QR bao bì
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
                  "miếng",
                  "lát",
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
                          {getItemSupplierName(item)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          className={styles.orderedQty}
                        >
                          {displayedOrderedQty}
                        </Typography>
                        {(item.carryOverQuantity > 0 ||
                          item.sampleCompensationQuantity > 0) && (
                          <Typography
                            variant="caption"
                            sx={{ display: "block", color: "#64748b" }}
                          >
                            {[
                              item.carryOverQuantity > 0
                                ? `gồm bù làm tròn Đợt 1 ${item.carryOverQuantity} ${item.unit}`
                                : null,
                              item.sampleCompensationQuantity > 0
                                ? `bù lưu mẫu Đợt 1 ${item.sampleCompensationQuantity} ${item.unit}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Typography>
                        )}
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
                      <TableCell align="right">{item.sampleTopUpQuantity ?? "—"}</TableCell>
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

                      {/* Cột QR bao bì: chỉ hiển thị nút Xem QR khi NCC đã bàn giao xe vận chuyển */}
                      <TableCell align="center">
                        {isItemVehicleDispatched(item, idx) ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenItemQrModal(item)}
                            startIcon={<QrCode size={15} color="#059669" />}
                            sx={{
                              borderColor: "#cbd5e1",
                              bgcolor: "#ffffff",
                              color: "#059669",
                              textTransform: "none",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              borderRadius: 1.5,
                              py: 0.5,
                              px: 1.25,
                              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                              "&:hover": {
                                borderColor: "#059669",
                                bgcolor: "#f0fdf4",
                                color: "#047857",
                              },
                            }}
                          >
                            Xem QR
                          </Button>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                          >
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Dòng mở rộng chi tiết phân rã cho nguyên liệu đa thực đơn */}
                    {isExpanded && isMulti && (
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell
                          colSpan={7}
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

      {/* 8. Modal hiển thị Nhãn QR dán bao bì nguyên liệu (Giống NCC) */}
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
              Nhãn QR dán bao bì · {delivery.deliveryNo || ""}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseItemQrModal} size="small" sx={{ color: "#64748b" }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        {/* Thanh chuyển phạm vi xem: Đơn lẻ vs Toàn bộ */}
        {focusedItemId && allLabels.length > 1 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              px: 3,
              py: 1.25,
              bgcolor: "#ecfdf5",
              borderBottom: "1px solid #a7f3d0",
              flexShrink: 0,
            }}
          >
            <Typography variant="body2" sx={{ color: "#065f46", fontWeight: 600, fontSize: "0.85rem" }}>
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
                color: "#047857",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.78rem",
                borderRadius: 1.5,
                "&:hover": { bgcolor: "#f0fdf4", borderColor: "#059669" },
              }}
            >
              {showAllLabels ? "Chỉ xem dòng đã chọn" : `Hiển thị tất cả (${allLabels.length} nhãn)`}
            </Button>
          </Box>
        )}

        <DialogContent sx={{ p: 3, bgcolor: "#f8fafc", flex: 1, overflowY: "auto" }}>
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
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                  }}
                >
                  {/* Top card: Mã đơn + NCC */}
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
                      label={label.deliveryNo || delivery.deliveryNo}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        bgcolor: "#f1f5f9",
                        color: "#1e293b",
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "#64748b",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label.supplierName}
                    </Typography>
                  </Box>

                  {/* Mid card: 2 cột - Trái: QR Frame, Phải: Info */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "116px 1fr", gap: 1.75, alignItems: "start" }}>
                    <Box
                      sx={{
                        width: 116,
                        height: 116,
                        p: 0.75,
                        borderRadius: 2,
                        border: "1px solid #e2e8f0",
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
                          e.currentTarget.style.display = "none";
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = "flex";
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
                          color: "#1e293b",
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
                          color: "#059669",
                        }}
                      >
                        Định lượng: {label.actualQuantity} {label.unit}
                      </Typography>

                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "#f8fafc",
                          borderRadius: 1.5,
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>
                          Cơ sở nguồn cung:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "#1e293b",
                            display: "block",
                            fontSize: "0.75rem",
                            lineHeight: 1.2,
                          }}
                        >
                          {label.sourceFacility?.name || "Cơ sở nguồn cung đối tác"}
                          {label.sourceFacility?.facilityCode ? ` (${label.sourceFacility.facilityCode})` : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Bottom card: Trace URL & Action copy */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      pt: 1,
                      borderTop: "1px dashed #e2e8f0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
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
                        color: copiedLabelId === label.deliveryItemId ? "#16a34a" : "#2563eb",
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

        <DialogActions sx={{ px: 3, py: 1.5, borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={handleCloseItemQrModal} variant="contained" sx={{ borderRadius: 2, bgcolor: "#0a8066", "&:hover": { bgcolor: "#086a55" } }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

DeliveryDetailView.propTypes = {
  delivery: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired,
  onConfirmAttendance: PropTypes.func,
};
