import useMeasurementUnits from "src/hooks/useMeasurementUnits";
import QuantityRecommendation from "src/components/QuantityRecommendation";
import { quantityError } from "src/utils/measurementUnits";
import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Checkbox,
  CircularProgress,
} from "@mui/material"
import {
  ArrowLeft,
  Send,
  Package,
} from "lucide-react"
import notice from "src/components/Notice"
import styles from "./CreateDryOrderView.module.scss"

// Helper format ngày theo chuẩn Việt Nam DD/MM/YYYY
const formatDateVN = (dateInput) => {
  if (!dateInput) return ""
  const str = String(dateInput).trim()
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  return str
}

// Lấy ngày hiện tại theo giờ Việt Nam định dạng YYYY-MM-DD
const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

// Kiểm tra tính hợp lệ của ngày giao hàng kho khô:
// 1. Không để trống
// 2. Không ở trong quá khứ (< hôm nay)
// Lưu ý: Đồ khô cho phép giao cả Thứ Bảy và Chủ Nhật (chỉ cần Ban QLNL trực tiếp kiểm tra và nghiệm thu)
const validateDeliveryDate = (dateStr) => {
  if (!dateStr || !String(dateStr).trim()) {
    return "Vui lòng chọn ngày giao dự kiến."
  }
  const todayStr = getTodayStr()
  const selected = String(dateStr).slice(0, 10)
  if (selected < todayStr) {
    return "Không thể chọn ngày trong quá khứ. Vui lòng chọn từ hôm nay trở đi."
  }
  return null
}

