import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  CheckCircle2,
  QrCode,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";

import SchoolService from "src/services/SchoolService";

import MealDetailHeader from "./component/MealDetailHeader";
import WeekDayNavStrip from "./component/WeekDayNavStrip";
import AllergyPortionSection from "./component/AllergyPortionSection";
import MealDishesList from "./component/MealDishesList";
import DishIngredientsDetail from "./component/DishIngredientsDetail";

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

  // Chuỗi nhãn tuần lễ: DD/MM/YYYY - DD/MM/YYYY
  const weekRangeLabel = useMemo(() => {
    if (weeklyMenu?.weekRange) return weeklyMenu.weekRange;
    const friday = new Date(weekStartDateObj);
    friday.setUTCDate(weekStartDateObj.getUTCDate() + 4);
    return `${formatDateDMY(weekStartDateObj)} – ${formatDateDMY(friday)}`;
  }, [weeklyMenu?.weekRange, weekStartDateObj]);

  // Dải 7 ngày điều hướng (Thứ Hai -> Chủ Nhật)
  const resolvedWeekNav = useMemo(() => {
    if (dailyMenu?.weekNav && dailyMenu.weekNav.length > 0) {
      return dailyMenu.weekNav;
    }

    const availableDaysMap = new Set();
    if (weeklyMenu?.days) {
      for (const d of weeklyMenu.days) {
        if (d.dateIso) availableDaysMap.add(d.dateIso);
      }
    }

    const dayNames = [
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
      "Chủ Nhật",
    ];

    const result = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(weekStartDateObj);
      cur.setUTCDate(weekStartDateObj.getUTCDate() + i);
      const iso = cur.toISOString().slice(0, 10);
      const dd = String(cur.getUTCDate()).padStart(2, "0");
      const mm = String(cur.getUTCMonth() + 1).padStart(2, "0");
      const isWeekend = i >= 5;
      const hasMenu = availableDaysMap.has(iso);

      let status = "AVAILABLE";
      let statusLabel = "Có thực đơn";

      if (isWeekend) {
        status = "OFF_DUTY";
        statusLabel = "Nghỉ bán trú";
      } else if (iso === activeDateIso) {
        status = "SELECTED";
        statusLabel = "Đang xem";
      } else if (hasMenu) {
        status = "AVAILABLE";
        statusLabel = "Có thực đơn";
      } else {
        status = "OFF_DUTY";
        statusLabel = "Nghỉ bán trú";
      }

      result.push({
        date: iso,
        dayOfWeek: dayNames[i],
        dayOfMonth: `${dd}/${mm}`,
        status,
        statusLabel,
        isWeekend,
        hasMenu,
      });
    }

    return result;
  }, [dailyMenu?.weekNav, weeklyMenu?.days, weekStartDateObj, activeDateIso]);

  // Danh sách món ăn theo mealType
  const lunchDishes = useMemo(
    () => dailyMenu?.lunch?.dishes || [],
    [dailyMenu],
  );
  const snackDishes = useMemo(
    () => dailyMenu?.snack?.dishes || [],
    [dailyMenu],
  );

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

  // Xử lý đổi MealType (Bữa trưa / Bữa xế)
  const handleSelectMealType = (type) => {
    setCurrentMealType(type);
    const targetDishes = type === "LUNCH" ? lunchDishes : snackDishes;
    if (targetDishes.length > 0) {
      setSelectedDishId(targetDishes[0].id);
    }
  };

  // Xử lý chọn ngày trên dải tuần
  const handleSelectDate = (newDate) => {
    setSearchParams({ date: newDate });
  };

  // Xử lý chuyển tuần trước / sau
  const handlePrevWeek = () => {
    const curMonday = new Date(weekStartDateObj);
    curMonday.setUTCDate(curMonday.getUTCDate() - 7);
    const newDateStr = curMonday.toISOString().slice(0, 10);
    setSearchParams({ date: newDateStr });
  };

  const handleNextWeek = () => {
    const curMonday = new Date(weekStartDateObj);
    curMonday.setUTCDate(curMonday.getUTCDate() + 7);
    const newDateStr = curMonday.toISOString().slice(0, 10);
    setSearchParams({ date: newDateStr });
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

            {/* 2. Dải điều hướng Tuần & Ngày */}
            <WeekDayNavStrip
              weekNav={resolvedWeekNav}
              weekRange={weekRangeLabel}
              selectedDate={activeDateIso}
              onSelectDate={handleSelectDate}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
            />

            {/* 3. Khối Món ăn bữa & Chi tiết nguyên liệu (Master-Detail 5/12 - 7/12) */}
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
                      vụ bán trú vào ngày này. Phụ huynh vui lòng bấm chọn các
                      ngày có thực đơn trên dải tuần bên trên hoặc xem thực đơn
                      tuần.
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
                  <div className="masterDetailGrid">
                    <MealDishesList
                      lunchDishes={lunchDishes}
                      snackDishes={snackDishes}
                      currentMealType={currentMealType}
                      onSelectMealType={handleSelectMealType}
                      selectedDishId={selectedDish?.id || ""}
                      onSelectDish={handleSelectDish}
                    />

                    <DishIngredientsDetail
                      selectedDish={selectedDish}
                      onTraceIngredient={handleTraceIngredient}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* 4. Khối thực đơn thay thế cho nhóm dị ứng */}
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
                    24h tại tủ chuyên dụng
                  </Typography>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={18} color="var(--color-primary)" />
                  <Typography variant="body2">
                    <strong>Kiểm tra cảm quan:</strong> Đạt chuẩn tươi sống,
                    không phát hiện dị nguyên
                  </Typography>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 size={18} color="var(--color-primary)" />
                  <Typography variant="body2">
                    <strong>Hồ sơ nhà cung ứng:</strong> Có giấy chứng nhận đủ
                    điều kiện ATTP
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTraceModalOpen(false)}
            sx={{
              borderRadius: "var(--radius-md)",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MealDetail;
