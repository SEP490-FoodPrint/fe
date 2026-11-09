import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTER from "src/router/ROUTER";
import MenuService from "src/services/MenuService";
import KitchenService from "src/services/KitchenService";
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader";
import BasicInfoSeparateSection from "./component/BasicInfoSeparateSection";
import ProposedSeparateBatchSection from "./component/ProposedSeparateBatchSection";
import CreateBatchSeparateFooter from "./component/CreateBatchSeparateFooter";
import styles from "./index.module.scss";

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến - Nấu Riêng Từng Lô (Nhân viên Bếp)
 * Kết nối dữ liệu thực tế từ thực đơn đã duyệt hôm nay của trường.
 */
export default function CreateBatchSeparate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dishes, setDishes] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("lunch");
  const [selectedDish, setSelectedDish] = useState(null);
  const [portions, setPortions] = useState(400);

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
          MenuService.getWeekSchedule(todayISO).catch(() => null),
          KitchenService.getBatches({ date: todayISO, limit: 100 }, { signal: controller.signal }).catch(() => ({ items: [] })),
        ]);

        if (!active) return;

        const existingBatches = batchesRes?.items || [];
        const todayDay =
          scheduleRes?.data?.days?.find((d) => d.date === todayISO || d.rawDate === todayISO) ||
          scheduleRes?.data?.days?.[0];

        const loadedDishes = [];
        if (todayDay && todayDay.meals) {
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
              portionStandard: d.portionStandard || 400,
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
              portionStandard: d.portionStandard || 400,
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
        setDishes([]);
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
        <CreateBatchSeparateHeader />

        {loading ? (
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
            <BasicInfoSeparateSection
              dishes={dishes}
              selectedDish={selectedDish}
              setSelectedDish={setSelectedDish}
              portions={portions}
              setPortions={setPortions}
              selectedMeal={selectedMeal}
              setSelectedMeal={setSelectedMeal}
            />

            <ProposedSeparateBatchSection
              selectedDish={selectedDish}
              dishes={dishes}
              selectedMeal={selectedMeal}
              setSelectedDish={setSelectedDish}
            />

            <CreateBatchSeparateFooter
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
