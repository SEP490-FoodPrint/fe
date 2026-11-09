import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  QrCode,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

import SchoolService from "src/services/SchoolService";

import MealDetailHeader from "./component/MealDetailHeader";
import MealDetailFilterBar from "./component/MealDetailFilterBar";
import AllergyPortionSection from "./component/AllergyPortionSection";
import MealDishesList from "./component/MealDishesList";
import DishIngredientsDetail from "./component/DishIngredientsDetail";
import { MOCK_SCHOOL_CLASSES } from "./component/mockClasses";
import { MOCK_NUTRITION_DAILY_MENU } from "./component/mockNutritionMenu";

import "./style.scss";

function parseIsoDate(isoStr) {
  if (!isoStr) return new Date();
  const parts = isoStr.split("-").map(Number);
  if (parts.length === 3) {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }
  return new Date(isoStr);
}

function getDayOfWeekName(date) {
  const day = date.getUTCDay();
  const names = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return names[day];
}

function formatDateDMY(date) {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Chuẩn hóa định lượng trên 1 suất ăn học sinh (loại bỏ số đếm tổng học sinh "450 suất")
function formatPerServingPortion(portionStr, defaultPortion) {
  if (!portionStr) return defaultPortion;
  const trimmed = String(portionStr).trim();
  // Nếu chỉ là số đếm tổng suất (ví dụ: "450 suất", "500 suất", "1 suất") -> dùng định lượng khẩu phần chuẩn
  if (/^\d+\s*suất$/i.test(trimmed)) {
    return defaultPortion;
  }
  if (!trimmed.includes("/suất") && (trimmed.includes("g") || trimmed.includes("ml"))) {
    return `${trimmed}/suất`;
  }
  return trimmed;
}

// Tìm món ăn tương ứng theo tên để tránh lệch nguyên liệu
function findFallbackDishByName(dishName, fallbackList) {
  if (!dishName || !Array.isArray(fallbackList)) return null;
  const lower = dishName.toLowerCase();
  return (
    fallbackList.find(
      (f) =>
        lower.includes(f.name.toLowerCase()) ||
        f.name.toLowerCase().includes(lower),
    ) || null
  );
}

function MealDetail() {
  const { schoolCode } = useParams();
  const outletContext = useOutletContext() || {};
  const school = outletContext.school || null;
  const activeCode = (
    outletContext.schoolCode ||
    schoolCode ||
    school?.code ||
    "SCH_ANH_DUONG"
  ).toUpperCase();

  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get("date") || "";

  const [dailyMenu, setDailyMenu] = useState(null);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState("1A1");
  const [currentMealType, setCurrentMealType] = useState("LUNCH");
  const [selectedDishId, setSelectedDishId] = useState("");

  const [traceModalOpen, setTraceModalOpen] = useState(false);
  const [tracingIngredient, setTracingIngredient] = useState(null);

  // Tải thực đơn ngày theo date query và tuần liên quan
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!activeCode) return;
      setLoading(true);
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          SchoolService.getDailyMealMenu(activeCode, dateParam),
          SchoolService.getWeeklyMenu(activeCode, dateParam),
        ]);

        if (isMounted) {
          const dailyData =
            dailyRes?.data && !dailyRes.data.data
              ? dailyRes.data
              : dailyRes?.data?.data || dailyRes?.data || null;

          const weeklyData =
            weeklyRes?.data && !weeklyRes.data.data
              ? weeklyRes.data
              : weeklyRes?.data?.data || weeklyRes?.data || null;

          setDailyMenu(dailyData);
          setWeeklyMenu(weeklyData);

          const firstDish = dailyData?.lunch?.dishes?.[0];
          if (firstDish) {
            setSelectedDishId(firstDish.id);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thực đơn:", err);
        if (isMounted) {
          setDailyMenu(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [activeCode, dateParam]);

  // Xác định ngày đang xem thực tế
  const activeDateIso = useMemo(() => {
    if (dailyMenu?.date) return dailyMenu.date;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return dateParam;
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }, [dailyMenu?.date, dateParam]);

  const activeDateObj = useMemo(
    () => parseIsoDate(activeDateIso),
    [activeDateIso],
  );

  // Nhãn ngày tiêu đề: "Thứ Ba, 03/11/2026"
  const dateLabel = useMemo(() => {
    if (dailyMenu?.dateLabel) return dailyMenu.dateLabel;
    const dayName = getDayOfWeekName(activeDateObj);
    const dmy = formatDateDMY(activeDateObj);
    return `${dayName}, ${dmy}`;
  }, [dailyMenu?.dateLabel, activeDateObj]);

  // Ngày bắt đầu tuần (Thứ Hai)
  const weekStartDateIso = useMemo(() => {
    if (dailyMenu?.weekStartDate) return dailyMenu.weekStartDate;
    if (weeklyMenu?.weekStartDate) return weeklyMenu.weekStartDate;

    const day = activeDateObj.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(activeDateObj);
    monday.setUTCDate(activeDateObj.getUTCDate() + diff);
    return monday.toISOString().slice(0, 10);
  }, [dailyMenu?.weekStartDate, weeklyMenu?.weekStartDate, activeDateObj]);

  const weekStartDateObj = useMemo(
    () => parseIsoDate(weekStartDateIso),
    [weekStartDateIso],
  );

  // Danh sách các tuần thực tế từ Backend
  const availableWeeks = useMemo(() => {
    const list = weeklyMenu?.availableWeeks || weeklyMenu?.available_weeks || [];
    if (Array.isArray(list) && list.length > 0) {
      return [...list].sort((a, b) =>
        (a.weekStartDate || "").localeCompare(b.weekStartDate || "")
      );
    }

    if (weekStartDateIso) {
      return [
        {
          id: weekStartDateIso,
          weekStartDate: weekStartDateIso,
          weekRange: weeklyMenu?.weekRange || "",
          title: "Tuần hiện tại",
          weekNumber: 1,
        },
      ];
    }
    return [];
  }, [weeklyMenu, weekStartDateIso]);

  // Danh sách các ngày trong tuần đang chọn (Thứ 2 - Thứ 6)
  const daysInWeek = useMemo(() => {
    const dayNames = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
    ];

    const availableDaysMap = new Set();
    if (weeklyMenu?.days) {
      for (const d of weeklyMenu.days) {
        if (d.dateIso) availableDaysMap.add(d.dateIso);
      }
    }

    const result = [];
    for (let i = 0; i < 5; i++) {
      const cur = new Date(weekStartDateObj);
      cur.setUTCDate(weekStartDateObj.getUTCDate() + i);
      const iso = cur.toISOString().slice(0, 10);
      const dd = String(cur.getUTCDate()).padStart(2, "0");
      const mm = String(cur.getUTCMonth() + 1).padStart(2, "0");
      const hasMenu = availableDaysMap.has(iso);

      result.push({
        date: iso,
        dayOfWeek: dayNames[i],
        dayOfMonth: `${dd}/${mm}`,
        hasMenu,
        isWeekend: false,
      });
    }

    return result;
  }, [weekStartDateObj, weeklyMenu?.days]);

  // Danh sách món ăn theo mealType (đồng bộ chính xác giữa món ăn, nguyên liệu và định lượng / suất)
  const lunchDishes = useMemo(() => {
    const apiLunch = dailyMenu?.lunch?.dishes;
    if (Array.isArray(apiLunch) && apiLunch.length > 0) {
      return apiLunch.map((d, index) => {
        const fallback =
          findFallbackDishByName(d.name, MOCK_NUTRITION_DAILY_MENU.lunch.dishes) ||
          MOCK_NUTRITION_DAILY_MENU.lunch.dishes[index % MOCK_NUTRITION_DAILY_MENU.lunch.dishes.length] ||
          {};

        const ingredientsText =
          d.mainIngredientsText ||
          (Array.isArray(d.ingredients) && d.ingredients.length > 0
            ? d.ingredients.map((i) => i.name).join(", ")
            : fallback.mainIngredientsText || "");

        const normalizedPortion = formatPerServingPortion(
          d.portion,
          fallback.portion || "120g/suất",
        );

        return {
          ...d,
          mainIngredientsText: ingredientsText,
          portion: normalizedPortion,
          ingredients:
            Array.isArray(d.ingredients) && d.ingredients.length > 0
              ? d.ingredients
              : fallback.ingredients || [],
        };
      });
    }
    return MOCK_NUTRITION_DAILY_MENU.lunch.dishes;
  }, [dailyMenu]);

  const snackDishes = useMemo(() => {
    const apiSnack = dailyMenu?.snack?.dishes;
    if (Array.isArray(apiSnack) && apiSnack.length > 0) {
      return apiSnack.map((d, index) => {
        const fallback =
          findFallbackDishByName(d.name, MOCK_NUTRITION_DAILY_MENU.snack.dishes) ||
          MOCK_NUTRITION_DAILY_MENU.snack.dishes[index % MOCK_NUTRITION_DAILY_MENU.snack.dishes.length] ||
          {};

        const ingredientsText =
          d.mainIngredientsText ||
          (Array.isArray(d.ingredients) && d.ingredients.length > 0
            ? d.ingredients.map((i) => i.name).join(", ")
            : fallback.mainIngredientsText || "");

        const normalizedPortion = formatPerServingPortion(
          d.portion,
          fallback.portion || "100g/suất",
        );

        return {
          ...d,
          mainIngredientsText: ingredientsText,
          portion: normalizedPortion,
          ingredients:
            Array.isArray(d.ingredients) && d.ingredients.length > 0
              ? d.ingredients
              : fallback.ingredients || [],
        };
      });
    }
    return MOCK_NUTRITION_DAILY_MENU.snack.dishes;
  }, [dailyMenu]);

  // Món đang được chọn để hiển thị nguyên liệu
  const currentDishes = currentMealType === "LUNCH" ? lunchDishes : snackDishes;
  const selectedDish = useMemo(() => {
    return (
      currentDishes.find((d) => d.id === selectedDishId) ||
      currentDishes[0] ||
      null
    );
  }, [currentDishes, selectedDishId]);

  // Xử lý đổi món
  const handleSelectDish = (dishId) => {
    setSelectedDishId(dishId);
  };

  // Xử lý đổi MealType (Bữa trưa / Bữa phụ)
  const handleSelectMealType = (type) => {
    setCurrentMealType(type);
    const targetDishes = type === "LUNCH" ? lunchDishes : snackDishes;
    if (targetDishes.length > 0) {
      setSelectedDishId(targetDishes[0].id);
    }
  };

  // Xử lý chọn tuần từ Dropdown
  const handleSelectWeek = (newWeekStart) => {
    if (newWeekStart) {
      setSearchParams({ date: newWeekStart });
    }
  };

  // Xử lý chọn ngày từ Dropdown
  const handleSelectDate = (newDate) => {
    if (newDate) {
      setSearchParams({ date: newDate });
    }
  };

  // Xử lý mở modal truy xuất nguồn gốc
  const handleTraceIngredient = (ingredient) => {
    setTracingIngredient(ingredient);
    setTraceModalOpen(true);
  };

  const hasMenuContent = Boolean(
    lunchDishes.length > 0 || snackDishes.length > 0,
  );

  return (
    <div className="mealDetailPage">
      <main className="mainContent">
        {loading ? (
          <div className="loadingWrapper">
            <CircularProgress
              size={36}
              sx={{ color: "var(--color-primary)" }}
            />
            <span>Đang tải thông tin chi tiết thực đơn...</span>
          </div>
        ) : (
          <>
            {/* 1. Tiêu đề trang & Ngữ cảnh */}
            <MealDetailHeader
              school={school}
              dateLabel={dateLabel}
              weekStartDate={formatDateDMY(weekStartDateObj)}
            />

            {/* 2. Thanh bộ lọc 3 Dropdowns: Tuần, Ngày, Lớp học */}
            <MealDetailFilterBar
              availableWeeks={availableWeeks}
              selectedWeekStartDate={weekStartDateIso}
              onSelectWeek={handleSelectWeek}
              daysInWeek={daysInWeek}
              selectedDate={activeDateIso}
              onSelectDate={handleSelectDate}
              classes={MOCK_SCHOOL_CLASSES}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
            />

            {/* 3. Khối 2 ROW riêng biệt: Row 1 Thực đơn món ăn, Row 2 Thành phần nguyên liệu */}
            <section className="mealDishesSection">
              <div className="contentContainer">
                {!hasMenuContent ? (
                  <div className="emptyStateCard">
                    <div className="emptyIconBox">
                      <UtensilsCrossed size={32} />
                    </div>
                    <Typography variant="h2" className="emptyTitle">
                      Chưa có thực đơn cho {dateLabel}
                    </Typography>
                    <p className="emptyDesc">
                      Nhà trường chưa cập nhật thực đơn hoặc chưa có lịch phục
                      vụ bán trú vào ngày này. Phụ huynh vui lòng chọn ngày khác
                      trong danh sách thả xuống ở bộ lọc bên trên.
                    </p>
                    {activeCode && (
                      <Link
                        to={`/school/${activeCode}#thuc-don-tuan`}
                        style={{
                          marginTop: 12,
                          padding: "8px 16px",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--color-primary)",
                          color: "var(--text-on-primary)",
                          fontWeight: 600,
                          fontSize: "var(--text-sm)",
                          textDecoration: "none",
                        }}
                      >
                        Xem thực đơn toàn tuần của trường
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="twoRowsLayout">
                    {/* Row 1: Thực đơn bữa ăn dạng Bảng gọn gàng (Table không border) */}
                    <div className="dishesRow">
                      <MealDishesList
                        lunchDishes={lunchDishes}
                        snackDishes={snackDishes}
                        currentMealType={currentMealType}
                        onSelectMealType={handleSelectMealType}
                        selectedDishId={selectedDish?.id || ""}
                        onSelectDish={handleSelectDish}
                      />
                    </div>

                    {/* Row 2: Thành phần nguyên liệu định lượng (Chiều rộng 100%) */}
                    <div className="ingredientsRow">
                      <DishIngredientsDetail
                        selectedDish={selectedDish}
                        onTraceIngredient={handleTraceIngredient}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 4. Khối thực đơn thay thế cho nhóm dị ứng (Tương tác click xem khẩu phần chi tiết) */}
            <AllergyPortionSection
              specialPortionGroups={dailyMenu?.specialPortionGroups || []}
              onTraceIngredient={handleTraceIngredient}
            />
          </>
        )}
      </main>

      {/* Modal Truy xuất nguồn gốc nguyên liệu */}
      <Dialog
        open={traceModalOpen}
        onClose={() => setTraceModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-2)",
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>
          Hồ sơ kiểm thực & Truy xuất nguồn gốc
        </DialogTitle>
        <DialogContent dividers>
          {tracingIngredient && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-primary-soft)",
                }}
              >
                <QrCode size={36} color="var(--color-primary)" />
                <div>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {tracingIngredient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Khẩu phần: {tracingIngredient.portion} •{" "}
                    {tracingIngredient.category}
                  </Typography>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck size={18} color="var(--color-primary)" />
                  <Typography variant="body2">
                    <strong>Tình trạng lưu mẫu:</strong> Đã lưu mẫu lưu nghiệm
                    theo quy chuẩn của Bộ Y tế
                  </Typography>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck size={18} color="var(--color-primary)" />
                  <Typography variant="body2">
                    <strong>Kiểm tra 3 bước:</strong> Bước 1 (Nhập liệu) • Bước
                    2 (Chế biến) • Bước 3 (Trước ăn)
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MealDetail;
