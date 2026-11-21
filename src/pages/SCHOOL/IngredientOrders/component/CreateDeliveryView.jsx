import useMeasurementUnits from "src/hooks/useMeasurementUnits";
import QuantityRecommendation from "src/components/QuantityRecommendation";
import { quantityError } from "src/utils/measurementUnits";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
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
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  IconButton,
  TableContainer,
  CircularProgress,
  Collapse,
} from "@mui/material";
import {
  ArrowLeft,
  ChefHat,
  Sunrise,
  Users,
  Send,
  Package,
  Truck,
  Boxes,
  Flame,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  CalendarCheck,
  Archive,
  Plus,
  Trash2,
  RotateCcw,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import IngredientOrderService from "src/services/IngredientOrderService";
import MenuService from "src/services/MenuService";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import notice from "src/components/Notice";
import styles from "./CreateDeliveryView.module.scss";

/**
 * =========================================================================================
 * TÀI LIỆU HƯỚNG DẪN KIẾN TRÚC & LUỒNG NGHIỆP VỤ (DÀNH CHO NGƯỜI MỚI HỌC / DEVELOPER)
 * -----------------------------------------------------------------------------------------
 * Component: CreateDeliveryView
 * Phân hệ: Ban Quản Lý Nguyên Liệu Trường Học (INGREDIENT_MANAGEMENT_DEPARTMENT)
 *
 * MỤC ĐÍCH:
 * Màn hình tạo yêu cầu mua và giao nhận thực phẩm tươi sống chuyên biệt phục vụ bếp ăn bán trú.
 * Áp dụng mô hình giao 2 Đợt chuẩn nhằm hạn chế lãng phí và đảm bảo độ tươi ngon an toàn:
 *
 * 1. ĐỢT 1 (Giao sớm 05:30 sáng):
 *    - Nhập trước 50% số suất ăn kế hoạch theo Thực đơn tuần đã được Ban Dinh Dưỡng duyệt.
 *    - Bếp sơ chế, chuẩn bị nước dùng và các món chính nấu sớm.
 *
 * 2. ĐỢT 2 (Giao bổ sung 07:45 sáng):
 *    - Tự động lấy sĩ số thực tế do Giáo viên chủ nhiệm (GVCN) điểm danh báo về buổi sáng.
 *    - Số suất giao bù = (Sĩ số thực tế GVCN chốt) - (Số suất Đợt 1 đã nhận lúc 5h30).
 *    - Giúp trường tiết kiệm chi phí nếu học sinh nghỉ ốm, đồng thời đủ suất ăn cho học sinh.
 *
 * CÁC QUY TẮC NGHIỆP VỤ QUAN TRỌNG (BUSINESS RULES):
 * - Ngày áp dụng (orderDate): Bắt buộc chọn từ hôm nay trở đi, KHÔNG chọn ngày quá khứ,
 *   KHÔNG chọn Thứ Bảy / Chủ Nhật (trường tiểu học không tổ chức ăn bán trú cuối tuần).
 * - Kiểm tra thực đơn tuần: Cần có đủ thực đơn cho các khối lớp của trường. Nếu thiếu khối nào,
 *   hệ thống cảnh báo và có nút gửi nhắc nhở sang Ban Dinh Dưỡng.
 * - Quy đổi đơn vị:
 *   + Đơn vị kg: Hiển thị gam/suất để dễ định lượng, tổng số lượng quy đổi ra kg (2 chữ số thập phân).
 *   + Đơn vị đếm được (trứng, quả, gói...): Tự động làm tròn lên (Math.ceil) để không giao lẻ nửa quả.
 * - Tự động gom hàng theo từng Nhà cung cấp (NCC) đối tác được phân công.
 * =========================================================================================
 */

// Helper format ngày theo chuẩn Việt Nam DD/MM/YYYY
export const formatDateVN = (dateInput) => {
  if (!dateInput) return "";
  const str = String(dateInput).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return str;
};

// Thứ Hai của tuần chứa ngày ISO (yyyy-mm-dd), khớp chuẩn weekStartDate
export const mondayOfIsoDate = (iso) => {
  if (!iso) return "";
  const date = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
};

// Thứ Sáu của tuần chứa ngày Thứ Hai
export const fridayOfIsoDate = (mondayIso) => {
  if (!mondayIso) return "";
  const date = new Date(`${String(mondayIso).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  date.setUTCDate(date.getUTCDate() + 4);
  return date.toISOString().slice(0, 10);
};

export const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/**
 * Kiểm tra hợp lệ ngày áp dụng / ngày giao hàng:
 * 1. Không để trống
 * 2. Không được chọn ngày trong quá khứ (< hôm nay)
 * 3. Không chọn Thứ Bảy (6) hoặc Chủ Nhật (0) vì trường học không ăn bán trú cuối tuần
 */
export const validateOrderDate = (dateStr) => {
  if (!dateStr || !String(dateStr).trim()) {
    return "Vui lòng chọn ngày giao hàng.";
  }
  const todayStr = getTodayStr();
  const selected = String(dateStr).slice(0, 10);
  if (selected < todayStr) {
    return "Không thể chọn ngày trong quá khứ. Vui lòng chọn từ ngày hôm nay trở đi.";
  }
  const [y, m, d] = selected.split("-").map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return "Trường học không tổ chức ăn bán trú vào Thứ Bảy và Chủ Nhật. Vui lòng chọn ngày trong tuần (Thứ Hai - Thứ Sáu).";
  }
  return null;
};

/**
 * Tính ngày đi học kế tiếp (bỏ qua Thứ Bảy và Chủ Nhật)
 * Phục vụ gợi ý chọn ngày tiếp theo khi ngày hiện tại đã hoàn tất cả 2 đợt giao
 */
export const getNextSchoolDay = (baseDateStr) => {
  const [y, m, d] = (baseDateStr || getTodayStr()).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  if (date.getDay() === 6) {
    date.setDate(date.getDate() + 2);
  } else if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, "0");
  const nextD = String(date.getDate()).padStart(2, "0");
  return `${nextY}-${nextM}-${nextD}`;
};

/**
 * Lấy ngày mặc định khi mở form:
 * Nếu hôm nay rơi vào Thứ 7 hoặc Chủ Nhật thì tự động chuyển sang Thứ 2 tới
 */
export const getDefaultOrderDate = () => {
  const today = getTodayStr();
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getDay() === 6) {
    date.setDate(date.getDate() + 2);
  } else if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  }
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, "0");
  const nextD = String(date.getDate()).padStart(2, "0");
  return `${nextY}-${nextM}-${nextD}`;
};

/**
 * Kiểm tra đơn vị đếm được (nguyên quả, nguyên con, gói, chai...)
 * Nhóm đếm dùng để hiển thị đơn vị; lượng lẻ vẫn được giữ nguyên.
 */
export const isDiscreteUnit = (unit = "") => {
  if (!unit) return false;
  const u = String(unit).toLowerCase().trim();
  const discreteUnits = [
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
  ];
  return discreteUnits.includes(u);
};

export const isKgUnit = (unit) => {
  return ["kg", "kilogram", "kilogam"].includes(
    String(unit || "kg")
      .toLowerCase()
      .trim(),
  );
};

export const getPortionUnit = (unit) => {
  return isKgUnit(unit) ? "g" : unit || "";
};

export const formatPortionRate = (rate, unit) => {
  if (rate == null || isNaN(rate) || Number(rate) <= 0) return "";
  if (isKgUnit(unit)) {
    const grams = Number((Number(rate) * 1000).toFixed(2));
    return `${grams} g`;
  }
  return `${rate} ${unit}`;
};

/**
 * Tính số lượng đợt: giữ số lẻ theo độ chính xác lưu trữ, không làm tròn theo đơn vị đếm
 * Ví dụ: 431 * 0.5 = 215.5 quả, giữ nguyên 215.5.
 */
export const calcBatchQty = (qtyPerPortion, portions, unit = "") => {
  const raw = Number(qtyPerPortion) * Number(portions);
  if (isDiscreteUnit(unit)) {
    return Number(raw.toFixed(3));
  }
  return Number(raw.toFixed(3));
};

export const calcQtyPerPortion = (batchQty, portions) => {
  if (!portions || portions <= 0) return 0;
  return Number((Number(batchQty) / portions).toFixed(12));
};

export default function CreateDeliveryView({
  loading = false,
  menus = [],
  deliveries = [],
  initialDate,
  onBack,
  onSubmitBatch1,
  onSubmitBatch2,
}) {
  const unitCatalog = useMeasurementUnits();
  const effectiveMenus = useMemo(() => {
    return Array.isArray(menus) ? menus : [];
  }, [menus]);

  // 1. Ngày áp dụng / giao hàng: kiểm tra hợp lệ (không quá khứ, không cuối tuần)
  const [orderDate, setOrderDate] = useState(() => {
    if (initialDate) return String(initialDate).slice(0, 10);
    return getDefaultOrderDate();
  });

  // Lỗi ngày giao (nếu có: rỗng, quá khứ, Thứ 7/CN)
  const dateError = useMemo(() => validateOrderDate(orderDate), [orderDate]);
  const [selectedMenuId, setSelectedMenuId] = useState(
    () => effectiveMenus[0]?.id || "",
  );
  const [note, setNote] = useState(
    "Vận chuyển bằng xe lạnh chuyên dụng, kiểm tra niêm phong nhiệt độ.",
  );
  const [submitting, setSubmitting] = useState(false);

  // Danh mục nguyên liệu chuẩn tải từ API thật cho modal thêm món ngoài
  const [catalogOptions, setCatalogOptions] = useState([]);
  useEffect(() => {
    IngredientOrderService.getMasterIngredientCatalog().then((res) => {
      if (Array.isArray(res?.items) && res.items.length > 0) {
        setCatalogOptions(res.items);
      }
    });
  }, []);

  // Đồng bộ ngày khi initialDate thay đổi (ví dụ bấm Thêm Đợt 2 từ bảng)
  useEffect(() => {
    if (initialDate) {
      setOrderDate(String(initialDate).slice(0, 10));
      setActualAttendance("");
    }
  }, [initialDate]);

  // Sĩ số GVCN báo cho Đợt 2 (tự động đồng bộ từ API tổng hợp sĩ số của trường)
  const [actualAttendance, setActualAttendance] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [openClassDialog, setOpenClassDialog] = useState(false);

  const fetchAttendance = useCallback(
    async (targetDate) => {
      const d = targetDate || orderDate;
      if (!d) return;
      setAttendanceLoading(true);
      try {
        const summary = await IngredientOrderService.getDailyAttendanceSummary({
          date: d,
          mealType: "LUNCH",
        });
        if (summary) {
          setAttendanceSummary(summary);
          if (summary.totalPortions > 0) {
            setActualAttendance(String(summary.totalPortions));
          }
        }
      } catch (err) {
        console.warn("Lỗi đồng bộ sĩ số GVCN:", err);
      } finally {
        setAttendanceLoading(false);
      }
    },
    [orderDate],
  );

  // =========================================================================
  // TỰ ĐỘNG NHẬN DIỆN CHẾ ĐỘ THEO NGÀY (VALIDATE THEO ORDER_DATE)
  // =========================================================================
  const { mode, batch1ForDate, batch2ForDate } = useMemo(() => {
    const target = String(orderDate || "").slice(0, 10);
    const forDate = deliveries.filter(
      (d) => String(d.deliveryDate || "").slice(0, 10) === target,
    );
    const b1 = forDate.find((d) => d.batchType === "BATCH_1");
    const b2 = forDate.find((d) => d.batchType === "BATCH_2");

    const rejectCount = Object.values(b1?.approvals || {}).filter(
      (a) => a?.approved === false,
    ).length;
    const b1Failed =
      b1 &&
      (b1.status === "CANCELLED" ||
        b1.status === "REJECTED" ||
        rejectCount >= 2);

    let m = "BATCH_1";
    if (b1 && b2) {
      m = "COMPLETED";
    } else if (b1 && b1Failed) {
      m = "BATCH_1_CANCELLED";
    } else if (b1 && !b2) {
      m = "BATCH_2";
    } else {
      m = "BATCH_1";
    }

    return { mode: m, batch1ForDate: b1, batch2ForDate: b2 };
  }, [deliveries, orderDate]);

  // Tự động đồng bộ sĩ số từ GVCN khi chuyển sang mode Đợt 2 hoặc đổi ngày
  useEffect(() => {
    if (mode === "BATCH_2") {
      fetchAttendance(orderDate);
    } else {
      setAttendanceSummary(null);
    }
  }, [mode, orderDate, fetchAttendance]);

  // Tuần hiện tại của ngày giao hàng được chọn (Thứ Hai và Thứ Sáu)
  const targetMonday = useMemo(() => {
    return mondayOfIsoDate(orderDate);
  }, [orderDate]);

  const targetFriday = useMemo(() => {
    return fridayOfIsoDate(targetMonday);
  }, [targetMonday]);

  // 1. Lọc toàn bộ thực đơn đã duyệt của ĐÚNG TUẦN ĐÓ
  const menusInCurrentWeek = useMemo(() => {
    if (!targetMonday) return [];
    return effectiveMenus.filter((m) => {
      const mWeek = mondayOfIsoDate(m.weekStartDate || m.mealDate || m.date);
      if (mWeek === targetMonday) return true;
      if (
        Array.isArray(m.menuDays) &&
        m.menuDays.some(
          (d) => mondayOfIsoDate(d.menuDate || d.date) === targetMonday,
        )
      ) {
        return true;
      }
      if (
        Array.isArray(m.days) &&
        m.days.some((d) => mondayOfIsoDate(d.date) === targetMonday)
      ) {
        return true;
      }
      return false;
    });
  }, [effectiveMenus, targetMonday]);

  const hasMenusInWeek = menusInCurrentWeek.length > 0;

  // Tự động đồng bộ selectedMenuId khi đổi tuần / đổi ngày
  useEffect(() => {
    if (menusInCurrentWeek.length > 0) {
      const isCurrentValid = menusInCurrentWeek.some(
        (m) => m.id === selectedMenuId,
      );
      if (!isCurrentValid) {
        setSelectedMenuId(menusInCurrentWeek[0].id);
      }
    } else {
      setSelectedMenuId("");
    }
  }, [menusInCurrentWeek, selectedMenuId]);

  const [schoolGrades, setSchoolGrades] = useState([]);
  const [bypassIncompleteMenu, setBypassIncompleteMenu] = useState(false);
  const [remindStatus, setRemindStatus] = useState(null);

  // Tải danh sách khối chuẩn của trường từ MenuService context
  useEffect(() => {
    let active = true;
    MenuService.getContext()
      .then((ctx) => {
        if (active && Array.isArray(ctx?.grades)) {
          setSchoolGrades(ctx.grades);
        }
      })
      .catch((err) => {
        console.warn(
          "[CreateDeliveryView] Không thể tải danh sách khối trường:",
          err,
        );
      });
    return () => {
      active = false;
    };
  }, []);

  // Reset bypass và trạng thái nhắc nhở khi chuyển tuần
  useEffect(() => {
    setBypassIncompleteMenu(false);
    setRemindStatus(null);
  }, [targetMonday]);

  // Kiểm tra độ hoàn thiện thực đơn của tuần (Toàn trường vs Từng khối)
  const menuCompleteness = useMemo(() => {
    if (!targetMonday) {
      return {
        isComplete: false,
        isSchoolWide: false,
        coveredGrades: [],
        missingGrades: [],
        totalGrades: 0,
      };
    }

    if (!hasMenusInWeek) {
      return {
        isComplete: false,
        isSchoolWide: false,
        coveredGrades: [],
        missingGrades:
          schoolGrades.length > 0
            ? schoolGrades.map((g) => g.name || g.label)
            : ["Toàn trường"],
        totalGrades: schoolGrades.length,
        hasNoMenu: true,
      };
    }

    // 1. Nếu có thực đơn áp dụng Toàn trường
    const schoolWideMenu = menusInCurrentWeek.find(
      (m) =>
        m.isSchoolWide === true ||
        m.targetScope === "Toàn trường" ||
        String(m.name || m.title || "")
          .toLowerCase()
          .includes("toàn trường"),
    );

    if (schoolWideMenu) {
      return {
        isComplete: true,
        isSchoolWide: true,
        coveredGrades:
          schoolGrades.length > 0
            ? schoolGrades.map((g) => g.name)
            : ["Toàn trường"],
        missingGrades: [],
        totalGrades: schoolGrades.length,
      };
    }

    // 2. Nếu chia theo khối, tập hợp tất cả các khối đã có thực đơn duyệt
    const coveredGradeIds = new Set();
    const coveredNames = new Set();

    menusInCurrentWeek.forEach((m) => {
      if (Array.isArray(m.gradeIds)) {
        m.gradeIds.forEach((id) => coveredGradeIds.add(id));
      }
      if (Array.isArray(m.grades)) {
        m.grades.forEach((g) => {
          if (g.id || g.gradeId) coveredGradeIds.add(g.id || g.gradeId);
          if (g.name || g.grade?.name)
            coveredNames.add(g.name || g.grade?.name);
        });
      }
      if (Array.isArray(m.gradeNames)) {
        m.gradeNames.forEach((n) => coveredNames.add(n));
      }
      if (m.targetScope && m.targetScope !== "Khối lớp") {
        coveredNames.add(m.targetScope);
      }
      const titleLower = String(m.title || m.name || "").toLowerCase();
      if (
        titleLower.includes("1-3") ||
        titleLower.includes("khối 1") ||
        titleLower.includes("khối 2") ||
        titleLower.includes("khối 3")
      ) {
        coveredNames.add("Khối 1-3");
      }
      if (
        titleLower.includes("4-5") ||
        titleLower.includes("khối 4") ||
        titleLower.includes("khối 5")
      ) {
        coveredNames.add("Khối 4-5");
      }
    });

    let missing = [];

    if (schoolGrades.length > 0) {
      missing = schoolGrades
        .filter((g) => {
          const idMatched = coveredGradeIds.has(g.id);
          const nameMatched = Array.from(coveredNames).some((cName) => {
            const normC = String(cName).toLowerCase();
            const normG = String(g.name).toLowerCase();
            return (
              normC === normG || normC.includes(normG) || normG.includes(normC)
            );
          });
          return !idMatched && !nameMatched;
        })
        .map((g) => g.name);
    } else {
      // Nhận diện theo 2 nhóm phổ biến (Khối 1-3 và Khối 4-5) nếu DB chưa có bảng Khối
      const coveredList = Array.from(coveredNames).join(" ");
      const hasK13 =
        coveredList.includes("1-3") ||
        coveredList.includes("1") ||
        coveredList.includes("2") ||
        coveredList.includes("3");
      const hasK45 =
        coveredList.includes("4-5") ||
        coveredList.includes("4") ||
        coveredList.includes("5");

      if (hasK13 && !hasK45) {
        missing = ["Khối 4-5"];
      } else if (!hasK13 && hasK45) {
        missing = ["Khối 1-3"];
      }
    }

    return {
      isComplete: missing.length === 0,
      isSchoolWide: false,
      coveredGrades: Array.from(coveredNames),
      missingGrades: missing,
      totalGrades: schoolGrades.length,
    };
  }, [targetMonday, hasMenusInWeek, menusInCurrentWeek, schoolGrades]);

  const isOrderAllowed =
    hasMenusInWeek && (menuCompleteness.isComplete || bypassIncompleteMenu);

  const handleRemindNutrition = () => {
    const missingStr =
      menuCompleteness.missingGrades.length > 0
        ? menuCompleteness.missingGrades.join(", ")
        : "các khối còn lại";

    const timeStr = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    setRemindStatus({
      sent: true,
      time: timeStr,
      missingGrades: missingStr,
    });

    notice({
      msg: "Đã gửi thông báo nhắc nhở đến bộ phận Dinh dưỡng!",
      desc: `Yêu cầu hoàn tất thực đơn tuần (${formatDateVN(targetMonday)} – ${formatDateVN(targetFriday)}) cho ${missingStr} để Ban QLNL tiến hành nhập hàng.`,
      isSuccess: true,
    });
  };

  // 2. Quét thực đơn áp dụng theo ngày chọn trong tuần đó
  const matchingMenusForDate = useMemo(() => {
    if (!orderDate || !hasMenusInWeek) return [];
    const target = String(orderDate).slice(0, 10);

    const matches = menusInCurrentWeek.filter((m) => {
      if (Array.isArray(m.menuDays) && m.menuDays.length > 0) {
        return m.menuDays.some(
          (d) => String(d.menuDate || d.date || "").slice(0, 10) === target,
        );
      }
      if (Array.isArray(m.days) && m.days.length > 0) {
        return m.days.some((d) => String(d.date || "").slice(0, 10) === target);
      }
      return true;
    });

    // Chỉ trả về các thực đơn thuộc đúng tuần đó, TUYỆT ĐỐI không fallback sang tuần khác!
    return matches.length > 0 ? matches : menusInCurrentWeek;
  }, [orderDate, hasMenusInWeek, menusInCurrentWeek]);

  const isMultiMenuDate = matchingMenusForDate.length > 1;

  // 3. Danh sách thực đơn hiệu lực (activeMenus) có trích xuất món ăn & nguyên liệu theo ngày
  const activeMenus = useMemo(() => {
    if (!hasMenusInWeek) return [];

    let baseList = [];
    if (mode === "BATCH_2" && batch1ForDate) {
      if (
        Array.isArray(batch1ForDate.menusSummary) &&
        batch1ForDate.menusSummary.length > 1
      ) {
        baseList = batch1ForDate.menusSummary.map((ms) => {
          const found = menusInCurrentWeek.find((m) => m.id === ms.id);
          return (
            found || {
              ...ms,
              mealDate: batch1ForDate.deliveryDate,
              ingredients: [],
            }
          );
        });
      } else if (
        Array.isArray(batch1ForDate.menuIds) &&
        batch1ForDate.menuIds.length > 1
      ) {
        baseList = batch1ForDate.menuIds
          .map((id) => menusInCurrentWeek.find((m) => m.id === id))
          .filter(Boolean);
        if (baseList.length === 0) baseList = matchingMenusForDate;
      } else if (matchingMenusForDate.length > 0) {
        // Đợt 2 luôn luôn ăn theo toàn bộ thực đơn áp dụng của ngày hôm đó (kế thừa trọn vẹn từ Đợt 1)
        baseList = matchingMenusForDate;
      } else {
        const b1Menu =
          menusInCurrentWeek.find((m) => m.id === batch1ForDate.menuId) ||
          matchingMenusForDate[0] ||
          menusInCurrentWeek[0];
        baseList = b1Menu ? [b1Menu] : [];
      }
    } else if (isMultiMenuDate) {
      baseList = matchingMenusForDate;
    } else if (matchingMenusForDate.length === 1) {
      baseList = matchingMenusForDate;
    } else {
      const found = menusInCurrentWeek.find((m) => m.id === selectedMenuId);
      baseList = found ? [found] : [menusInCurrentWeek[0]].filter(Boolean);
    }

    const target = String(orderDate || "").slice(0, 10);
    return baseList.map((m) => {
      if (m.menuDaysMap && m.menuDaysMap[target]) {
        const dayData = m.menuDaysMap[target];
        return {
          ...m,
          dishes: dayData.dishes?.length > 0 ? dayData.dishes : m.dishes,
          ingredients:
            dayData.ingredients?.length > 0
              ? dayData.ingredients
              : m.ingredients,
        };
      }
      return m;
    });
  }, [
    hasMenusInWeek,
    mode,
    batch1ForDate,
    isMultiMenuDate,
    matchingMenusForDate,
    menusInCurrentWeek,
    selectedMenuId,
    orderDate,
  ]);

  const isMultiMenu = activeMenus.length > 1;

  // 3. Phân bổ suất Đợt 1 và Suất tối đa của từng thực đơn
  const menusPortionsMeta = useMemo(() => {
    return activeMenus.map((m, idx) => {
      const maxP = Number(m.maxPortions) || 175;
      const b1P = Math.floor(maxP / 2);
      let scope = m.targetScope;
      if (
        !scope ||
        scope === "Khối lớp" ||
        scope === "Khối 1-5" ||
        scope.includes("Khối lớp 4-5 - Khối lớp 1-3") ||
        scope.includes("4-5 -") ||
        scope.includes("1-3 -")
      ) {
        if (m.name?.includes("1-3") || m.title?.includes("1-3")) {
          scope = "Khối 1-3";
        } else if (m.name?.includes("4-5") || m.title?.includes("4-5")) {
          scope = "Khối 4-5";
        } else if (isMultiMenu) {
          scope = idx === 0 ? "Khối 1-3" : "Khối 4-5";
        } else {
          scope = "Toàn trường";
        }
      }
      return {
        id: m.id,
        name: m.name,
        targetScope: scope,
        maxPortions: maxP,
        batch1Portions: b1P,
      };
    });
  }, [activeMenus, isMultiMenu]);

  const totalMaxPortions = useMemo(() => {
    const sum = menusPortionsMeta.reduce((s, m) => s + m.maxPortions, 0);
    return sum > 0 ? sum : 175;
  }, [menusPortionsMeta]);

  const totalBatch1Portions = useMemo(() => {
    const sum = menusPortionsMeta.reduce((s, m) => s + m.batch1Portions, 0);
    return sum > 0 ? sum : Math.floor(totalMaxPortions / 2);
  }, [menusPortionsMeta, totalMaxPortions]);

  const currentMenu = activeMenus[0] || menusInCurrentWeek[0] || null;
  const maxPortions =
    mode === "BATCH_2" && Number(batch1ForDate?.maxPortions) > 0
      ? Number(batch1ForDate.maxPortions)
      : totalMaxPortions;
  const batch1Portions =
    mode === "BATCH_2" && Number(batch1ForDate?.plannedPortions) > 0
      ? Number(batch1ForDate.plannedPortions)
      : totalBatch1Portions;

  // State sĩ số theo khối và đóng mở xem chi tiết phân rã
  const [gradeAttendance, setGradeAttendance] = useState({});
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpandRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Tính số suất giao bù ở Đợt 2
  const parsedAttendance = Number(actualAttendance) || 0;
  // Đợt 2 chỉ tạo được khi mọi lớp có đăng ký suất ăn đã chốt điểm danh (BE cũng chặn).
  const unfinalizedClasses = (attendanceSummary?.classes || []).filter(
    (cls) => Number(cls.registeredPortions) > 0 && cls.status !== "FINALIZED",
  );
  const attendanceReady =
    Boolean(attendanceSummary) && unfinalizedClasses.length === 0;

  const remainingByMenu = useMemo(() => {
    const res = {};
    const classes = attendanceSummary?.classes || [];

    const isClassInMenu = (cls, m, idx) => {
      if (m.isSchoolWide || m.targetScope === "Toàn trường") return true;

      // 1. Đối chiếu theo gradeId nếu có
      if (
        Array.isArray(m.gradeIds) &&
        cls.gradeId &&
        m.gradeIds.includes(cls.gradeId)
      ) {
        return true;
      }
      if (
        Array.isArray(m.grades) &&
        cls.gradeId &&
        m.grades.some((g) => (g.id || g.gradeId) === cls.gradeId)
      ) {
        return true;
      }

      // 2. Đối chiếu theo tên khối hoặc tên lớp
      const cGrade = String(cls.gradeName || "").toLowerCase();
      const cName = String(cls.className || "").trim();
      const mText =
        `${m.targetScope || ""} ${m.name || ""} ${m.title || ""}`.toLowerCase();

      // Khối 1-3
      if (
        mText.includes("1-3") ||
        (!mText.includes("4-5") &&
          (mText.includes("1") || mText.includes("2") || mText.includes("3")))
      ) {
        if (
          cGrade.includes("1") ||
          cGrade.includes("2") ||
          cGrade.includes("3")
        )
          return true;
        if (/^[123]/i.test(cName)) return true;
      }

      // Khối 4-5
      if (
        mText.includes("4-5") ||
        (!mText.includes("1-3") && (mText.includes("4") || mText.includes("5")))
      ) {
        if (cGrade.includes("4") || cGrade.includes("5")) return true;
        if (/^[45]/i.test(cName)) return true;
      }

      // Khi có 2 menu: menu đầu tiên là 1-3, menu thứ hai là 4-5
      if (menusPortionsMeta.length === 2) {
        if (idx === 0) return /^[123]/i.test(cName);
        if (idx === 1) return /^[45]/i.test(cName);
      }

      return false;
    };

    menusPortionsMeta.forEach((m, idx) => {
      let actual = gradeAttendance[m.id];
      let menuClasses = [];

      if (classes.length > 0) {
        menuClasses = classes.filter((cls) => isClassInMenu(cls, m, idx));
      }

      // Nếu chưa nhập thủ công và có danh sách lớp thực tế thuộc khối này:
      // Tính chính xác tổng sĩ số thực tế của các lớp đã chốt (FINALIZED)
      if (
        (typeof actual !== "number" || isNaN(actual)) &&
        menuClasses.length > 0
      ) {
        actual = menuClasses
          .filter((cls) => cls.status === "FINALIZED")
          .reduce((sum, cls) => sum + (Number(cls.actualPortions) || 0), 0);
      }

      // Fallback chỉ khi không tìm thấy lớp nào được gán
      if (typeof actual !== "number" || isNaN(actual)) {
        const ratio =
          totalMaxPortions > 0 ? m.maxPortions / totalMaxPortions : 0.5;
        actual = Math.round(parsedAttendance * ratio);
      }

      // Sĩ số tối đa đăng ký của riêng khối này từ danh sách lớp
      let maxP = m.maxPortions;
      if (menuClasses.length > 0) {
        const regSum = menuClasses.reduce(
          (sum, cls) => sum + (Number(cls.registeredPortions) || 0),
          0,
        );
        if (regSum > 0) maxP = regSum;
      }

      const rem = Math.max(0, actual - m.batch1Portions);
      res[m.id] = {
        maxPortions: maxP,
        batch1Portions: m.batch1Portions,
        actual,
        remaining: rem,
        targetScope: m.targetScope,
      };
    });
    return res;
  }, [
    menusPortionsMeta,
    gradeAttendance,
    parsedAttendance,
    totalMaxPortions,
    attendanceSummary,
  ]);

  const remainingPortions = useMemo(() => {
    if (parsedAttendance <= 0) return 0;
    if (!isMultiMenu) {
      return Math.max(0, parsedAttendance - totalBatch1Portions);
    }
    return Object.values(remainingByMenu).reduce(
      (sum, v) => sum + v.remaining,
      0,
    );
  }, [parsedAttendance, isMultiMenu, totalBatch1Portions, remainingByMenu]);

  // State thu gọn / mở rộng chi tiết cân đối theo từng khối lớp
  const [showGradeBalance, setShowGradeBalance] = useState(false);

  // Loading state cho danh mục nguyên liệu theo thực đơn
  const [itemsLoading, setItemsLoading] = useState(true);
  const isTableLoading = Boolean(loading || itemsLoading);

  // Quản lý danh sách nguyên liệu và định lượng/số lượng tùy chỉnh 2 chiều
  const [itemsState, setItemsState] = useState([]);

  // State Modal thêm nguyên liệu giao thêm
  const [openAddModal, setOpenAddModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [extraQtyInput, setExtraQtyInput] = useState("");

  // Khởi tạo itemsState khi đổi menu, đổi ngày (hoặc đổi mode Đợt 1 / Đợt 2)
  // Tự động gộp nguyên liệu chung của các thực đơn và lưu cấu trúc breakdown
  useEffect(() => {
    setItemsLoading(true);
    const timer = setTimeout(() => {
      if (!activeMenus || activeMenus.length === 0) {
        setItemsState([]);
        setItemsLoading(false);
        return;
      }

      const groupedMap = new Map();

      activeMenus.forEach((menu) => {
        const fresh = (menu.ingredients || []).filter(
          (it) => it.handlingType === "DIRECT_USE",
        );
        const mPortions =
          mode === "BATCH_1"
            ? Math.floor((Number(menu.maxPortions) || 0) / 2)
            : remainingByMenu[menu.id]?.remaining || 0;

        fresh.forEach((ing) => {
          const key = (ing.name || "").trim().toLowerCase();
          const itemUnit = ing.unit || "kg";
          let rawRate = Number(ing.qtyPerPortion) || 0.05;

          if (!groupedMap.has(key)) {
            groupedMap.set(key, {
              id: ing.id,
              ingredientId: ing.ingredientId || ing.id,
              ingredientEntryId: ing.ingredientEntryId || ing.id,
              name: ing.name,
              category: ing.category,
              unit: itemUnit,
              supplierId: ing.supplierId,
              supplierName: ing.supplierName,
              handlingType: ing.handlingType || "DIRECT_USE",
              isExtraItem: false,
              defaultQtyPerPortion: rawRate,
              qtyPerPortion: rawRate,
              contributions: [],
            });
          }

          const entry = groupedMap.get(key);
          let rate = rawRate;

          // Kế thừa định lượng Đợt 1 nếu là Đợt 2
          if (mode === "BATCH_2" && batch1ForDate) {
            const b1Item = batch1ForDate.items?.find(
              (b) =>
                (b.ingredientId && b.ingredientId === ing.id) ||
                b.ingredientName?.trim().toLowerCase() === key,
            );
            if (b1Item) {
              if (
                Array.isArray(b1Item.breakdown) &&
                b1Item.breakdown.length > 0
              ) {
                const bContr = b1Item.breakdown.find(
                  (bd) => bd.menuId === menu.id,
                );
                if (bContr?.qtyPerPortion) rate = bContr.qtyPerPortion;
              } else if (
                typeof b1Item.qtyPerPortion === "number" &&
                b1Item.qtyPerPortion > 0
              ) {
                rate = b1Item.qtyPerPortion;
              }
            }
          }

          let mScope = menu.targetScope;
          if (!mScope || mScope === "Khối lớp") {
            if (menu.name?.includes("1-3") || menu.title?.includes("1-3"))
              mScope = "Khối 1-3";
            else if (menu.name?.includes("4-5") || menu.title?.includes("4-5"))
              mScope = "Khối 4-5";
            else if (
              Array.isArray(menu.gradeNames) &&
              menu.gradeNames.length > 0
            )
              mScope = menu.gradeNames.join(" - ");
            else mScope = menu.name || "Khối lớp";
          }

          const calcContribution = Number((rate * mPortions).toFixed(3));
          entry.contributions.push({
            menuId: menu.id,
            menuName: menu.name,
            targetScope: mScope,
            qtyPerPortion: rate,
            portions: mPortions,
            calculatedQty: calcContribution,
            unit: itemUnit,
          });
        });
      });

      const initialItems = Array.from(groupedMap.values()).map((entry) => {
        const isDiscrete = isDiscreteUnit(entry.unit);
        const rawSum = entry.contributions.reduce(
          (acc, c) => acc + c.calculatedQty,
          0,
        );
        const stdQty = Number(rawSum.toFixed(3));
        const isMulti = entry.contributions.length > 1;

        const displayRate = isMulti
          ? entry.contributions
            .map((c) => `${c.targetScope}: ${c.qtyPerPortion}`)
            .join(" | ")
          : entry.contributions[0]?.qtyPerPortion || entry.qtyPerPortion;

        const isKg = isKgUnit(entry.unit);
        const rawPortion =
          entry.contributions[0]?.qtyPerPortion || entry.qtyPerPortion;
        const displayPortion = isKg
          ? Number((Number(rawPortion) * 1000).toFixed(2))
          : rawPortion;

        return {
          id: entry.id,
          name: entry.name,
          category: entry.category,
          unit: entry.unit,
          supplierId: entry.supplierId,
          supplierName: entry.supplierName,
          handlingType: entry.handlingType,
          isExtraItem: false,
          isMultiMenu: isMulti,
          breakdown: entry.contributions,
          defaultQtyPerPortion: entry.defaultQtyPerPortion,
          qtyPerPortion: rawPortion,
          portionInput: String(displayPortion),
          displayRate,
          standardQty: stdQty,
          standardQtyInput: String(stdQty),
          extraQty: 0,
          extraQtyInput: "",
          batchQty: stdQty,
        };
      });

      setItemsState(initialItems);
      setItemsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [activeMenus, mode, batch1ForDate, orderDate]);

  // Cập nhật lại số lượng Đợt 2 khi GVCN cập nhật Sĩ số (dựa trên định lượng đã kế thừa từ Đợt 1)
  useEffect(() => {
    if (mode !== "BATCH_2") return;

    setItemsState((prev) => {
      if (!prev || prev.length === 0) return prev;
      return prev.map((item) => {
        if (item.isExtraItem) return item;

        const isDiscrete = isDiscreteUnit(item.unit);
        let newStdQty = 0;
        let newBreakdown = null;

        if (Array.isArray(item.breakdown) && item.breakdown.length > 0) {
          newBreakdown = item.breakdown.map((bd) => {
            const mRem = remainingByMenu[bd.menuId]?.remaining ?? 0;
            const cQty = Number(((bd.qtyPerPortion || 0) * mRem).toFixed(3));
            return {
              ...bd,
              portions: mRem,
              calculatedQty: cQty,
            };
          });
          const rawSum = newBreakdown.reduce(
            (acc, b) => acc + b.calculatedQty,
            0,
          );
          newStdQty = Number(rawSum.toFixed(3));
        } else {
          newStdQty = calcBatchQty(
            item.qtyPerPortion,
            remainingPortions,
            item.unit,
          );
        }

        const extra = Number(item.extraQty) || 0;
        const total = Number((newStdQty + extra).toFixed(3));

        return {
          ...item,
          breakdown: newBreakdown || item.breakdown,
          standardQty: newStdQty,
          standardQtyInput: String(newStdQty),
          batchQty: total,
        };
      });
    });
  }, [mode, parsedAttendance, remainingPortions, remainingByMenu]);

  // Thêm nguyên liệu giao thêm từ Catalog Popup
  const handleAddExtraIngredient = () => {
    if (!selectedIngredient) return;
    const num = parseFloat(extraQtyInput);
    if (quantityError(extraQtyInput)) return;

    const rawUnit =
      selectedIngredient.defaultUnit || selectedIngredient.unit || "kg";
    const unit = rawUnit;
    const isDiscrete = isDiscreteUnit(unit);
    const addQty = Number(num.toFixed(3));

    setItemsState((prev) => {
      // 1. Nếu nguyên liệu đã có sẵn trong bảng thực phẩm -> Điền vào cột "Giao thêm" riêng biệt
      const existingIdx = prev.findIndex(
        (it) =>
          it.id === selectedIngredient.id ||
          it.name.toLowerCase() === selectedIngredient.name.toLowerCase(),
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        const currentExtra = Number(updated[existingIdx].extraQty) || 0;
        const newExtra = Number((currentExtra + addQty).toFixed(3));
        const std = Number(updated[existingIdx].standardQty) || 0;
        const total = Number((std + newExtra).toFixed(3));

        updated[existingIdx] = {
          ...updated[existingIdx],
          extraQty: newExtra,
          extraQtyInput: String(newExtra),
          batchQty: total,
        };
        return updated;
      }

      // 2. Nếu là nguyên liệu mới ngoài thực đơn -> Thêm thành dòng riêng
      const newItem = {
        id: selectedIngredient.id || `extra-${Date.now()}`,
        name: selectedIngredient.name,
        category: selectedIngredient.category || "Nguyên liệu",
        unit,
        supplierId: selectedIngredient.supplierId,
        supplierName: selectedIngredient.supplierName,
        handlingType: selectedIngredient.handlingType || "DIRECT_USE",
        isExtraItem: true,
        qtyPerPortion: 0,
        portionInput: "—",
        standardQty: 0,
        standardQtyInput: "—",
        extraQty: addQty,
        extraQtyInput: String(addQty),
        batchQty: addQty,
      };
      return [...prev, newItem];
    });

    setSelectedIngredient(null);
    setExtraQtyInput("");
    setOpenAddModal(false);
  };

  // Xóa món thêm ngoài
  const handleRemoveExtraIngredient = (id) => {
    setItemsState((prev) => prev.filter((it) => it.id !== id));
  };

  // 1. Chỉnh sửa Định lượng trên 1 suất (CHỈ ÁP DỤNG ĐỢT 1) -> Tự động tính lại Số lượng theo suất
  const handlePortionChange = (id, rawValue) => {
    if (mode !== "BATCH_1") return;

    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.isExtraItem) return item;
        const val = rawValue;
        const num = parseFloat(val);

        if (!isNaN(num) && num > 0) {
          const isDiscrete = isDiscreteUnit(item.unit);
          const isKg = isKgUnit(item.unit);
          const rateInItemUnit = isKg ? num / 1000 : num;
          const newStdQty = calcBatchQty(
            rateInItemUnit,
            batch1Portions,
            item.unit,
          );
          const extra = Number(item.extraQty) || 0;
          const total = Number((newStdQty + extra).toFixed(3));

          return {
            ...item,
            portionInput: val,
            qtyPerPortion: rateInItemUnit,
            standardQty: newStdQty,
            standardQtyInput: String(newStdQty),
            batchQty: total,
          };
        }

        return {
          ...item,
          portionInput: val,
        };
      }),
    );
  };

  // 2. Chỉnh sửa Số lượng theo suất (CHỈ ÁP DỤNG ĐỢT 1) -> Tự động tính lại Định lượng trên 1 suất
  const handleStandardQtyChange = (id, rawValue) => {
    if (mode !== "BATCH_1") return;

    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.isExtraItem) return item;
        const val = rawValue;
        const num = parseFloat(val);

        if (!isNaN(num) && num > 0 && batch1Portions > 0) {
          const isDiscrete = isDiscreteUnit(item.unit);
          const isKg = isKgUnit(item.unit);
          const finalStdQty = num;
          const newPortion = calcQtyPerPortion(finalStdQty, batch1Portions);
          const displayPortion = isKg
            ? Number((newPortion * 1000).toFixed(2))
            : newPortion;
          const extra = Number(item.extraQty) || 0;
          const total = Number((finalStdQty + extra).toFixed(3));

          return {
            ...item,
            standardQtyInput: val,
            standardQty: finalStdQty,
            qtyPerPortion: newPortion,
            portionInput: String(displayPortion),
            batchQty: total,
          };
        }

        return {
          ...item,
          standardQtyInput: val,
        };
      }),
    );
  };

  // 3. Chỉnh sửa Số lượng Giao thêm (CỘT MỚI: Giao thêm)
  const handleExtraQtyChange = (id, rawValue) => {
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const val = rawValue;
        const num = parseFloat(val);
        const isDiscrete = isDiscreteUnit(item.unit);

        if (!isNaN(num) && num >= 0) {
          const finalExtra = num;
          const std = Number(item.standardQty) || 0;
          const total = Number((std + finalExtra).toFixed(3));

          return {
            ...item,
            extraQtyInput: val,
            extraQty: finalExtra,
            batchQty: total,
          };
        }

        return {
          ...item,
          extraQtyInput: val,
          extraQty: 0,
          batchQty: Number(item.standardQty) || 0,
        };
      }),
    );
  };

  const handlePortionBlur = (id) => {
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const num = parseFloat(item.portionInput);
        if (isNaN(num) || num <= 0) {
          const isKg = isKgUnit(item.unit);
          const fallback = isKg
            ? Number((Number(item.qtyPerPortion) * 1000).toFixed(2))
            : item.qtyPerPortion;
          return {
            ...item,
            portionInput: String(fallback),
          };
        }
        return item;
      }),
    );
  };

  const handleStandardQtyBlur = (id) => {
    const candidate = itemsState.find((item) => item.id === id);
    if (candidate && quantityError(candidate.standardQtyInput)) return;
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const num = parseFloat(item.standardQtyInput);
        if (isNaN(num) || num <= 0) {
          return {
            ...item,
            standardQtyInput: String(item.standardQty),
          };
        }
        const finalVal = num;
        return {
          ...item,
          standardQty: finalVal,
          standardQtyInput: String(finalVal),
        };
      }),
    );
  };

  const handleExtraQtyBlur = (id) => {
    const candidate = itemsState.find((item) => item.id === id);
    if (
      candidate &&
      candidate.extraQtyInput &&
      quantityError(candidate.extraQtyInput) &&
      Number(candidate.extraQtyInput) !== 0
    )
      return;
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (!item.extraQtyInput || isNaN(parseFloat(item.extraQtyInput))) {
          return {
            ...item,
            extraQtyInput: item.extraQty > 0 ? String(item.extraQty) : "",
          };
        }
        return item;
      }),
    );
  };

  // Submit Đợt 1 (Chuyên biệt thực phẩm tươi sống trong ngày)
  const handleSubmitBatch1 = async () => {
    if (dateError) {
      notice({
        msg: dateError,
        isSuccess: false,
      });
      return;
    }
    if (!hasMenusInWeek || !activeMenus || activeMenus.length === 0) {
      notice({
        msg: "Tuần này chưa có thực đơn được duyệt từ bên Dinh dưỡng. Không thể tạo yêu cầu nhập hàng!",
        isSuccess: false,
      });
      return;
    }
    if (!isOrderAllowed) {
      notice({
        msg: `Chưa đủ thực đơn cho cả trường trong tuần này! Còn thiếu: ${menuCompleteness.missingGrades.join(", ")}. Vui lòng chờ Dinh dưỡng duyệt đủ hoặc xác nhận không ăn bán trú.`,
        isSuccess: false,
      });
      return;
    }
    if (itemsState.length === 0) {
      notice({
        msg: "Không có nguyên liệu nào để tạo yêu cầu nhập hàng!",
        isSuccess: false,
      });
      return;
    }
    const invalidItem = itemsState.find(
      (item) =>
        quantityError(item.batchQty) ||
        (!item.isExtraItem &&
          mode === "BATCH_1" &&
          quantityError(item.standardQtyInput)) ||
        (item.extraQtyInput &&
          Number(item.extraQtyInput) !== 0 &&
          quantityError(item.extraQtyInput)),
    );
    if (invalidItem) {
      notice({
        msg: `${invalidItem.name}: số lượng phải dương và tối đa 3 chữ số thập phân`,
        isSuccess: false,
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitBatch1({
        menuId: activeMenus[0].id,
        menuIds: activeMenus.map((m) => m.id),
        menus: activeMenus,
        menusSummary: activeMenus.map((m) => ({
          id: m.id,
          name: m.name,
          title: m.title,
          targetScope: m.targetScope,
          maxPortions: m.maxPortions,
        })),
        plannedPortions: totalBatch1Portions,
        maxPortions: totalMaxPortions,
        targetScope: activeMenus
          .map((m) => m.targetScope)
          .filter(Boolean)
          .join(" & "),
        orderDate,
        note,
        items: itemsState.map((it) => ({
          ingredientEntryId: it.ingredientEntryId || it.id,
          ingredientId: it.ingredientId || it.id,
          ingredientName: it.name,
          handlingType: it.handlingType || "DIRECT_USE",
          unit: it.unit,
          qtyPerPortion: it.qtyPerPortion || 0,
          standardQty: it.standardQty || 0,
          extraQty: it.extraQty || 0,
          orderedQty: it.batchQty,
          supplierId: it.supplierId,
          supplierName: it.supplierName,
          isCustomized: it.isCustomized || false,
          isExtraItem: it.isExtraItem || false,
          defaultQtyPerPortion: it.defaultQtyPerPortion,
          breakdown: it.breakdown || null,
        })),
      });
    } catch (error) {
      // Ví dụ: nguyên liệu không có trong danh mục trường hoặc trùng tên nhiều NCC; không đơn nào được tạo.
      notice({
        msg:
          error?.response?.data?.message ||
          error?.message ||
          "Không tạo được đơn đặt hàng.",
        isSuccess: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Đợt 2
  const handleSubmitBatch2 = async () => {
    if (dateError) {
      notice({
        msg: dateError,
        isSuccess: false,
      });
      return;
    }
    if (!hasMenusInWeek || !batch1ForDate || parsedAttendance <= 0 || !attendanceReady) return;
    if (!isOrderAllowed) {
      notice({
        msg: `Chưa đủ thực đơn cho cả trường trong tuần này! Còn thiếu: ${menuCompleteness.missingGrades.join(", ")}. Không thể tạo yêu cầu nhập hàng Đợt 2.`,
        isSuccess: false,
      });
      return;
    }
    if (itemsState.length === 0) {
      notice({
        msg: "Không có nguyên liệu nào để tạo yêu cầu nhập hàng!",
        isSuccess: false,
      });
      return;
    }
    const invalidItem = itemsState.find(
      (item) =>
        quantityError(item.batchQty) ||
        (!item.isExtraItem &&
          mode === "BATCH_1" &&
          quantityError(item.standardQtyInput)) ||
        (item.extraQtyInput &&
          Number(item.extraQtyInput) !== 0 &&
          quantityError(item.extraQtyInput)),
    );
    if (invalidItem) {
      notice({
        msg: `${invalidItem.name}: số lượng phải dương và tối đa 3 chữ số thập phân`,
        isSuccess: false,
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitBatch2({
        batch1DeliveryId: batch1ForDate.id,
        actualAttendance: parsedAttendance,
        actualAttendanceByGrade: gradeAttendance,
        orderDate,
        note,
        items: itemsState.map((it) => ({
          ingredientEntryId: it.ingredientEntryId || it.id,
          ingredientId: it.ingredientId || it.id,
          ingredientName: it.name,
          handlingType: it.handlingType || "DIRECT_USE",
          unit: it.unit,
          qtyPerPortion: it.qtyPerPortion || 0,
          standardQty: it.standardQty || 0,
          extraQty: it.extraQty || 0,
          orderedQty: it.batchQty,
          supplierId: it.supplierId,
          supplierName: it.supplierName,
          isCustomized: it.isCustomized || false,
          isExtraItem: it.isExtraItem || false,
          defaultQtyPerPortion: it.defaultQtyPerPortion,
          breakdown: it.breakdown || null,
        })),
      });
    } catch (error) {
      // Ví dụ: nguyên liệu không có trong danh mục trường hoặc trùng tên nhiều NCC; không đơn nào được tạo.
      notice({
        msg:
          error?.response?.data?.message ||
          error?.message ||
          "Không tạo được đơn đặt hàng.",
        isSuccess: false,
      });
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
      {/* 1. Header Navigation */}
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
            <Box className={styles.titleWithIcon}>
              <Typography variant="h5" className={styles.mainTitle}>
                {mode === "BATCH_1" && "Tạo Yêu Cầu Mua Hàng Đợt 1"}
                {mode === "BATCH_2" && "Tạo Đơn Giao Hàng Đợt 2"}
                {mode === "COMPLETED" && "Trạng Thái Đơn Hàng Theo Ngày"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 2. Thanh chọn Ngày giao & Thực đơn */}
      <Paper className={styles.formCard} elevation={0}>
        <Box className={styles.formRow}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <TextField
              type="date"
              label="Ngày áp dụng / Ngày giao hàng"
              value={orderDate}
              onChange={(e) => {
                setOrderDate(e.target.value);
                setActualAttendance(""); // Reset sĩ số khi đổi ngày
              }}
              size="small"
              error={Boolean(dateError)}
              helperText={dateError}
              className={styles.dateInput}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: getTodayStr() },
              }}
            />
            {targetMonday && targetFriday && (
              <Chip
                icon={
                  <CalendarCheck
                    size={14}
                    color={
                      !hasMenusInWeek
                        ? "#dc2626"
                        : !menuCompleteness.isComplete
                          ? "#ea580c"
                          : "#1d4ed8"
                    }
                  />
                }
                label={
                  !hasMenusInWeek
                    ? `Tuần: ${formatDateVN(targetMonday)} – ${formatDateVN(targetFriday)} (Chưa có thực đơn)`
                    : !menuCompleteness.isComplete
                      ? `Tuần: ${formatDateVN(targetMonday)} – ${formatDateVN(targetFriday)} (Thiếu: ${menuCompleteness.missingGrades.join(", ")})`
                      : `Tuần: ${formatDateVN(targetMonday)} – ${formatDateVN(targetFriday)} (Đủ thực đơn toàn trường)`
                }
                size="small"
                sx={{
                  height: 24,
                  bgcolor: !hasMenusInWeek
                    ? "#fef2f2"
                    : !menuCompleteness.isComplete
                      ? "#fff7ed"
                      : "#eff6ff",
                  color: !hasMenusInWeek
                    ? "#b91c1c"
                    : !menuCompleteness.isComplete
                      ? "#c2410c"
                      : "#1e40af",
                  borderColor: !hasMenusInWeek
                    ? "#fecaca"
                    : !menuCompleteness.isComplete
                      ? "#fed7aa"
                      : "#bfdbfe",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  border: "1px solid",
                }}
              />
            )}
          </Box>

          {mode === "BATCH_1" ? (
            !hasMenusInWeek ? (
              <TextField
                label="Thực đơn áp dụng (Đã duyệt)"
                value="Tuần này chưa có thực đơn được duyệt từ Dinh dưỡng"
                className={styles.menuSelect}
                size="small"
                fullWidth
                disabled
                error
              />
            ) : isMultiMenuDate ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  flex: 1,
                }}
              >
                {matchingMenusForDate.map((menu) => (
                  <Chip
                    key={menu.id}
                    icon={<ChefHat size={16} color="#166534" />}
                    label={menu.name}
                    variant="outlined"
                    sx={{
                      py: 2.2,
                      px: 1,
                      borderRadius: 2,
                      bgcolor: "#f0fdf4",
                      borderColor: "#86efac",
                      fontWeight: 700,
                      color: "#166534",
                      fontSize: "0.875rem",
                    }}
                  />
                ))}
              </Box>
            ) : (
              <TextField
                select
                label="Thực đơn áp dụng (Đã duyệt)"
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className={styles.menuSelect}
                size="small"
                fullWidth
                disabled={!hasMenusInWeek}
              >
                {menusInCurrentWeek.map((menu) => (
                  <MenuItem key={menu.id} value={menu.id}>
                    {menu.name} — {menu.targetScope} ({menu.maxPortions} suất
                    chuẩn)
                  </MenuItem>
                ))}
              </TextField>
            )
          ) : (
            <Box sx={{ flex: 1 }}>
              {isMultiMenu ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  {activeMenus.map((menu) => (
                    <Chip
                      key={menu.id}
                      icon={<ChefHat size={16} color="#b45309" />}
                      label={menu.name}
                      variant="outlined"
                      sx={{
                        py: 2.2,
                        px: 1,
                        borderRadius: 2,
                        bgcolor: "#fffbeb",
                        borderColor: "#fde68a",
                        fontWeight: 700,
                        color: "#b45309",
                        fontSize: "0.875rem",
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <TextField
                  label="Thực đơn đã chọn"
                  value={
                    currentMenu
                      ? `${currentMenu.name} (${maxPortions} suất tối đa)`
                      : "Không có thực đơn hợp lệ"
                  }
                  size="small"
                  disabled
                  className={styles.menuSelect}
                  fullWidth
                  error={!hasMenusInWeek}
                />
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Cảnh báo khi tuần này chưa có thực đơn được duyệt từ bên Dinh dưỡng */}
      {!hasMenusInWeek && (
        <Alert
          severity="warning"
          sx={{
            my: 2,
            borderRadius: 2.5,
            border: "1px solid #fed7aa",
            bgcolor: "#fffbeb",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "#9a3412", mb: 0.5 }}
          >
            Tuần này chưa có thực đơn được phê duyệt!
          </Typography>
          <Typography variant="body2" sx={{ color: "#c2410c" }}>
            Hệ thống không tìm thấy thực đơn đã duyệt (APPROVED) cho tuần từ{" "}
            <strong>{formatDateVN(targetMonday)}</strong> đến{" "}
            <strong>{formatDateVN(targetFriday)}</strong>. Vui lòng kiểm tra lại
            với chuyên viên Dinh dưỡng hoặc BGH để phê duyệt thực đơn tuần trước
            khi lập yêu cầu nhập hàng.
          </Typography>
        </Alert>
      )}

      {/* =====================================================================
          CASE 3: NGÀY ĐÓ ĐÃ CÓ CẢ 2 ĐỢT (HOÀN TẤT)
          ===================================================================== */}
      {mode === "COMPLETED" && (
        <Paper className={styles.completedCard} elevation={0}>
          <Box className={styles.completedHeader}>
            <CalendarCheck size={36} className={styles.completedIcon} />
            <Box>
              <Typography variant="h6" className={styles.completedTitle}>
                Ngày {formatDateVN(orderDate)} Đã Hoàn Thành Lập Cả 2 Đợt Giao
                Hàng!
              </Typography>
              <Typography variant="body2" className={styles.completedDesc}>
                Đơn hàng đã được chia 2 đợt đầy đủ: Đợt 1 (
                {batch1ForDate?.plannedPortions} suất lúc 05:30) và Đợt 2 (
                {batch2ForDate?.plannedPortions} suất lúc 07:45 theo sĩ số
                GVCN).
              </Typography>
            </Box>
          </Box>

          <Box className={styles.completedActions}>
            <Button variant="outlined" onClick={onBack}>
              Quay lại danh sách phiếu
            </Button>
            <Button
              variant="contained"
              onClick={() => setOrderDate(getNextSchoolDay(orderDate))}
            >
              Chọn ngày tiếp theo ({formatDateVN(getNextSchoolDay(orderDate))})
            </Button>
          </Box>
        </Paper>
      )}

      {/* =====================================================================
          CASE 4: ĐỢT 1 ĐÃ BỊ HỦY (TỪ 2 BÊN TỪ CHỐI TRỞ LÊN)
          ===================================================================== */}
      {mode === "BATCH_1_CANCELLED" && (
        <Paper className={styles.completedCard} elevation={0}>
          <Box className={styles.completedHeader}>
            <AlertTriangle size={36} color="#dc2626" />
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#dc2626", fontWeight: 700 }}
              >
                Đợt 1 Ngày {formatDateVN(orderDate)} Đã Bị Hủy Nghiệm Thu!
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", mt: 0.5 }}>
                Đợt 1 của ngày này đã bị từ chối từ 2 bên trở lên trong Hội đồng
                4 bên nên đã hủy toàn bộ đơn. Không thể lập đơn giao hàng Đợt 2
                khi Đợt 1 không được nghiệm thu đạt chuẩn.
              </Typography>
            </Box>
          </Box>

          <Box className={styles.completedActions}>
            <Button variant="outlined" onClick={onBack}>
              Quay lại danh sách phiếu
            </Button>
          </Box>
        </Paper>
      )}

      {/* =====================================================================
          CASE 1: TẠO ĐỢT 1 (CHƯA CÓ ĐỢT 1)
          ===================================================================== */}
      {mode === "BATCH_1" && (
        <>
          {/* Card tóm tắt Đợt 1 */}
          <Box className={styles.batch1SummaryCard}>
            <Box className={styles.batchCardHeader}>
              <Typography variant="subtitle1" className={styles.batchCardTitle}>
                Quy Chuẩn Giao Hàng Đợt 1: Cố Định 50% Suất Tối Đa
              </Typography>
            </Box>
            <Typography variant="h4" className={styles.batchPortionCount}>
              {batch1Portions}{" "}
              <span className={styles.portionTotal}>/ {maxPortions}</span>{" "}
              <span className={styles.portionUnit}>suất ăn</span>
            </Typography>
            {isMultiMenu && (
              <Box sx={{ display: "flex", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
                {menusPortionsMeta.map((m) => (
                  <Chip
                    key={m.id}
                    label={`${m.targetScope}: ${m.batch1Portions} / ${m.maxPortions} suất (50%)`}
                    size="small"
                    sx={{
                      bgcolor: "#e0f2fe",
                      color: "#0369a1",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* BẢNG 1: THỰC PHẨM TƯƠI SỐNG (ĐỢT 1: 50% SUẤT) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Box>
                  <Typography
                    variant="subtitle1"
                    className={styles.tableHeading}
                  >
                    A. Thực Phẩm Tươi Sống Đợt 1 (50% Suất - Giao Sớm 05:30
                    Sáng)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={
                    isTableLoading
                      ? "Đang tải..."
                      : `${itemsState.length} mặt hàng`
                  }
                  size="small"
                  className={styles.freshItemCountBadge}
                />
              </Box>
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell>Tên thực phẩm</TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                    <TableCell align="center" style={{ width: 145 }}>
                      Định lượng / 1 Suất
                    </TableCell>
                    <TableCell
                      align="right"
                      className={styles.batch1Col}
                      style={{ width: 160 }}
                    >
                      SL theo suất
                      <br />({batch1Portions} suất)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isTableLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            py: 2,
                          }}
                        >
                          <FoodPrintLoading size="large" />
                          <Typography
                            variant="body2"
                            sx={{ color: "#64748b", fontWeight: 500 }}
                          >
                            Đang tải danh mục nguyên liệu theo thực đơn...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : itemsState.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Package size={36} color="#94a3b8" />
                          <Typography
                            variant="body2"
                            sx={{ color: "#64748b", fontWeight: 500 }}
                          >
                            Không có nguyên liệu trực tiếp (tươi sống) nào cho
                            ngày này.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemsState.map((ing) => {
                      const isDiscrete = isDiscreteUnit(ing.unit);
                      const isMulti = Boolean(
                        ing.breakdown && ing.breakdown.length > 1,
                      );
                      const isExpanded = Boolean(expandedRows[ing.id]);

                      return (
                        <React.Fragment key={ing.id}>
                          <TableRow hover className={styles.tableRow}>
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                className={styles.ingName}
                              >
                                {ing.name}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                className={styles.supplierText}
                              >
                                {ing.supplierName}
                              </Typography>
                            </TableCell>

                            {/* Cột 1: Định lượng / 1 Suất (Chuyển badge '2 thực đơn' qua đây, đổi nút thành 'Xem thêm') */}
                            <TableCell align="center">
                              {ing.isExtraItem ? (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#94a3b8", fontWeight: 500 }}
                                >
                                  —
                                </Typography>
                              ) : isMulti ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Chip
                                    icon={<Layers size={12} />}
                                    label={`${ing.breakdown.length} thực đơn`}
                                    size="small"
                                    onClick={() => toggleExpandRow(ing.id)}
                                    sx={{
                                      cursor: "pointer",
                                      bgcolor: "#eff6ff",
                                      color: "#1d4ed8",
                                      fontWeight: 700,
                                      fontSize: "0.75rem",
                                      height: 22,
                                      border: "1px solid #bfdbfe",
                                      "&:hover": { bgcolor: "#dbeafe" },
                                    }}
                                  />
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => toggleExpandRow(ing.id)}
                                    sx={{
                                      fontSize: "0.6875rem",
                                      p: 0,
                                      minWidth: 0,
                                      textTransform: "none",
                                      color: "#2563eb",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                                  </Button>
                                </Box>
                              ) : (
                                <Box className={styles.editableCellWrap}>
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={ing.portionInput}
                                    onChange={(e) =>
                                      handlePortionChange(
                                        ing.id,
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() => handlePortionBlur(ing.id)}
                                    className={styles.cellInput}
                                    slotProps={{
                                      htmlInput: {
                                        step: isKgUnit(ing.unit)
                                          ? "1"
                                          : "0.001",
                                        min: isKgUnit(ing.unit) ? "1" : "0.001",
                                        style: {
                                          textAlign: "right",
                                          padding: "6px 8px",
                                        },
                                      },
                                      input: {
                                        endAdornment: (
                                          <span
                                            className={styles.inputAdornment}
                                          >
                                            {getPortionUnit(ing.unit)}/suất
                                          </span>
                                        ),
                                      },
                                    }}
                                  />
                                </Box>
                              )}
                            </TableCell>

                            {/* Cột 2: Số lượng Đợt 1 (theo 50% suất) */}
                            <TableCell
                              align="right"
                              className={styles.batch1Cell}
                            >
                              {ing.isExtraItem ? (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#94a3b8", fontWeight: 500 }}
                                >
                                  —
                                </Typography>
                              ) : (
                                <Box className={styles.editableCellWrapRight}>
                                  <TextField
                                    type="number"
                                    size="small"
                                    value={ing.standardQtyInput}
                                    error={Boolean(
                                      quantityError(ing.standardQtyInput),
                                    )}
                                    helperText={
                                      <QuantityRecommendation
                                        value={ing.standardQtyInput}
                                        unit={ing.unit}
                                        units={unitCatalog.units}
                                        validate
                                      />
                                    }
                                    onChange={(e) =>
                                      handleStandardQtyChange(
                                        ing.id,
                                        e.target.value,
                                      )
                                    }
                                    onBlur={() => handleStandardQtyBlur(ing.id)}
                                    className={`${styles.cellInput} ${styles.batch1CellInput}`}
                                    slotProps={{
                                      htmlInput: {
                                        step: "any",
                                        min: "0.001",
                                        style: {
                                          textAlign: "right",
                                          padding: "6px 8px",
                                          fontWeight: 700,
                                        },
                                      },
                                      input: {
                                        endAdornment: (
                                          <span
                                            className={styles.inputAdornment}
                                          >
                                            {ing.unit}
                                          </span>
                                        ),
                                      },
                                    }}
                                  />
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Dòng mở rộng xem thêm chi tiết cho nguyên liệu đa thực đơn */}
                          {isExpanded && isMulti && (
                            <TableRow sx={{ bgcolor: "#f8fafc" }}>
                              <TableCell
                                colSpan={4}
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
                                    <Layers size={14} color="#2563eb" /> Chi
                                    tiết định lượng &amp; số lượng theo từng
                                    thực đơn / khối lớp:
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 2,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {ing.breakdown.map((b, bIdx) => (
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
                                            b.unit || ing.unit,
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
                                          = {b.calculatedQty}{" "}
                                          {isDiscrete
                                            ? b.unit || ing.unit
                                            : "kg"}
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
                    })
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          {/* Ghi chú & Footer Submit Đợt 1 */}
          <Paper className={styles.noteCard} elevation={0}>
            <TextField
              label="Ghi chú đơn hàng Đợt 1 gửi Nhà cung cấp"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              placeholder="Ghi chú về kiểm dịch, niêm phong xe lạnh..."
            />
          </Paper>

          <Box className={styles.footerWrap}>
            <Box className={styles.summaryBadges}>
              <Chip
                label={
                  isTableLoading
                    ? "Đang tải..."
                    : `${itemsState.length} mặt hàng tươi sống (100% Đồ tươi Đợt 1)`
                }
                size="small"
                className={styles.summaryFreshBadge}
              />
            </Box>

            <Box className={styles.footerActions}>
              <Button onClick={onBack} variant="outlined" color="inherit">
                Hủy bỏ
              </Button>
              <Tooltip
                title={
                  dateError
                    ? dateError
                    : !hasMenusInWeek
                      ? "Tuần này chưa có thực đơn được duyệt"
                      : !isOrderAllowed
                        ? `Nút bị khóa: Chưa đủ thực đơn toàn trường (Còn thiếu: ${menuCompleteness.missingGrades.join(", ")})`
                        : itemsState.length === 0
                          ? "Không có nguyên liệu tươi sống nào để tạo đơn"
                          : ""
                }
              >
                <span
                  style={{
                    cursor:
                      Boolean(dateError) || !hasMenusInWeek || !isOrderAllowed || itemsState.length === 0 || isTableLoading
                        ? "not-allowed"
                        : "default",
                    display: "inline-block",
                  }}
                >
                  <Button
                    onClick={handleSubmitBatch1}
                    variant="contained"
                    startIcon={
                      submitting ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Send size={18} />
                      )
                    }
                    disabled={
                      submitting ||
                      Boolean(dateError) ||
                      !hasMenusInWeek ||
                      !isOrderAllowed ||
                      activeMenus.length === 0 ||
                      itemsState.length === 0 ||
                      isTableLoading
                    }
                    className={styles.submitBtn}
                  >
                    {submitting ? "Đang gửi..." : "Tạo"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </>
      )}

      {/* =====================================================================
          CASE 2: ĐÃ CÓ ĐỢT 1 -> TỰ ĐỘNG CHUYỂN SANG FORM TẠO ĐỢT 2
          ===================================================================== */}
      {mode === "BATCH_2" && (
        <>
          {/* KHỐI ĐIỂM DANH & CHỐT SĨ SỐ GVCN (ĐIỀU KIỆN TIÊN QUYẾT ĐỂ CHỐT ĐỢT 2) */}
          <Paper className={styles.attendanceCard} elevation={0}>
            <Box className={styles.attendanceHeader}>
              <Box className={styles.attendanceTitleGroup}>
                <Users size={22} className={styles.attendanceIcon} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    className={styles.attendanceHeading}
                  >
                    Sĩ Số Ăn Bán Trú Thực Tế Từ Giáo Viên Chủ Nhiệm (GVCN)
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Eye size={16} />}
                onClick={() => setOpenClassDialog(true)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Xem danh sách các lớp (
                {attendanceSummary?.finalizedClasses || 0}/
                {attendanceSummary?.classes?.length || 0})
              </Button>
            </Box>

            <Box className={styles.attendanceBody}>
              <Box className={styles.attendanceStatsRow}>
                <Box className={styles.attendanceStatBox}>
                  <Typography variant="caption" color="text.secondary">
                    Sĩ số chốt từ GVCN:
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: parsedAttendance > 0 ? "#15803d" : "#64748b",
                      mt: 0.5,
                    }}
                  >
                    {attendanceLoading ? (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <FoodPrintLoading size={18} />
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", fontWeight: 500 }}
                        >
                          Đang tải sĩ số...
                        </Typography>
                      </Box>
                    ) : parsedAttendance > 0 ? (
                      `${parsedAttendance} học sinh`
                    ) : (
                      "0 học sinh"
                    )}
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ alignSelf: "center" }}
                >
                  -
                </Typography>

                <Box className={styles.attendanceStatBox}>
                  <Typography variant="caption" color="text.secondary">
                    Đợt 1 đã nhận (50%):
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1976d2", mt: 0.5 }}
                  >
                    {batch1Portions} suất
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  color="text.secondary"
                  sx={{ alignSelf: "center" }}
                >
                  =
                </Typography>

                <Box
                  className={`${styles.attendanceStatBox} ${styles.attendanceStatBoxHighlight}`}
                >
                  <Typography variant="caption" color="text.secondary">
                    Cần giao thêm Đợt 2:
                  </Typography>
                  <Typography
                    variant="h5"
                    className={styles.resultPortions}
                    sx={{ mt: 0.5 }}
                  >
                    {parsedAttendance > 0
                      ? `${remainingPortions} suất`
                      : "0 suất"}
                  </Typography>
                </Box>
              </Box>

              {/* Chi tiết phân bổ theo từng khối khi là đa thực đơn */}
              {isMultiMenu && (
                <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed #cbd5e1" }}>
                  <Box
                    onClick={() => setShowGradeBalance((prev) => !prev)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      py: 0.75,
                      px: 1,
                      borderRadius: 1.5,
                      transition: "all 0.2s ease",
                      bgcolor: showGradeBalance ? "#f1f5f9" : "transparent",
                      "&:hover": {
                        bgcolor: "#f1f5f9",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#334155",
                          fontSize: "0.8125rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        Chi tiết cân đối theo từng khối lớp:
                      </Typography>
                      <Chip
                        label={`${menusPortionsMeta.length} khối`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          bgcolor: "#e2e8f0",
                          color: "#475569",
                        }}
                      />
                    </Box>

                    <Button
                      size="small"
                      variant="text"
                      endIcon={
                        showGradeBalance ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#2563eb",
                        p: 0,
                        minWidth: 0,
                        "&:hover": {
                          bgcolor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {showGradeBalance ? "Thu gọn" : "Xem chi tiết"}
                    </Button>
                  </Box>

                  <Collapse in={showGradeBalance} timeout="auto">
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(260px, 1fr))",
                        gap: 1.5,
                        mt: 1.5,
                      }}
                    >
                      {menusPortionsMeta.map((m) => {
                        const info = remainingByMenu[m.id] || {
                          actual: 0,
                          remaining: 0,
                        };
                        return (
                          <Paper
                            key={m.id}
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: "#0f172a" }}
                            >
                              {m.targetScope || m.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Sĩ số: <strong>{info.actual}</strong> /{" "}
                                {info.maxPortions || m.maxPortions}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Đợt 1: <strong>{m.batch1Portions}</strong>
                              </Typography>
                              <Chip
                                label={`Đợt 2: +${info.remaining} suất`}
                                size="small"
                                color="warning"
                                sx={{
                                  fontWeight: 700,
                                  height: 22,
                                  fontSize: "0.75rem",
                                }}
                              />
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Box>
          </Paper>

          {/* MÀN NỔI (DIALOG): CHI TIẾT ĐIỂM DANH BÁO CƠM TỪNG LỚP */}
          <Dialog
            open={openClassDialog}
            onClose={() => setOpenClassDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Users size={22} color="#15803d" />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    Chi Tiết Điểm Danh Báo Cơm Các Lớp
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ngày: {formatDateVN(orderDate)} • Bữa trưa (LUNCH)
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={() => setOpenClassDialog(false)}
              >
                <X size={18} />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  mb: 2.5,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={`Tổng sĩ số chốt: ${attendanceSummary?.totalPortions || 0} học sinh`}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Đã chốt: ${attendanceSummary?.finalizedClasses || 0} lớp`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                {Number(attendanceSummary?.pendingClasses) > 0 && (
                  <Chip
                    label={`Chưa chốt: ${attendanceSummary.pendingClasses} lớp`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                <Table size="small">
                  <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: "12%" }}>
                        Lớp
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, width: "24%" }}>
                        GVCN
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, width: "16%" }}
                      >
                        Sĩ số đăng ký
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, width: "16%" }}
                      >
                        Sĩ số báo thực tế
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, width: "14%" }}
                      >
                        Trạng thái
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, width: "18%" }}>
                        Ghi chú / Dị ứng
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(attendanceSummary?.classes || []).length > 0 ? (
                      attendanceSummary.classes.map((cls, idx) => (
                        <TableRow key={cls.classId || idx} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {cls.className}
                          </TableCell>
                          <TableCell>
                            {cls.teacherName || "Chưa phân công"}
                          </TableCell>
                          <TableCell align="center">
                            {cls.registeredPortions || 0} hs
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 700,
                              color:
                                cls.status === "FINALIZED"
                                  ? "#15803d"
                                  : "inherit",
                            }}
                          >
                            {cls.status === "FINALIZED"
                              ? `${cls.actualPortions} suất`
                              : "—"}
                          </TableCell>
                          <TableCell align="center">
                            {cls.status === "FINALIZED" ? (
                              <Chip
                                label="Đã chốt"
                                size="small"
                                color="success"
                                sx={{
                                  height: 22,
                                  fontSize: 11,
                                  fontWeight: 500,
                                }}
                              />
                            ) : cls.status === "DRAFT" ? (
                              <Chip
                                label="Bản nháp"
                                size="small"
                                color="warning"
                                sx={{ height: 22, fontSize: 11 }}
                              />
                            ) : (
                              <Chip
                                label="Chưa báo"
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 22,
                                  fontSize: 11,
                                  color: "text.secondary",
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 12,
                              color: cls.allergyNotes
                                ? "#b91c1c"
                                : "text.secondary",
                            }}
                          >
                            {cls.allergyNotes || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 3, color: "text.secondary" }}
                        >
                          Chưa có thông tin điểm danh các lớp cho ngày này.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5 }}>
              <Button
                onClick={() => setOpenClassDialog(false)}
                variant="contained"
                color="inherit"
              >
                Đóng
              </Button>
            </DialogActions>
          </Dialog>

          {/* BẢNG NGUYÊN LIỆU TƯƠI SỐNG ĐỢT 2 (BÊ NGUYÊN TỪ ĐỢT 1, KHÔNG CÓ ĐỒ LƯU KHO) */}
          <Paper className={styles.tableCard} elevation={0}>
            <Box className={styles.tableCardHeader}>
              <Box className={styles.tableTitleGroup}>
                <Package size={18} className={styles.tableIcon} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    className={styles.tableHeading}
                  >
                    Bảng Thực Phẩm Tươi Sống Đợt 2
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={
                    isTableLoading
                      ? "Đang tải..."
                      : `Đợt 2: ${itemsState.length} mặt hàng`
                  }
                  size="small"
                  color={parsedAttendance > 0 ? "warning" : "default"}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Plus size={16} />}
                  onClick={() => setOpenAddModal(true)}
                  sx={{
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    bgcolor: "#ffffff",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                  }}
                >
                  + Thêm nguyên liệu
                </Button>
              </Box>
            </Box>

            <Box className={styles.tableWrapper}>
              <Table size="small" className={styles.ingTable}>
                <TableHead>
                  <TableRow className={styles.tableHeaderRow}>
                    <TableCell>Tên thực phẩm</TableCell>
                    <TableCell
                      align="right"
                      className={styles.batch2Col}
                      style={{ width: 160 }}
                    >
                      SL theo suất
                      <br />({remainingPortions} suất)
                    </TableCell>
                    <TableCell
                      align="right"
                      className={styles.extraCol}
                      style={{ width: 150 }}
                    >
                      Giao thêm
                    </TableCell>
                    <TableCell
                      align="right"
                      className={styles.totalCol}
                      style={{ width: 135 }}
                    >
                      Tổng Đợt 2
                    </TableCell>
                    <TableCell>Nhà cung cấp đối tác</TableCell>
                    <TableCell align="center" style={{ width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isTableLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            py: 2,
                          }}
                        >
                          <FoodPrintLoading size="large" />
                          <Typography
                            variant="body2"
                            sx={{ color: "#64748b", fontWeight: 500 }}
                          >
                            Đang tải danh mục nguyên liệu giao thêm Đợt 2...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : itemsState.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Package size={36} color="#94a3b8" />
                          <Typography
                            variant="body2"
                            sx={{ color: "#64748b", fontWeight: 500 }}
                          >
                            Không có nguyên liệu nào cần giao thêm cho Đợt 2.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    itemsState.map((ing) => {
                      const isDiscrete = isDiscreteUnit(ing.unit);
                      const isMulti = Boolean(
                        ing.breakdown && ing.breakdown.length > 1,
                      );
                      const isExpanded = Boolean(expandedRows[ing.id]);

                      return (
                        <React.Fragment key={ing.id}>
                          <TableRow hover className={styles.tableRow}>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  className={styles.ingName}
                                >
                                  {ing.name}
                                </Typography>
                                {ing.isExtraItem && (
                                  <Chip
                                    label="Giao thêm ngoài"
                                    size="small"
                                    color="warning"
                                    sx={{
                                      height: 20,
                                      fontSize: "0.6875rem",
                                      fontWeight: 700,
                                    }}
                                  />
                                )}
                                {isMulti && (
                                  <Box
                                    sx={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                    }}
                                  >
                                    <Chip
                                      icon={<Layers size={12} />}
                                      label={`${ing.breakdown?.length || 2} thực đơn`}
                                      size="small"
                                      onClick={() => toggleExpandRow(ing.id)}
                                      sx={{
                                        cursor: "pointer",
                                        bgcolor: "#eff6ff",
                                        color: "#1d4ed8",
                                        fontWeight: 700,
                                        fontSize: "0.75rem",
                                        height: 22,
                                        border: "1px solid #bfdbfe",
                                        "&:hover": { bgcolor: "#dbeafe" },
                                      }}
                                    />
                                    <Button
                                      size="small"
                                      variant="text"
                                      onClick={() => toggleExpandRow(ing.id)}
                                      sx={{
                                        fontSize: "0.6875rem",
                                        p: 0,
                                        minWidth: 0,
                                        textTransform: "none",
                                        color: "#2563eb",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            </TableCell>

                            {/* Cột 2: Số lượng theo suất Đợt 2 (KHÓA: Tự động tính theo Sĩ số bù, không cho sửa) */}
                            <TableCell
                              align="right"
                              className={styles.batch2Cell}
                            >
                              {ing.isExtraItem ? (
                                <Typography
                                  variant="body2"
                                  sx={{ color: "#94a3b8", fontWeight: 500 }}
                                >
                                  —
                                </Typography>
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  className={styles.batch2QtyText}
                                >
                                  {ing.standardQty} {ing.unit}
                                </Typography>
                              )}
                            </TableCell>

                            {/* Cột 3: Giao thêm (Cột riêng để biết thêm bao nhiêu) */}
                            <TableCell
                              align="right"
                              className={styles.extraCell}
                            >
                              <Box className={styles.editableCellWrapRight}>
                                <TextField
                                  type="number"
                                  size="small"
                                  placeholder="0"
                                  value={ing.extraQtyInput}
                                  error={Boolean(
                                    ing.extraQtyInput &&
                                    Number(ing.extraQtyInput) !== 0 &&
                                    quantityError(ing.extraQtyInput),
                                  )}
                                  helperText={
                                    <QuantityRecommendation
                                      value={
                                        ing.extraQtyInput &&
                                          Number(ing.extraQtyInput) !== 0 &&
                                          quantityError(ing.extraQtyInput)
                                          ? ing.extraQtyInput
                                          : ing.batchQty
                                      }
                                      unit={ing.unit}
                                      units={unitCatalog.units}
                                      validate
                                    />
                                  }
                                  onChange={(e) =>
                                    handleExtraQtyChange(ing.id, e.target.value)
                                  }
                                  onBlur={() => handleExtraQtyBlur(ing.id)}
                                  className={`${styles.cellInput} ${styles.extraCellInput}`}
                                  slotProps={{
                                    htmlInput: {
                                      step: "any",
                                      min: "0",
                                      style: {
                                        textAlign: "right",
                                        padding: "6px 8px",
                                        fontWeight: 700,
                                        color:
                                          ing.extraQty > 0
                                            ? "#15803d"
                                            : "#64748b",
                                      },
                                    },
                                    input: {
                                      endAdornment: (
                                        <span
                                          className={styles.inputAdornment}
                                          style={{
                                            color:
                                              ing.extraQty > 0
                                                ? "#15803d"
                                                : "#64748b",
                                          }}
                                        >
                                          {ing.unit}
                                        </span>
                                      ),
                                    },
                                  }}
                                />
                              </Box>
                            </TableCell>

                            {/* Cột 4: Tổng SL Đợt 2 (= Theo suất + Giao thêm) */}
                            <TableCell
                              align="right"
                              className={styles.totalCell}
                            >
                              <Typography
                                variant="subtitle2"
                                className={styles.totalQtyText}
                              >
                                {ing.batchQty} {ing.unit}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                className={styles.supplierText}
                              >
                                {ing.supplierName}
                              </Typography>
                            </TableCell>

                            {/* Cột thao tác xóa nếu là hàng giao thêm ngoài */}
                            <TableCell align="center">
                              {ing.isExtraItem ? (
                                <Tooltip title="Xóa món giao thêm" arrow>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleRemoveExtraIngredient(ing.id)
                                    }
                                    sx={{ p: 0.5 }}
                                  >
                                    <Trash2 size={16} />
                                  </IconButton>
                                </Tooltip>
                              ) : null}
                            </TableCell>
                          </TableRow>

                          {/* Dòng mở rộng phân rã chi tiết cho nguyên liệu đa thực đơn */}
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
                                    <Layers size={14} color="#2563eb" /> Chi
                                    tiết định lượng &amp; số lượng theo từng
                                    thực đơn / khối lớp (Đợt 2):
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      gap: 2,
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {ing.breakdown.map((b, bIdx) => (
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
                                          {b.portions} suất bù ×{" "}
                                          {formatPortionRate(
                                            b.qtyPerPortion,
                                            b.unit || ing.unit,
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
                                          = {b.calculatedQty}{" "}
                                          {isDiscrete
                                            ? b.unit || ing.unit
                                            : "kg"}
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
                    })
                  )}
                </TableBody>
              </Table>
            </Box>
          </Paper>

          {/* Ghi chú & Footer Submit Đợt 2 */}
          <Paper className={styles.noteCard} elevation={0}>
            <TextField
              label="Ghi chú đơn giao hàng Đợt 2 gửi Nhà cung cấp"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              rows={2}
              fullWidth
              size="small"
              placeholder="Yêu cầu giao bù đúng 07:45 sáng, kiểm tra niêm phong xe lạnh..."
            />
          </Paper>

          <Box className={styles.footerWrap}>
            <Box className={styles.summaryBadges}>
              <Chip
                label={
                  isTableLoading
                    ? "Đang tải..."
                    : `${itemsState.length} mặt hàng (Đợt 2: ${remainingPortions} suất)`
                }
                size="small"
                className={styles.summaryFreshBadge}
              />
            </Box>

            <Box className={styles.footerActions}>
              <Button onClick={onBack} variant="outlined" color="inherit">
                Hủy bỏ
              </Button>

              {/* NÚT CHỐT ĐƠN ĐỢT 2: CHỈ BẤM ĐƯỢC KHI ĐÃ CÓ SĨ SỐ GVCN & NGÀY HỢP LỆ */}
              <Tooltip
                title={
                  dateError
                    ? dateError
                    : !isOrderAllowed
                      ? `Nút bị khóa: Chưa đủ thực đơn toàn trường (Còn thiếu: ${menuCompleteness.missingGrades.join(", ")})`
                      : !attendanceReady
                        ? `Nút bị khóa: còn ${unfinalizedClasses.length || "các"} lớp chưa chốt điểm danh${unfinalizedClasses.length ? ` (${unfinalizedClasses.map((cls) => cls.className).join(", ")})` : ""}`
                        : parsedAttendance <= 0
                          ? "Nút bị khóa: Vui lòng nhập sĩ số GVCN báo để chốt đơn Đợt 2"
                          : itemsState.length === 0
                            ? "Không có nguyên liệu nào để tạo đơn"
                            : ""
                }
              >
                <span
                  style={{
                    cursor:
                      Boolean(dateError) ||
                        submitting ||
                        parsedAttendance <= 0 ||
                        !attendanceReady ||
                        !hasMenusInWeek ||
                        !isOrderAllowed ||
                        itemsState.length === 0 ||
                        isTableLoading
                        ? "not-allowed"
                        : "default",
                    display: "inline-block",
                  }}
                >
                  <Button
                    onClick={handleSubmitBatch2}
                    variant="contained"
                    color="warning"
                    startIcon={
                      submitting ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <Send size={18} />
                      )
                    }
                    disabled={
                      submitting ||
                      Boolean(dateError) ||
                      parsedAttendance <= 0 ||
                      !attendanceReady ||
                      !hasMenusInWeek ||
                      !isOrderAllowed ||
                      itemsState.length === 0 ||
                      isTableLoading
                    }
                    className={styles.submitBtnBatch2}
                  >
                    {submitting ? "Đang gửi..." : "Tạo"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>
        </>
      )}

      {/* MODAL THÊM NGUYÊN LIỆU GIAO THÊM */}
      <Dialog
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setSelectedIngredient(null);
          setExtraQtyInput("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          Thêm Nguyên Liệu Giao Thêm
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Tìm chọn nguyên liệu trong danh mục chuẩn và nhập số lượng cần giao
            thêm cho đợt giao này.
          </Typography>

          <Autocomplete
            options={catalogOptions}
            getOptionLabel={(opt) => `${opt.name} (${opt.category})`}
            value={selectedIngredient}
            onChange={(e, val) => {
              setSelectedIngredient(val);
              if (val) {
                const isDiscrete = isDiscreteUnit(val.defaultUnit || val.unit);
                setExtraQtyInput(isDiscrete ? "1" : "5");
              } else {
                setExtraQtyInput("");
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tìm & chọn nguyên liệu"
                placeholder="Nhập tên thịt, rau củ, quả, trứng, gia vị..."
                size="small"
                autoFocus
              />
            )}
            renderOption={(props, option) => {
              const { key, ...restProps } = props;
              return (
                <li key={key || option.id} {...restProps}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {option.name}
                      </Typography>
                      <Chip
                        label={option.defaultUnit || option.unit || "kg"}
                        size="small"
                        sx={{ fontSize: "0.7rem", height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {option.category} • NCC: {option.supplierName}
                    </Typography>
                  </Box>
                </li>
              );
            }}
          />

          {selectedIngredient && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#f8fafc",
                borderRadius: 1.5,
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.5 }}
              >
                Thông tin đối tác cung cấp:
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "#1e293b" }}
              >
                {selectedIngredient.supplierName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đơn vị:{" "}
                {selectedIngredient.defaultUnit || selectedIngredient.unit}
              </Typography>
            </Box>
          )}

          <TextField
            type="number"
            label="Số lượng cần giao thêm"
            value={extraQtyInput}
            onChange={(e) => setExtraQtyInput(e.target.value)}
            size="small"
            disabled={!selectedIngredient}
            slotProps={{
              htmlInput: {
                step: "any",
                min: "0.001",
                style: { fontWeight: 700 },
              },
              input: {
                endAdornment: (
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", fontWeight: 600, ml: 1 }}
                  >
                    {selectedIngredient?.defaultUnit ||
                      selectedIngredient?.unit ||
                      ""}
                  </Typography>
                ),
              },
            }}
            helperText={
              <QuantityRecommendation
                value={extraQtyInput}
                unit={
                  selectedIngredient?.defaultUnit || selectedIngredient?.unit
                }
                units={unitCatalog.units}
                validate={Boolean(extraQtyInput)}
              />
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => {
              setOpenAddModal(false);
              setSelectedIngredient(null);
              setExtraQtyInput("");
            }}
            variant="outlined"
            color="inherit"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleAddExtraIngredient}
            variant="contained"
            disabled={
              !selectedIngredient ||
              !extraQtyInput ||
              Number(extraQtyInput) <= 0
            }
            sx={{ bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" } }}
          >
            Thêm vào bảng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

CreateDeliveryView.propTypes = {
  menus: PropTypes.array,
  deliveries: PropTypes.array,
  initialDate: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onSubmitBatch1: PropTypes.func.isRequired,
  onSubmitBatch2: PropTypes.func.isRequired,
};
