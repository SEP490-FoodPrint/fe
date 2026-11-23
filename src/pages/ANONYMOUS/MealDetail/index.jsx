import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
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
import {
  getPublicMealData,
  isPublicMealError,
  pickDefaultGradeId,
} from "src/utils/publicMeal";

import MealDetailHeader from "./component/MealDetailHeader";
import MealDetailFilterBar from "./component/MealDetailFilterBar";
import MealDishesTable from "./component/MealDishesTable";
import DishIngredientsModal from "./component/DishIngredientsModal";
import { gradeTracePath } from "src/services/TraceabilityService";
import { getWeekLabel } from "src/utils/weeklyMenu";

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

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get("date") || "";
  const blockParam = searchParams.get("block") || searchParams.get("grade") || "";

  const [dailyMenu, setDailyMenu] = useState(null);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [menuError, setMenuError] = useState(false);
  const [schoolGrades, setSchoolGrades] = useState([]);
  const [gradesLoaded, setGradesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Danh sách khối chỉ lấy từ danh mục khối gốc của trường (API /grades),
  // độc lập với thực đơn để vẫn hiển thị khi không có menu hoặc menu lỗi.
  // Không có lựa chọn "Toàn trường": thực đơn toàn trường hiển thị ở mọi khối.
  const gradeBlocks = useMemo(() => {
    const seen = new Set();
    return (schoolGrades || [])
      .filter((g) => {
        if (!g?.id || seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
      })
      .map((g) => ({ id: g.id, name: g.name, hasMenu: Boolean(g.hasMenu) }));
  }, [schoolGrades]);

  // Khối hợp lệ trên URL; null khi chưa tải xong hoặc tham số không phải khối của trường
  const resolvedBlockId = useMemo(
    () => (gradeBlocks.some((b) => b.id === blockParam) ? blockParam : null),
    [gradeBlocks, blockParam],
  );
  const selectedBlockId = resolvedBlockId || "";

  // Khi đã tải xong danh mục khối mà URL không có khối hợp lệ (trống, "all"
  // hoặc id nhóm suất ăn cũ), chuyển sang khối đầu tiên có thực đơn.
  useEffect(() => {
    if (!gradesLoaded || resolvedBlockId) return;
    const defaultBlockId = pickDefaultGradeId(gradeBlocks);
    if (!defaultBlockId && !blockParam) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("grade");
        if (defaultBlockId) next.set("block", defaultBlockId);
        else next.delete("block");
        return next;
      },
      { replace: true },
    );
  }, [gradesLoaded, resolvedBlockId, gradeBlocks, blockParam, setSearchParams]);

  const selectedBlockObj = useMemo(
    () => gradeBlocks.find((b) => b.id === selectedBlockId) || null,
    [gradeBlocks, selectedBlockId],
  );

  const selectedBlockName = selectedBlockObj?.name || "";

  const [currentMealType, setCurrentMealType] = useState("LUNCH");

  // Quản lý Popup Modal xem chi tiết nguyên liệu món ăn
  const [modalDish, setModalDish] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Danh mục khối gốc của trường: tải riêng, không phụ thuộc thực đơn
  useEffect(() => {
    let isMounted = true;
    setGradesLoaded(false);
    // hasMenu theo tuần của ngày đang xem khi mở trang, dùng để chọn khối mặc định
    SchoolService.getSchoolGrades(activeCode, dateParam || undefined)
      .then((res) => {
        if (!isMounted) return;
        const gradesData = res?.data?.data || res?.data || [];
        setSchoolGrades(Array.isArray(gradesData) ? gradesData : []);
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh sách khối:", err);
        if (isMounted) setSchoolGrades([]);
      })
      .finally(() => {
        if (isMounted) setGradesLoaded(true);
      });
    return () => {
      isMounted = false;
    };
    // Chỉ tải lại khi đổi trường; đổi ngày không cần đổi khối mặc định
  }, [activeCode]);

  // Luồng tải thực đơn ngày và tuần theo mã trường, ngày và khối đã chọn
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!activeCode || !gradesLoaded) return;
      // Chờ URL được chuẩn hóa sang khối hợp lệ trước khi tải thực đơn
      if (!resolvedBlockId && gradeBlocks.length > 0) return;
      setLoading(true);
      try {
        const gradeQuery = resolvedBlockId || undefined;
        const [dailyResult, weeklyResult] = await Promise.allSettled([
          SchoolService.getDailyMealMenu(activeCode, dateParam, gradeQuery),
          SchoolService.getWeeklyMenu(activeCode, dateParam, gradeQuery),
        ]);

        if (isMounted) {
          const dailyRes = dailyResult.status === "fulfilled" ? dailyResult.value : null;
          const weeklyRes = weeklyResult.status === "fulfilled" ? weeklyResult.value : null;

          setDailyMenu(getPublicMealData(dailyRes));
          setWeeklyMenu(getPublicMealData(weeklyRes));
          setMenuError(
            dailyResult.status === "rejected" || isPublicMealError(dailyRes),
          );
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu thực đơn:", err);
        if (isMounted) {
          setDailyMenu(null);
          setMenuError(true);
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
  }, [activeCode, dateParam, gradesLoaded, resolvedBlockId, gradeBlocks.length]);

  // Chọn tuần hoặc ngày sẽ đổi ?date=, giữ nguyên tham số khối.
  const handleSelectWeek = (newWeekStart) => {
    if (newWeekStart) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("date", newWeekStart);
        return next;
      });
    }
  };

  const handleSelectDate = (newDate) => {
    if (newDate) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("date", newDate);
        return next;
      });
    }
  };

  const handleSelectBlock = (newBlockId) => {
    if (newBlockId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("block", newBlockId);
        return next;
      });
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
    if (found) return getWeekLabel(found);
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

  // Truy xuất chung theo khối đang xem; dishId chọn sẵn món được bấm.
  const canTrace = Boolean(selectedBlockId && activeCode);
  const handleTraceDish = (dish) => {
    if (!canTrace) return;
    navigate(
      gradeTracePath({
        schoolCode: activeCode,
        gradeId: selectedBlockId,
        date: activeDateIso,
        mealType: currentMealType,
        dishId: dish?.id,
      }),
    );
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
              gradeName={selectedBlockName}
              onOpenTraceModal={
                canTrace && hasMenuContent ? () => handleTraceDish(null) : null
              }
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
              onSelectBlock={handleSelectBlock}
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
                      {menuError ? "Không tải được thực đơn cho" : "Chưa có thực đơn cho"}{" "}
                      {dayOfWeekName} ({formattedActiveDate})
                      {selectedBlockName
                        ? ` (${selectedBlockName})`
                        : ""}
                    </Typography>
                    {menuError ? (
                      <p className="emptyDesc">
                        Đã xảy ra lỗi khi tải thực đơn. Vui lòng thử lại sau hoặc
                        chọn ngày, khối khác trong bộ lọc bên trên.
                      </p>
                    ) : (
                      <p className="emptyDesc">
                        Nhà trường chưa cập nhật thực đơn hoặc chưa có lịch phục
                        vụ bán trú vào ngày này
                        {selectedBlockName
                          ? ` cho ${selectedBlockName}`
                          : ""}
                        . Phụ huynh vui lòng chọn ngày hoặc khối khác
                        trong danh sách thả xuống ở bộ lọc bên trên.
                      </p>
                    )}
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
                      onTraceDish={canTrace ? handleTraceDish : null}
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

// Chuẩn hóa định lượng trên 1 suất ăn học sinh (loại bỏ số đếm tổng học sinh "450 suất" và hậu tố "/suất")
function formatPerServingPortion(portionStr, defaultPortion) {
  if (!portionStr) return defaultPortion;
  const trimmed = String(portionStr).trim();
  // Nếu chỉ là số đếm tổng suất (ví dụ: "450 suất", "500 suất", "1 suất") -> dùng định lượng khẩu phần chuẩn
  if (/^\d+\s*suất$/i.test(trimmed)) {
    return defaultPortion;
  }
  return trimmed.replace(/\s*\/\s*suất$/i, "");
}

function normalizePublicDish(dish) {
  const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];
  const alternativeDish = dish.alternativeDish
    ? {
        ...dish.alternativeDish,
        portion: formatPerServingPortion(
          dish.alternativeDish.portion,
          dish.alternativeDish.portion || ""
        ),
      }
    : null;
  return {
    ...dish,
    portion: formatPerServingPortion(dish.portion, "Chưa có định lượng"),
    ingredients,
    mainIngredientsText:
      dish.mainIngredientsText ||
      ingredients.map((i) => i.name).filter(Boolean).join(", "),
    alternativeDish,
  };
}