// Mặc định chọn ngày mai (+1 ngày, cho phép cả Thứ Bảy và Chủ Nhật)
const getTomorrowStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export default function CreateDryOrderView({
  inventoryItems = [],
  suppliers = [],
  initialSelectedItem = null,
  initialQuantities = null,
  onBack,
  onSubmit,
}) {
  // Mặc định chọn ngày mai (cho phép cả Thứ 7, Chủ Nhật)
  const [deliveryDate, setDeliveryDate] = useState(() => getTomorrowStr())
  // Cố định giờ giao tiêu chuẩn đầu giờ làm việc, không yêu cầu người dùng chọn giờ
  const deliveryTime = "08:00"
  const [note, setNote] = useState("Giao tại kho khô, kiểm tra kỹ tem niêm phong và bao bì đóng gói.")
  const [orderQtys, setOrderQtys] = useState({})
  const [itemSuppliers, setItemSuppliers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  // Danh mục đơn vị đo để gợi ý bước nhập số lượng
  const unitCatalog = useMeasurementUnits()

  // Kiểm tra lỗi ngày giao
  const dateError = useMemo(() => validateDeliveryDate(deliveryDate), [deliveryDate])

  // 1. Tổng hợp danh sách tất cả NCC liên kết trong hệ thống
  const allSuppliers = useMemo(() => {
    const list = [...suppliers];
    const existingIds = new Set(list.map((s) => s.id));
    const existingNames = new Set(
      list.map((s) => s.name?.toLowerCase().trim()),
    );

    inventoryItems.forEach((it) => {
      if (it.supplierId && !existingIds.has(it.supplierId)) {
        existingIds.add(it.supplierId);
        list.push({
          id: it.supplierId,
          name: it.supplierName || "Nhà cung cấp đối tác",
          phone: it.supplierPhone || "",
        });
      } else if (
        it.supplierName &&
        !existingNames.has(it.supplierName.toLowerCase().trim())
      ) {
        existingNames.add(it.supplierName.toLowerCase().trim());
        const genId =
          it.supplierId ||
          `sup-${it.supplierName.replace(/\s+/g, "-").toLowerCase()}`;
        list.push({
          id: genId,
          name: it.supplierName,
          phone: it.supplierPhone || "",
        });
      }
    });
    return list;
  }, [suppliers, inventoryItems]);

  // 2. Kiểm tra xem một NCC có cung cấp mặt hàng này không
  const isSupplierAvailableForItem = (supplier, item) => {
    if (!supplier || !item) return false;

    // 2.1 Kiểm tra qua mảng availableSupplierIds do adapter trích xuất từ database
    if (
      Array.isArray(item.availableSupplierIds) &&
      item.availableSupplierIds.length > 0
    ) {
      if (item.availableSupplierIds.includes(supplier.id)) return true;
    }

    // 2.2 Trực tiếp khớp ID nhà cung cấp chính của mặt hàng
    if (item.supplierId && item.supplierId === supplier.id) return true;

    // 2.3 Khớp tên NCC của mặt hàng với tên của supplier
    if (item.supplierName && supplier.name) {
      const a = item.supplierName.trim().toLowerCase();
      const b = supplier.name.trim().toLowerCase();
      if (a === b || a.includes(b) || b.includes(a)) return true;
    }

    // 2.4 Kiểm tra trong toàn bộ inventoryItems xem có mặt hàng cùng tên nào do NCC này cấp không
    const normName = (item.name || "").trim().toLowerCase();
    const matchSameName = inventoryItems.some((it) => {
      const itNorm = (it.name || "").trim().toLowerCase();
      const isSameName =
        itNorm === normName ||
        (itNorm &&
          normName &&
          (itNorm.includes(normName) || normName.includes(itNorm)));
      if (!isSameName) return false;
      if (it.supplierId === supplier.id) return true;
      if (
        Array.isArray(it.availableSupplierIds) &&
        it.availableSupplierIds.includes(supplier.id)
      )
        return true;
      if (it.supplierName && supplier.name) {
        const sA = it.supplierName.trim().toLowerCase();
        const sB = supplier.name.trim().toLowerCase();
        if (sA === sB || sA.includes(sB) || sB.includes(sA)) return true;
      }
      return false;
    });
    if (matchSameName) return true;

    // 2.5 Kiểm tra trong các lô hàng (lots) đã từng nhập của món đó
    if (Array.isArray(item.lots) && item.lots.length > 0) {
      const matchLot = item.lots.some((l) => {
        if (l.supplierId === supplier.id) return true;
        if (l.supplierName && supplier.name) {
          const lA = l.supplierName.trim().toLowerCase();
          const lB = supplier.name.trim().toLowerCase();
          return lA === lB || lA.includes(lB) || lB.includes(lA);
        }
        return false;
      });
      if (matchLot) return true;
    }

    return false;
  };

  // 3. Khởi tạo NCC mặc định cho từng mặt hàng (chọn NCC đang có hàng)
  useEffect(() => {
    const defaultSupMap = {};
    inventoryItems.forEach((it) => {
      // Tìm NCC khả dụng đầu tiên có mặt hàng này
      const matched = allSuppliers.find((s) =>
        isSupplierAvailableForItem(s, it),
      );
      defaultSupMap[it.id] =
        matched?.id || it.supplierId || allSuppliers[0]?.id || "";
    });
    setItemSuppliers(defaultSupMap);
  }, [inventoryItems, allSuppliers]);

  // 4. Khởi tạo số lượng mặt hàng (ưu tiên món được chỉ định hoặc các món dưới mức an toàn)
  useEffect(() => {
    // Lập từ cảnh báo đồ lưu kho: chọn sẵn đúng các mặt hàng thiếu với số cần nhập thêm
    if (initialQuantities && Object.keys(initialQuantities).length) {
      const initial = {}
      inventoryItems.forEach(it => {
        const quantity = Number(initialQuantities[it.id])
        if (quantity > 0) initial[it.id] = Math.max(1, quantity)
      })
      setOrderQtys(initial)
      return
    }
    if (initialSelectedItem) {
      setOrderQtys({
        [initialSelectedItem.id]: Math.max(
          0.001,
          Number(initialSelectedItem.safetyStock) || 1,
        ),
      });
    } else {
      const initial = {};
      inventoryItems
        .filter((it) => it.currentStock < it.safetyStock)
        .forEach((it) => {
          initial[it.id] = Math.max(0.001, Number(it.safetyStock) || 1);
        });
      setOrderQtys(initial);
    }
  }, [initialSelectedItem, initialQuantities, inventoryItems]);

  const handleToggleItem = (item) => {
    setOrderQtys((prev) => {
      const next = { ...prev };
      if (Object.hasOwn(next, item.id)) {
        delete next[item.id];
      } else {
        next[item.id] = Math.max(0.001, Number(item.safetyStock) || 1);
      }
      return next;
    });
  };

  const handleQtyChange = (itemId, val) => {
    const num = val;
    setOrderQtys((prev) => ({ ...prev, [itemId]: num }));
  };

  // Đổi NCC cho riêng từng mặt hàng
  const handleItemSupplierChange = (itemId, newSupId) => {
    setItemSuppliers((prev) => ({
      ...prev,
      [itemId]: newSupId,
    }));
  };

  // Mặt hàng đã chọn lên đầu bảng, giữ nguyên thứ tự gốc trong từng nhóm
  const sortedItems = useMemo(() => {
    const selected = [];
    const rest = [];
    inventoryItems.forEach((item) =>
      (Object.hasOwn(orderQtys, item.id) ? selected : rest).push(item),
    );
    return [...selected, ...rest];
  }, [inventoryItems, orderQtys]);

  const selectedCount = useMemo(() => {
    return Object.keys(orderQtys).length;
  }, [orderQtys]);

  const totalEstimatedAmount = useMemo(() => {
    return Object.entries(orderQtys).reduce((sum, [id, qty]) => {
      const it = inventoryItems.find((item) => item.id === id);
      return sum + (it?.unitPrice || 0) * qty;
    }, 0);
  }, [orderQtys, inventoryItems]);

  // Đếm số lượng NCC khác nhau trong các mặt hàng đã chọn
  const selectedSuppliersCount = useMemo(() => {
    const supNames = new Set();
    Object.keys(orderQtys).forEach((id) => {
      if (orderQtys[id] > 0) {
        const it = inventoryItems.find((item) => item.id === id);
        const name = it?.supplierName || "Nhà cung cấp đối tác";
        supNames.add(name);
      }
    });
    return supNames.size;
  }, [orderQtys, inventoryItems]);

  const handleSubmit = async () => {
    if (Object.values(orderQtys).some((value) => quantityError(value))) return;
    // 1. Tổng hợp tất cả các mặt hàng được chọn kèm NCC tương ứng
    const allSelectedItems = [];

    Object.entries(orderQtys).forEach(([id, qty]) => {
      if (qty <= 0) return;
      const it = inventoryItems.find((item) => item.id === id);
      if (!it) return;

      // Ưu tiên NCC gốc của mặt hàng trong kho
      const matchedSup =
        allSuppliers.find((s) => s.id === it.supplierId) ||
        allSuppliers.find((s) => isSupplierAvailableForItem(s, it));
      const supId =
        it.supplierId ||
        matchedSup?.id ||
        `sup-${(it.supplierName || "default").replace(/\s+/g, "-").toLowerCase()}`;
      const supName =
        it.supplierName || matchedSup?.name || "Nhà cung cấp đối tác";
      const supPhone = it.supplierPhone || matchedSup?.phone || "";

      allSelectedItems.push({
        id: it.id,
        ingredientEntryId: it.ingredientEntryId || it.id,
        name: it.name,
        qty,
        unit: it.unit || "kg",
        price: it.unitPrice || 0,
        supplierId: supId,
        supplierName: supName,
        supplierPhone: supPhone,
      });
    });

    // 2. Validate dữ liệu trước khi gửi
    if (dateError) {
      notice({ msg: dateError, type: "error" })
      return
    }

    if (allSelectedItems.length === 0) {
      notice({ msg: "Vui lòng chọn ít nhất 1 mặt hàng cần nhập kho!", type: "warning" })
      return
    }

    // 3. Chuẩn hóa thông tin hiển thị và gom nhà cung cấp
    const uniqueSuppliers = Array.from(
      new Set(allSelectedItems.map((it) => it.supplierName).filter(Boolean)),
    );
    const primarySupplierName =
      uniqueSuppliers.length === 1
        ? uniqueSuppliers[0]
        : uniqueSuppliers.join(", ");
    const totalAmount = allSelectedItems.reduce(
      (sum, it) => sum + it.price * it.qty,
      0,
    );

    // 4. Tạo 1 Phiếu nhập hàng duy nhất của trường, chứa đầy đủ danh sách mặt hàng và NCC
    const orderToCreate = {
      id: `po-dry-${Date.now()}`,
      orderNo: `PO-DRY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-0${Math.floor(Math.random() * 90 + 10)}`,
      deliveryNo: `PNK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-0${Math.floor(Math.random() * 90 + 10)}`,
      supplierId: allSelectedItems[0]?.supplierId || "",
      supplierName: primarySupplierName,
      suppliers: uniqueSuppliers,
      supplierPhone: allSelectedItems[0]?.supplierPhone || "",
      orderDate: `${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
      deliveryDate,
      deliveryTime,
      deliverySchedule: `Ngày ${formatDateVN(deliveryDate)}`,
      deliveryType: "OFFICE_HOURS",
      deliveryTypeLabel: "Giao trong ngày",
      totalItems: allSelectedItems.length,
      totalAmount,
      status: "CREATED",
      statusLabel: "Chờ NCC xác nhận",
      note,
      items: allSelectedItems,
    };

    try {
      if (
        Object.values(orderQtys).some(
          (value) =>
            value !== "" && Number(value) !== 0 && quantityError(value),
        )
      )
        return;
      setSubmitting(true);
      await onSubmit(orderToCreate);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className={styles.container}>
      {unitCatalog.error && (
        <Alert
          severity="warning"
          action={<Button onClick={unitCatalog.retry}>Thử lại</Button>}
        >
          {unitCatalog.error}
        </Alert>
      )}
      {/* 1. Header & Nút Quay lại */}
      <Box className={styles.header}>
        <Button
          onClick={onBack}
          startIcon={<ArrowLeft size={18} />}
          variant="outlined"
          color="inherit"
          disabled={submitting}
          className={styles.backBtn}
        >
          Quay lại danh sách kho
        </Button>

        <Box className={styles.headerText}>
          <Typography variant="h5" className={styles.title}>
            Tạo Yêu Cầu Nhập Đồ Lưu Kho
          </Typography>
        </Box>
      </Box>

      {/* 2. Card Thông tin Ngày giao hàng dự kiến & Ghi chú (Mục 1) */}
      <Paper className={styles.formCard} elevation={0}>
        <Typography variant="subtitle1" className={styles.sectionTitle}>
          1. Ngày giao hàng dự kiến &amp; Ghi chú
        </Typography>

        <Box className={styles.formGrid}>
          <Box className={styles.dateRow}>
            <TextField
              label="Ngày giao dự kiến"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              size="small"
              error={Boolean(dateError)}
              helperText={dateError}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: getTodayStr() },
              }}
              sx={{ minWidth: 260 }}
            />
          </Box>

          <TextField
            label="Ghi chú giao nhận cho thủ kho / bảo vệ"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={2}
            size="small"
            fullWidth
            placeholder="Ví dụ: Xe giao vào cổng phụ, liên hệ thủ kho tiếp nhận..."
          />
        </Box>
      </Paper>

      {/* 3. Card Chọn danh sách nguyên liệu nhập (Mục 2 - Hiện tất cả nguyên liệu + Cột NCC có select) */}
      <Paper className={styles.formCard} elevation={0}>
        <Box className={styles.tableHeaderBar}>
          <Typography variant="subtitle1" className={styles.sectionTitle}>
            2. Danh sách gạo &amp; gia vị cần nhập ({selectedCount} món đã chọn)
          </Typography>
        </Box>

        <Box className={styles.tableWrap}>
          <Table size="small">
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell padding="checkbox">Chọn</TableCell>
                <TableCell style={{ minWidth: 200 }}>
                  Tên &amp; Loại nguyên liệu
                </TableCell>
                <TableCell align="center" style={{ minWidth: 150 }}>
                  Tồn kho / Mức an toàn
                </TableCell>
                <TableCell align="center" style={{ width: 140 }}>
                  Số lượng nhập
                </TableCell>
                <TableCell style={{ minWidth: 240 }}>
                  Nhà cung cấp (NCC)
                </TableCell>
                <TableCell align="right" style={{ minWidth: 100 }}>
                  Đơn giá
                </TableCell>
                <TableCell align="right" style={{ minWidth: 120 }}>
                  Thành tiền
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Không có mặt hàng đồ lưu kho nào trong kho.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedItems.map((item) => {
                  const isSelected = Object.hasOwn(orderQtys, item.id);
                  const qty = orderQtys[item.id] ?? 0;
                  const stockPct = Math.round(
                    (item.currentStock / item.safetyStock) * 100,
                  );
                  const lineTotal = (item.unitPrice || 0) * qty;
                  const matchedSup =
                    allSuppliers.find((s) =>
                      isSupplierAvailableForItem(s, item),
                    ) || allSuppliers.find((s) => s.id === item.supplierId);
                  const supplierDisplayName =
                    item.supplierName ||
                    matchedSup?.name ||
                    "Nhà cung cấp đối tác";
                  const supplierPhone = item.supplierPhone || matchedSup?.phone;

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      selected={isSelected}
                      className={isSelected ? styles.selectedRow : ""}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleToggleItem(item)}
                          color="primary"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          className={styles.tableItemName}
                        >
                          {item.name}
                        </Typography>
                        {item.category && (
                          <Box className={styles.tableItemMeta}>
                            <Chip
                              label={item.category}
                              size="small"
                              className={styles.catChip}
                            />
                          </Box>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          className={
                            stockPct < 50
                              ? styles.lowStockAlert
                              : stockPct < 100
                                ? styles.warningStock
                                : styles.normalStock
                          }
                        >
                          {item.currentStock} / {item.safetyStock} {item.unit}
                        </Typography>
                        {stockPct < 50 ? (
                          <Chip
                            label="Dưới 50%"
                            size="small"
                            className={styles.miniAlertRed}
                          />
                        ) : stockPct < 100 ? (
                          <Chip
                            label="Trên 50%"
                            size="small"
                            className={styles.miniAlertYellow}
                          />
                        ) : (
                          <Chip
                            label="Đủ dùng"
                            size="small"
                            className={styles.miniAlertGreen}
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Box className={styles.qtyInputWrap}>
                          <TextField
                            type="number"
                            size="small"
                            value={qty}
                            error={isSelected && Boolean(quantityError(qty))}
                            helperText={
                              <QuantityRecommendation
                                value={qty}
                                unit={item.unit}
                                units={unitCatalog.units}
                                validate={isSelected}
                              />
                            }
                            onChange={(e) =>
                              handleQtyChange(item.id, e.target.value)
                            }
                            disabled={!isSelected}
                            slotProps={{
                              htmlInput: {
                                min: 0.001,
                                step: "any",
                                style: {
                                  textAlign: "center",
                                  padding: "4px 8px",
                                },
                              },
                            }}
                            className={styles.qtyField}
                          />
                          <span className={styles.unitText}>{item.unit}</span>
                        </Box>
                      </TableCell>

                      {/* Cột Nhà cung cấp: Hiện luôn NCC nào đang có món hàng đó */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isSelected ? "#0f172a" : "#64748b",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {supplierDisplayName}
                        </Typography>
                        {supplierPhone && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              display: "block",
                              fontSize: "0.7rem",
                            }}
                          >
                            Hotline: {supplierPhone}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.unitPrice.toLocaleString("vi-VN")} đ
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="subtitle2"
                          className={styles.lineTotal}
                        >
                          {isSelected
                            ? `${lineTotal.toLocaleString("vi-VN")} đ`
                            : "—"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* 4. Footer Summary & Action Buttons */}
      <Box className={styles.footerWrap}>
        <Box className={styles.summaryBadges}>
          <Chip
            icon={<Package size={16} />}
            label={`${selectedCount} mặt hàng gạo & gia vị`}
            color="primary"
            variant="outlined"
            className={styles.countBadge}
          />
          {selectedSuppliersCount > 0 && (
            <Chip
              label={`${selectedSuppliersCount} Nhà cung cấp`}
              color="default"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          <Typography variant="subtitle1" className={styles.totalText}>
            Tổng tiền ước tính:{" "}
            <strong>{totalEstimatedAmount.toLocaleString("vi-VN")} đ</strong>
          </Typography>
        </Box>

        <Box className={styles.footerActions}>
          <Button
            onClick={onBack}
            variant="outlined"
            color="inherit"
            disabled={submitting}
          >
            Hủy bỏ
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Send size={18} />
              )
            }
            disabled={selectedCount === 0 || submitting || Boolean(dateError) || !deliveryDate}
            className={styles.submitBtn}
          >
            {submitting ? "Đang gửi..." : "Tạo"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

CreateDryOrderView.propTypes = {
  inventoryItems: PropTypes.array.isRequired,
  suppliers: PropTypes.array,
  initialSelectedItem: PropTypes.object,
  initialQuantities: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
