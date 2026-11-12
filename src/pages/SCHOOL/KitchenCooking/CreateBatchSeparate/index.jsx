import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import notice from "src/components/Notice";
import ROUTER from "src/router/ROUTER";
import MenuService from "src/services/MenuService";
import KitchenService from "src/services/KitchenService";
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader";
import CreateBatchKanban from "../CreateBatch/component/CreateBatchKanban";
import CreateBatchDetailModal from "../CreateBatch/component/CreateBatchDetailModal";
import styles from "./index.module.scss";

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến - Nấu Riêng Từng Lô (Dạng Kanban)
 * Kết nối dữ liệu thực tế từ thực đơn đã duyệt hôm nay của trường.
 */
export default function CreateBatchSeparate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dishes, setDishes] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("all");
  const [selectedDish, setSelectedDish] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingDishId, setSubmittingDishId] = useState(null);

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
        const todayDay = scheduleRes?.data?.days?.find((d) => d.date === todayISO);
        const demandByMeal = {};
        const loadedDishes = [];
        if (todayDay?.status === "APPROVED" && todayDay.meals) {
          await Promise.all(
            ["LUNCH", "AFTERNOON"]
              .filter((type) => todayDay.meals[type]?.dishes?.length)
              .map(async (type) => {
                demandByMeal[type] = await MenuService.getMealRequirements(
                  todayDay.menuDayId,
                  type
                );
              })
          );
          if (!active) return;

          const lunchDishes = todayDay.meals.LUNCH?.dishes || [];
          lunchDishes.forEach((d, idx) => {
            const matchedBatch = existingBatches.find(
              (b) =>
                (b.dishId === d.id || b.dishId === d.dishId) &&
                b.mealType === "LUNCH"
            );
            loadedDishes.push({
              id: d.id || d.dishId || `dish-lunch-${idx}`,
              dishId: d.dishId || d.id,
              menuDayId: todayDay.menuDayId,
              mealType: "lunch",
              mealName: "Bữa trưa",
              name: d.name,
              portionStandard:
                demandByMeal.LUNCH?.dishPortions?.[d.dishId || d.id] ?? 0,
              isBatchCreated: Boolean(matchedBatch),
              batchCode: matchedBatch?.batchCode || "",
              batchId: matchedBatch?.id || "",
              ingredients: d.ingredients || [],
            });
          });

          const afternoonDishes = todayDay.meals.AFTERNOON?.dishes || [];
          afternoonDishes.forEach((d, idx) => {
            const matchedBatch = existingBatches.find(
              (b) =>
                (b.dishId === d.id || b.dishId === d.dishId) &&
                b.mealType === "AFTERNOON"
            );
            loadedDishes.push({
              id: d.id || d.dishId || `dish-afternoon-${idx}`,
              dishId: d.dishId || d.id,
              menuDayId: todayDay.menuDayId,
              mealType: "afternoon",
              mealName: "Bữa xế",
              name: d.name,
              portionStandard:
                demandByMeal.AFTERNOON?.dishPortions?.[d.dishId || d.id] ?? 0,
              isBatchCreated: Boolean(matchedBatch),
              batchCode: matchedBatch?.batchCode || "",
              batchId: matchedBatch?.id || "",
              ingredients: d.ingredients || [],
            });
          });
        }

        setDishes(loadedDishes);
      } catch (err) {
        console.warn("Lỗi tải món ăn hôm nay:", err);
        if (active) {
          setDishes([]);
          setLoadError(err.message);
        }
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

  // Xử lý tạo lô cho một món ăn
  const handleCreateBatchForDish = async (dishToCreate) => {
    if (!dishToCreate) return;
    setSubmittingDishId(dishToCreate.id);
    try {
      const mealType = String(dishToCreate.mealType || selectedMeal || "LUNCH").toUpperCase();
      const res = await KitchenService.planBatch({
        dishId: dishToCreate.dishId || dishToCreate.id,
        menuDayId: dishToCreate.menuDayId,
        mealType: mealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH",
      });

      if (!Array.isArray(res?.batches) || !res.batches.length) {
        throw new Error("Phản hồi thiếu phương án lô; vui lòng tải lại danh sách.");
      }

      const dishCode = res.batches.map((b) => b.batchCode).join(", ");
      const firstBatchId = res.batches[0]?.id;

      // Cập nhật danh sách món ăn: món chuyển sang trạng thái Đã tạo lô
      setDishes((prev) =>
        prev.map((d) =>
          d.id === dishToCreate.id
            ? {
                ...d,
                isBatchCreated: true,
                batchCode: dishCode,
                batchId: firstBatchId,
              }
            : d
        )
      );

      setSelectedDish((prev) =>
        prev?.id === dishToCreate.id
          ? {
              ...prev,
              isBatchCreated: true,
              batchCode: dishCode,
              batchId: firstBatchId,
            }
          : prev
      );

      notice({
        msg: `✓ Đã tạo thành công lô ${dishCode} cho món "${dishToCreate.name}"!`,
        isSuccess: true,
      });

      setTimeout(() => {
        setIsModalOpen(false);
      }, 500);
    } catch (err) {
      notice({
        msg: err.message || "Không thể tạo lô chế biến. Vui lòng kiểm tra lại nguyên liệu.",
        isSuccess: false,
      });
    } finally {
      setSubmittingDishId(null);
    }
  };

  const handleDishClick = (dish) => {
    setSelectedDish(dish);
    setIsModalOpen(true);
  };

  const handleViewBatchDetail = (dish) => {
    const targetId = dish.batchId || dish.id;
    navigate(ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", targetId));
  };

  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        {/* Header Bar */}
        <CreateBatchSeparateHeader />

        {loadError ? (
          <p role="alert">{loadError}</p>
        ) : loading ? (
          <div
            style={{
              padding: "80px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FoodPrintLoading />
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
          <CreateBatchKanban
            dishes={dishes}
            selectedMeal={selectedMeal}
            onSelectMeal={setSelectedMeal}
            onDishClick={handleDishClick}
            onQuickConfirm={handleCreateBatchForDish}
            onViewBatchDetail={handleViewBatchDetail}
            submittingDishId={submittingDishId}
          />
        )}

        {/* Modal chi tiết lô khi ấn vào thẻ món ăn */}
        <CreateBatchDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          dish={selectedDish}
          onConfirmCreate={handleCreateBatchForDish}
          submitting={submittingDishId === selectedDish?.id}
          onViewBatchDetail={handleViewBatchDetail}
        />
      </div>
    </div>
  );
}
