import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import notice from "src/components/Notice";
import ROUTER from "src/router/ROUTER";
import MenuService from "src/services/MenuService";
import KitchenService from "src/services/KitchenService";
import { adaptBatchDetail } from "src/services/KitchenService/adapter";
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader";
import CreateBatchKanban from "../CreateBatch/component/CreateBatchKanban";
import CreateBatchDetailModal from "../CreateBatch/component/CreateBatchDetailModal";
import styles from "./index.module.scss";

/**
 * CreateBatchSeparate - Màn hình Tiến độ Chế biến Nấu riêng theo lô (Nhân viên Bếp)
 * Giao diện Kanban theo dõi quy trình từ Tạo lô -> Đang nấu -> Đã nấu xong
 */
export default function CreateBatchSeparate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingDishes, setPendingDishes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Tải danh sách món ăn từ thực đơn đã duyệt hôm nay
  const loadTodayData = useCallback(async (signal) => {
    setLoading(true);
    setLoadError("");
    try {
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

      const [scheduleRes, batchesRes] = await Promise.all([
        MenuService.getWeekSchedule(todayISO),
        KitchenService.getBatches({ date: todayISO, limit: 100 }, { signal }),
      ]);

      const existingBatches = batchesRes?.items || [];
      const todayDay = scheduleRes?.data?.days?.find((d) => d.date === todayISO);
      const demandByMeal = {};
      const allTodayDishes = [];

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

        const lunchDishes = todayDay.meals.LUNCH?.dishes || [];
        lunchDishes.forEach((d, idx) => {
          allTodayDishes.push({
            id: d.id || d.dishId || `dish-lunch-${idx}`,
            dishId: d.dishId || d.id,
            menuDayId: todayDay.menuDayId,
            mealType: "lunch",
            mealName: "Bữa trưa",
            name: d.name,
            portionStandard: demandByMeal.LUNCH?.dishPortions?.[d.dishId || d.id] ?? 0,
            ingredients: d.ingredients || [],
          });
        });

        const afternoonDishes = todayDay.meals.AFTERNOON?.dishes || [];
        afternoonDishes.forEach((d, idx) => {
          allTodayDishes.push({
            id: d.id || d.dishId || `dish-afternoon-${idx}`,
            dishId: d.dishId || d.id,
            menuDayId: todayDay.menuDayId,
            mealType: "afternoon",
            mealName: "Bữa xế",
            name: d.name,
            portionStandard: demandByMeal.AFTERNOON?.dishPortions?.[d.dishId || d.id] ?? 0,
            ingredients: d.ingredients || [],
          });
        });
      }

      // Xử lý các lô đã có trên backend
      const formattedBatches = existingBatches.map((b) => {
        const dishName = b.Dish?.name || b.dishName || "Món ăn";
        const mealType = String(b.mealType || "").toLowerCase() === "afternoon" ? "afternoon" : "lunch";
        const mealName = mealType === "afternoon" ? "Bữa xế" : "Bữa trưa";
        const matchedDish = allTodayDishes.find(
          (d) => (d.dishId === b.dishId || d.id === b.dishId) && d.mealType === mealType
        );

        return {
          id: b.id,
          batchCode: b.batchCode || "",
          dishId: b.dishId,
          dishName,
          name: dishName,
          mealType,
          mealName,
          portionStandard: b.plannedPortions || matchedDish?.portionStandard || 0,
          plannedPortions: b.plannedPortions || 0,
          status: b.status || "UNCONFIRMED",
          confirmedAt: b.confirmedAt,
          completedAt: b.completedAt,
          cookingModeApplied: b.cookingModeApplied || "SEPARATE_BY_LOT",
          retainedFoodSamples: b.RetainedFoodSample || b.retainedFoodSamples || [],
          ingredients: (b.cookingBatchLots && b.cookingBatchLots.length > 0)
            ? b.cookingBatchLots.map((lot, idx) => ({
                id: lot.ingredientLotId || idx,
                name: lot.IngredientLot?.DeliveryItem?.SupplyRequestItem?.IngredientEntry?.Ingredient?.name || lot.name || `Lô #${idx + 1}`,
                code: lot.IngredientLot?.lotCode || lot.lotCode || "",
                amount: lot.quantityUsed ? `${lot.quantityUsed} ${lot.unit || "kg"}` : "",
                quantity: lot.quantityUsed,
                unit: lot.unit || "kg",
              }))
            : (matchedDish?.ingredients || []),
        };
      });

      // Lọc các món chưa tạo lô
      const pending = allTodayDishes.filter((dish) => {
        const hasCreatedBatch = formattedBatches.some(
          (b) =>
            (b.dishId === dish.dishId || b.dishId === dish.id) &&
            b.mealType === dish.mealType
        );
        return !hasCreatedBatch;
      });

      setPendingDishes(pending);
      setBatches(formattedBatches);
    } catch (err) {
      console.warn("Lỗi tải tiến độ nấu riêng hôm nay:", err);
      if (!signal?.aborted) {
        setPendingDishes([]);
        setBatches([]);
        setLoadError(err.message || "Không thể tải thực đơn hôm nay.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadTodayData(controller.signal);
    return () => controller.abort();
  }, [loadTodayData]);

  // Xử lý tạo lô cho một món ăn (nấu riêng theo lô)
  const handleCreateBatchForDish = async (dishToCreate) => {
    if (!dishToCreate) return;
    setSubmittingId(dishToCreate.id);
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

      const newBatches = res.batches.map((b) => ({
        id: b.id,
        batchCode: b.batchCode,
        dishId: dishToCreate.dishId || dishToCreate.id,
        dishName: dishToCreate.name,
        name: dishToCreate.name,
        mealType: dishToCreate.mealType,
        mealName: dishToCreate.mealName,
        portionStandard: b.plannedPortions || dishToCreate.portionStandard || 0,
        plannedPortions: b.plannedPortions || dishToCreate.portionStandard || 0,
        status: b.status || "UNCONFIRMED",
        cookingModeApplied: "SEPARATE_BY_LOT",
        ingredients: (b.cookingBatchLots || []).map((lot, idx) => ({
          id: lot.ingredientLotId || idx,
          name: lot.IngredientLot?.DeliveryItem?.SupplyRequestItem?.IngredientEntry?.Ingredient?.name || lot.name || `Lô #${idx + 1}`,
          code: lot.IngredientLot?.lotCode || lot.lotCode || "",
          amount: lot.quantityUsed ? `${lot.quantityUsed} ${lot.unit || "kg"}` : "",
          quantity: lot.quantityUsed,
          unit: lot.unit || "kg",
        })),
        createdAt: new Date().toISOString(),
      }));

      // Bỏ món khỏi danh sách chờ tạo lô
      setPendingDishes((prev) =>
        prev.filter((d) => d.id !== dishToCreate.id && d.dishId !== dishToCreate.dishId)
      );

      // Thêm các lô mới vào cột Đã tạo lô
      setBatches((prev) => [...newBatches, ...prev.filter((b) => !newBatches.some((nb) => nb.id === b.id))]);

      // Thông báo ngắn gọn theo yêu cầu
      notice({
        msg: `Đã tạo lô ${dishToCreate.name} (${dishCode})`,
        isSuccess: true,
      });

      setIsModalOpen(false);
    } catch (err) {
      notice({
        msg: err.message || "Không thể tạo lô chế biến. Vui lòng kiểm tra lại nguyên liệu.",
        isSuccess: false,
      });
    } finally {
      setSubmittingId(null);
    }
  };

  // Xử lý xác nhận bắt đầu nấu
  const handleConfirmCooking = async (batch) => {
    if (!batch?.id) return;
    setActionLoadingId(batch.id);
    try {
      await KitchenService.confirmBatch(batch.id);
      const nowISO = new Date().toISOString();
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: "CONFIRMED", confirmedAt: nowISO } : b))
      );
      if (selectedItem?.id === batch.id) {
        setSelectedItem((prev) => ({ ...prev, status: "CONFIRMED", confirmedAt: nowISO }));
      }
      notice({
        msg: `Bắt đầu nấu: ${batch.name || batch.dishName} (${batch.batchCode})`,
        isSuccess: true,
      });
    } catch (err) {
      notice({
        msg: err.message || "Không thể xác nhận nấu.",
        isSuccess: false,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Xử lý ghi nhận nấu xong
  const handleCompleteCooking = async (batch) => {
    if (!batch?.id) return;
    setActionLoadingId(batch.id);
    try {
      await KitchenService.completeBatch(batch.id);
      const nowISO = new Date().toISOString();
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, status: "COMPLETED", completedAt: nowISO } : b))
      );
      if (selectedItem?.id === batch.id) {
        setSelectedItem((prev) => ({ ...prev, status: "COMPLETED", completedAt: nowISO }));
      }
      notice({
        msg: `Đã nấu xong: ${batch.name || batch.dishName} (${batch.batchCode})`,
        isSuccess: true,
      });
    } catch (err) {
      notice({
        msg: err.message || "Không thể ghi nhận nấu xong.",
        isSuccess: false,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mở popup xem chi tiết lô khi ấn icon con mắt hoặc thẻ
  const handleOpenDetail = async (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);

    if (item?.id && item?.batchCode) {
      try {
        const fullDetail = await KitchenService.getBatchDetail(item.id);
        if (fullDetail) {
          const adapted = adaptBatchDetail(fullDetail);
          setSelectedItem((prev) =>
            prev?.id === item.id
              ? {
                  ...prev,
                  ...adapted,
                  batchCode: adapted.code || prev.batchCode,
                  ingredients: adapted.ingredients?.length ? adapted.ingredients : prev.ingredients,
                }
              : prev
          );
        }
      } catch {
        // Giữ thông tin đã có nếu API chi tiết không phản hồi
      }
    }
  };

  const handleViewFullPage = (item) => {
    const targetId = item?.batchId || item?.id;
    if (targetId) {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_DETAIL.replace(":id", targetId));
    }
  };

  const hasAnyData = pendingDishes.length > 0 || batches.length > 0;

  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        {/* Header Bar */}
        <CreateBatchSeparateHeader
          title="Tiến độ chế biến"
          subtitle="Khởi tạo lô và theo dõi quy trình chế biến món ăn trong ngày (Nấu riêng theo lô)"
        />

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
        ) : !hasAnyData ? (
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
            pendingDishes={pendingDishes}
            batches={batches}
            selectedMeal={selectedMeal}
            onSelectMeal={setSelectedMeal}
            onOpenDetail={handleOpenDetail}
            onQuickCreate={handleCreateBatchForDish}
            onConfirmCooking={handleConfirmCooking}
            onCompleteCooking={handleCompleteCooking}
            onViewBatchDetail={handleViewFullPage}
            submittingId={submittingId}
            actionLoadingId={actionLoadingId}
          />
        )}

        {/* Modal chi tiết lô dạng Popup xem nhanh */}
        <CreateBatchDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
          onConfirmCreate={handleCreateBatchForDish}
          onConfirmCooking={handleConfirmCooking}
          onCompleteCooking={handleCompleteCooking}
          submitting={Boolean(submittingId || actionLoadingId)}
          onViewBatchDetail={handleViewFullPage}
        />
      </div>
    </div>
  );
}
