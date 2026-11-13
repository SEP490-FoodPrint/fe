import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  CircularProgress,
  Typography,
} from "@mui/material";
import { UtensilsCrossed } from "lucide-react";

import SchoolService from "src/services/SchoolService";

import MealDetailHeader from "./component/MealDetailHeader";
import MealDetailFilterBar from "./component/MealDetailFilterBar";
import MealDishesTable from "./component/MealDishesTable";
import DishIngredientsModal from "./component/DishIngredientsModal";
import {
  MOCK_GRADE_BLOCKS,
  resolveSchoolGradeBlocks,
} from "./component/mockGradeBlocks";

import "./style.scss";

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

  // Khối hiện chỉ là lựa chọn trên giao diện. Request thực đơn dùng mã trường và ngày.
  const gradeBlocks = useMemo(() => {
    return resolveSchoolGradeBlocks(
      school?.gradeBlocks || outletContext.gradeBlocks,
      school?.defaultGradeBlock || "Khối 1 - 3",
    );
  }, [school, outletContext.gradeBlocks]);

  const [selectedBlockId, setSelectedBlockId] = useState(
    () => MOCK_GRADE_BLOCKS[0]?.id || "BLOCK_1_3",
  );

  const [currentMealType, setCurrentMealType] = useState("LUNCH");

  // Quản lý Popup Modal xem chi tiết nguyên liệu món ăn
  const [modalDish, setModalDish] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Luồng tải chính: đồng bộ thực đơn ngày và tuần theo mã trường và ?date=.
  useEffect(() => {
    // Cleanup chặn phản hồi từ lượt tải cũ cập nhật state sau khi đổi trường hoặc ngày.
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

  // Chọn tuần hoặc ngày sẽ đổi ?date=, kích hoạt lại Effect tải thực đơn.
  const handleSelectWeek = (newWeekStart) => {
    if (newWeekStart) {
      setSearchParams({ date: newWeekStart });
    }
  };

  const handleSelectDate = (newDate) => {
    if (newDate) {
      setSearchParams({ date: newDate });
    }
  };

  // Dữ liệu cho tiêu đề và bộ lọc tuần/ngày.
  // Ưu tiên ngày API trả về, sau đó dùng ngày trên URL hoặc ngày hiện tại.
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

  const dayOfWeekName = useMemo(
    () => getDayOfWeekName(activeDateObj),
    [activeDateObj],
  );

  const formattedActiveDate = useMemo(
    () => formatDateDMY(activeDateObj),
    [activeDateObj],
  );

  // Xác định ngày Thứ 2 đầu tuần đang xem
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
        (a.weekStartDate || "").localeCompare(b.weekStartDate || ""),
      );
    }

    if (weekStartDateIso) {
      return [
        {
          id: weekStartDateIso,
          weekStartDate: weekStartDateIso,
          weekRange: weeklyMenu?.weekRange || "",
          title: "Tuần 1",
          weekNumber: 1,
        },
      ];
    }
    return [];
  }, [weeklyMenu, weekStartDateIso]);

  // Tiêu đề tuần đang chọn (VD: "Tuần 1" hoặc "Tuần 42")
  const currentWeekTitle = useMemo(() => {
    const found = availableWeeks.find(
      (w) => w.weekStartDate === weekStartDateIso,
    );
    if (found?.title) return found.title;
    if (weeklyMenu?.weekNumber) return `Tuần ${weeklyMenu.weekNumber}`;
    return "Tuần 1";
  }, [availableWeeks, weekStartDateIso, weeklyMenu]);

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

  // Chuẩn bị món theo từng bữa. Dữ liệu mẫu bổ sung chi tiết theo tên món.
  const lunchDishes = useMemo(() => (Array.isArray(dailyMenu?.lunch?.dishes) ? dailyMenu.lunch.dishes : []).map(normalizePublicDish), [dailyMenu]);
  const snackDishes = useMemo(() => (Array.isArray(dailyMenu?.snack?.dishes) ? dailyMenu.snack.dishes : []).map(normalizePublicDish), [dailyMenu]);

  const handleOpenDishModal = (dish) => {
    if (!dish) return;
    setModalDish(dish);
    setModalOpen(true);
  };

  const handleCloseDishModal = () => {
    setModalOpen(false);
    setModalDish(null);
  };

  const handleSelectMealType = (type) => {
    setCurrentMealType(type);
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
            {/* Tiêu đề lấy ngày và tuần đang xem */}
            <MealDetailHeader
              weekTitle={currentWeekTitle}
              dayOfWeek={dayOfWeekName}
              formattedDate={formattedActiveDate}
            />

            {/* 2. Thanh bộ lọc 3 Dropdowns: Tuần học, Ngày trong tuần, Khối */}
            <MealDetailFilterBar
              availableWeeks={availableWeeks}
              selectedWeekStartDate={weekStartDateIso}
              onSelectWeek={handleSelectWeek}
              daysInWeek={daysInWeek}
              selectedDate={activeDateIso}
              onSelectDate={handleSelectDate}
              gradeBlocks={gradeBlocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
            />

            {/* 3. Bảng Thực Đơn Học Đường Tích Hợp (Món chính + Món thay thế dị ứng) */}
            <section className="mealDishesSection">
              <div className="contentContainer">
                {!hasMenuContent ? (
                  <div className="emptyStateCard">
                    <div className="emptyIconBox">
                      <UtensilsCrossed size={32} />
                    </div>
                    <Typography variant="h2" className="emptyTitle">
                      Chưa có thực đơn cho {dayOfWeekName} ({formattedActiveDate})
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
                  <div className="tableLayoutWrapper">
                    <MealDishesTable
                      lunchDishes={lunchDishes}
                      snackDishes={snackDishes}
                      currentMealType={currentMealType}
                      onSelectMealType={handleSelectMealType}
                      onOpenDishModal={handleOpenDishModal}
                    />
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Chi tiết nguyên liệu của món đang chọn */}
      <DishIngredientsModal
        open={modalOpen}
        onClose={handleCloseDishModal}
        dish={modalDish}
      />
    </div>
  );
}

export default MealDetail;

// Hàm phụ định dạng ngày hiển thị và định lượng từng món.
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

function normalizePublicDish(dish) {
  const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];
  return {...dish,portion:formatPerServingPortion(dish.portion,"Ch\u01b0a c\u00f3 \u0111\u1ecbnh l\u01b0\u1ee3ng"),ingredients,mainIngredientsText:dish.mainIngredientsText || ingredients.map(i=>i.name).filter(Boolean).join(", "),alternativeDish:dish.alternativeDish || null};
}
