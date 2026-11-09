import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER from "src/router/ROUTER";
import MenuService from "src/services/MenuService";
import KitchenService from "src/services/KitchenService";
import CreateBatchHeader from "./component/CreateBatchHeader";
import BasicInfoSection from "./component/BasicInfoSection";
import ProposedBatchSection from "./component/ProposedBatchSection";
import CreateBatchFooter from "./component/CreateBatchFooter";
import styles from "./index.module.scss";

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm - Nấu Chung (Nhân viên Bếp)
 * Kết nối dữ liệu thực tế từ thực đơn đã duyệt hôm nay của trường.
 */
export default function CreateBatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dishes, setDishes] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("lunch");
  const [selectedDish, setSelectedDish] = useState(null);
  const [portions, setPortions] = useState(0);

  // Tải danh sách món ăn từ thực đơn đã duyệt hôm nay
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadTodayDishes = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

        const [scheduleRes, batchesRes] = await Promise.all([
          MenuService.getWeekSchedule(todayISO),
          KitchenService.getBatches({ date: todayISO, limit: 100 }, { signal: controller.signal }),
        ]);

        if (!active) return;

        const existingBatches = batchesRes?.items || [];
        const todayDay = scheduleRes?.data?.days?.find(d => d.date === todayISO);
        const demandByMeal = {};
        const loadedDishes = [];
        if (todayDay?.status === "APPROVED" && todayDay.meals) {
          await Promise.all(["LUNCH", "AFTERNOON"].filter(type => todayDay.meals[type]?.dishes?.length).map(async type => {
            demandByMeal[type] = await MenuService.getMealRequirements(todayDay.menuDayId, type);
          }));
          if (!active) return;
          const lunchDishes = todayDay.meals.LUNCH?.dishes || [];
          lunchDishes.forEach((d, idx) => {
            const matchedBatch = existingBatches.find(
              (b) => (b.dishId === d.id || b.dishId === d.dishId) && b.mealType === "LUNCH"
            );
            loadedDishes.push({
              id: d.id || d.dishId || `dish-lunch-${idx}`,
              dishId: d.dishId || d.id,
              menuDayId: todayDay.menuDayId,
              mealType: "lunch",
              mealName: "Bữa trưa",
              name: d.name,
              portionStandard: demandByMeal.LUNCH?.dishPortions?.[d.dishId || d.id] ?? 0,
              isBatchCreated: Boolean(matchedBatch),
              batchCode: matchedBatch?.batchCode || "",
              ingredients: d.ingredients || [],
            });
          });

          const afternoonDishes = todayDay.meals.AFTERNOON?.dishes || [];
          afternoonDishes.forEach((d, idx) => {
            const matchedBatch = existingBatches.find(
              (b) => (b.dishId === d.id || b.dishId === d.dishId) && b.mealType === "AFTERNOON"
            );
            loadedDishes.push({
              id: d.id || d.dishId || `dish-afternoon-${idx}`,
              dishId: d.dishId || d.id,
              menuDayId: todayDay.menuDayId,
              mealType: "afternoon",
              mealName: "Bữa xế",
              name: d.name,
              portionStandard: demandByMeal.AFTERNOON?.dishPortions?.[d.dishId || d.id] ?? 0,
              isBatchCreated: Boolean(matchedBatch),
              batchCode: matchedBatch?.batchCode || "",
              ingredients: d.ingredients || [],
            });
          });
        }

        setDishes(loadedDishes);
        const initialPending =
          loadedDishes.find((d) => !d.isBatchCreated && d.mealType === "lunch") ||
          loadedDishes.find((d) => !d.isBatchCreated) ||
          loadedDishes[0] ||
          null;

        setSelectedDish(initialPending);
        if (initialPending?.portionStandard) {
          setPortions(initialPending.portionStandard);
        }
      } catch (err) {
        console.warn("Lỗi tải món ăn hôm nay:", err);
        if (active) { setDishes([]); setLoadError(err.message); }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTodayDishes();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  // Xử lý tạo lô thành công và chuyển ngay sang món chưa tạo tiếp theo
  const handleBatchCreated = (dishId, createdBatch) => {
    const updatedDishes = dishes.map((d) => {
      if (d.id === dishId) {
        return {
          ...d,
          isBatchCreated: true,
          batchCode: createdBatch?.batchCode || d.batchCode || "ĐÃ TẠO LÔ",
        };
      }
      return d;
    });

    setDishes(updatedDishes);

    const nextInSameMeal = updatedDishes.find(
      (d) =>
        !d.isBatchCreated &&
        d.id !== dishId &&
        (selectedMeal === "all" || d.mealType === selectedMeal)
    );

    const nextAnyPending = updatedDishes.find(
      (d) => !d.isBatchCreated && d.id !== dishId
    );

    const nextPending = nextInSameMeal || nextAnyPending;

    if (nextPending) {
      if (nextPending.mealType !== selectedMeal && selectedMeal !== "all") {
        setSelectedMeal(nextPending.mealType);
      }
      setSelectedDish(nextPending);
      if (nextPending.portionStandard) {
        setPortions(nextPending.portionStandard);
      }
    } else {
      const current = updatedDishes.find((d) => d.id === dishId);
      if (current) setSelectedDish(current);
    }
  };

  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        {/* Header Bar */}
        <CreateBatchHeader />

        {loadError ? <p role="alert">{loadError}</p> : loading ? (
          <div className="py-16 text-center text-slate-500 font-medium">
            Đang tải thực đơn và phương án chế biến hôm nay...
          </div>
        ) : dishes.length === 0 ? (
          <div className="p-8 my-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-800 font-semibold text-lg mb-2">
              Chưa có thực đơn được duyệt cho ngày hôm nay
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Hệ thống không tìm thấy món ăn nào thuộc thực đơn đã duyệt. Vui lòng kiểm tra lại thực đơn với Nhân viên Dinh dưỡng hoặc Ban Giám Hiệu.
            </p>
            <button
              type="button"
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition"
              onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
            >
              Về danh sách lô chế biến
            </button>
          </div>
        ) : (
          <>
            {/* PHẦN 1: THÔNG TIN PHIÊN NẤU & BỘ CHỌN MÓN ĐA CA ĂN */}
            <BasicInfoSection
              dishes={dishes}
              selectedDish={selectedDish}
              setSelectedDish={setSelectedDish}
              portions={portions}
              setPortions={setPortions}
              selectedMeal={selectedMeal}
              setSelectedMeal={setSelectedMeal}
            />

            {/* PHẦN 2: PHƯƠNG ÁN CHẾ BIẾN DỰ KIẾN */}
            <ProposedBatchSection
              selectedDish={selectedDish}
              dishes={dishes}
              selectedMeal={selectedMeal}
              setSelectedDish={setSelectedDish}
            />

            {/* CHÂN TRANG & THANH TÁC VỤ */}
            <CreateBatchFooter
              selectedDish={selectedDish}
              dishes={dishes}
              selectedMeal={selectedMeal}
              onBatchCreated={handleBatchCreated}
              onSelectNextDish={setSelectedDish}
            />
          </>
        )}
      </div>
    </div>
  );
}
