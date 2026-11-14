import MenuScopeSelect from "src/components/MenuScopeSelect";
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
import BatchPlanModal from "../CreateBatch/component/BatchPlanModal";
import RetainedSampleModal from "../BatchDetail/component/RetainedSampleModal";
import styles from "./index.module.scss";

/**
 * CreateBatchSeparate - Màn hình Tiến độ Chế biến Nấu riêng theo lô (Nhân viên Bếp)
 * Kết nối 100% API thực tế, không dùng Mock Data fallback
 */
export default function CreateBatchSeparate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingDishes, setPendingDishes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState("all");
  const [menuId, setMenuId] = useState("");
  const [menuOptions, setMenuOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // State cho Popup Phương án phân bổ lô chế biến (Nấu riêng theo lô)
  const [dishToPlan, setDishToPlan] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // State cho Popup Lưu mẫu thực phẩm 24h
  const [sampleBatch, setSampleBatch] = useState(null);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  // Tải danh sách món ăn từ thực đơn đã duyệt hôm nay
  const loadTodayData = useCallback(async (signal) => {
    setLoading(true);
    setLoadError("");
    try {
      const today = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

      const [scheduleRes, batchesRes] = await Promise.all([
        MenuService.getWeekSchedule(todayISO, menuId ? { menuId } : {}),
        KitchenService.getAllBatches({ date: todayISO }),
      ]);

      if (signal?.aborted) return;
      setMenuOptions(scheduleRes?.data?.availableMenus || []);
      const dayIds = new Set((scheduleRes?.data?.days || []).map((day) => day.menuDayId).filter(Boolean));
      const existingBatches = (batchesRes?.items || []).filter((batch) => dayIds.has(batch.menuDayId));
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

      // Dữ liệu chi tiết món trong mẻ là nguồn chính; hỗ trợ cả bản ghi cũ một món.
      const formattedBatches = existingBatches.map((b) => {
        const dishes = Array.isArray(b.dishes) && b.dishes.length
          ? b.dishes
          : b.dishId ? [{ dishId: b.dishId, name: b.Dish?.name || b.dishName, plannedPortions: b.plannedPortions }] : [];
        const dishIds = dishes.map((dish) => dish.dishId).filter(Boolean);
        const dishName = dishes.map((dish) => dish.name).filter(Boolean).join(", ") || b.Dish?.name || b.dishName || "";
        const mealType = String(b.mealType || "").toLowerCase() === "afternoon" ? "afternoon" : "lunch";
        const mealName = mealType === "afternoon" ? "Bữa xế" : "Bữa trưa";
        const matchedDish = allTodayDishes.find(
          (d) => dishIds.includes(d.dishId) && d.mealType === mealType
        );
        const lots = [
          ...(b.cookingBatchLots || []),
          ...dishes.flatMap((dish) => (dish.cookingBatchLots || []).map((lot) => ({ ...lot, dishId: lot.dishId || dish.dishId, dishName: dish.name }))),
        ];
        const uniqueLots = [...new Map(lots.map((lot) => [`${lot.dishId || ""}:${lot.ingredientLotId || lot.id}`, lot])).values()];

        return {
          id: b.id,
          batchCode: b.batchCode || "",
          dishId: dishIds[0] || null,
          batchDishIds: dishIds,
          dishes,
          dishName,
          name: dishName,
          mealType,
          mealName,
          portionStandard: b.plannedPortions || matchedDish?.portionStandard || 0,
          plannedPortions: b.plannedPortions || 0,
          status: b.status || "UNCONFIRMED",
          confirmedAt: b.confirmedAt,
          completedAt: b.completedAt,
          cookingModeApplied: b.cookingModeApplied,
          retainedFoodSamples: b.retainedFoodSamples || b.RetainedFoodSample || [],
          ingredients: uniqueLots.length
            ? uniqueLots.map((lot, idx) => ({
                id: lot.ingredientLotId || idx,
                name: lot.ingredientName || lot.IngredientLot?.DeliveryItem?.SupplyRequestItem?.IngredientEntry?.Ingredient?.name || lot.name || `Lô #${idx + 1}`,
                code: lot.IngredientLot?.lotCode || lot.lotCode || "",
                amount: lot.quantityUsed ? `${lot.quantityUsed} ${lot.unit || "kg"}` : "",
                quantity: lot.quantityUsed,
                unit: lot.unit || "kg",
                dishId: lot.dishId,
                dishName: lot.dishName,
              }))
            : (matchedDish?.ingredients || []),
        };
      });

      // So tổng suất đã lập theo từng món để món lập dở vẫn còn trong danh sách chờ.
      const pending = allTodayDishes.filter((dish) => {
        const planned = formattedBatches.reduce((total, batch) => {
          if (batch.mealType !== dish.mealType) return total;
          const dishPlan = batch.dishes?.find((item) => item.dishId === dish.dishId || item.dishId === dish.id);
          return total + Number(dishPlan?.plannedPortions || 0);
        }, 0);
        return planned < Number(dish.portionStandard || 0);
      });

      setPendingDishes(pending);
      setBatches(formattedBatches);
    } catch (err) {
      console.warn("Lỗi tải tiến độ nấu riêng hôm nay:", err);
      if (!signal?.aborted) {
        setPendingDishes([]);
        setBatches([]);
        setLoadError(err.message || "Không thể tải tiến độ chế biến hôm nay.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    const controller = new AbortController();
    loadTodayData(controller.signal);
    return () => controller.abort();
  }, [loadTodayData]);

  // Xử lý tạo lô cho một món ăn theo phương án nấu riêng
  const handleCreateBatchForDish = async (dishToCreate) => {
    if (!dishToCreate) return;
    setSubmittingId(dishToCreate.id);
    try {
      const mealType = String(dishToCreate.mealType || selectedMeal || "LUNCH").toUpperCase();
      const res = await KitchenService.planBatch({
        planVersion: dishToCreate.planVersion,
        dishId: dishToCreate.dishId || dishToCreate.id,
        menuDayId: dishToCreate.menuDayId,
        mealType: mealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH",
      });

      if (!Array.isArray(res?.batches)) {
        throw new Error("Không thể tạo phương án lô riêng cho món ăn này từ nguyên liệu hiện có.");
      }
      await loadTodayData();

      notice({
        msg: "Đã đồng bộ các mẻ con theo cấu hình nấu riêng của BGH.",
        isSuccess: true,
      });

      setIsModalOpen(false);
    } catch (err) {
      notice({
        msg: err.message || "Không thể tạo lô riêng. Vui lòng kiểm tra lại nguyên liệu.",
        isSuccess: false,
      });
      throw err;
    } finally {
      setSubmittingId(null);
    }
  };

  // Xử lý xác nhận bắt đầu nấu

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

  // Mở Popup phương án phân bổ lô chế biến trước khi tạo
  const handleOpenPlanModal = (dish) => {
    setDishToPlan(dish);
    setIsPlanModalOpen(true);
  };

  // Mở Popup lưu mẫu thực phẩm 24h
  const handleOpenSampleModal = (batch) => {
    setSampleBatch(batch);
    setIsSampleModalOpen(true);
  };

  // Xử lý lưu mẫu thực phẩm 24h
  const handleSaveSample = async (samplePayload) => {
    if (!sampleBatch?.id) return;
    setSampleLoading(true);
    try {
      await KitchenService.createBatchSample(sampleBatch.id, samplePayload);
      setBatches((prev) =>
        prev.map((b) =>
          b.id === sampleBatch.id
            ? {
                ...b,
                hasSample: true,
                retainedFoodSamples: [...(b.retainedFoodSamples || []), samplePayload],
                retainedFoodSample: samplePayload,
              }
            : b
        )
      );
      if (selectedItem?.id === sampleBatch.id) {
        setSelectedItem((prev) => ({
          ...prev,
          hasSample: true,
          retainedFoodSamples: [...(prev?.retainedFoodSamples || []), samplePayload],
          retainedFoodSample: samplePayload,
        }));
      }
      notice({
        msg: `Đã lưu mẫu 24h: ${sampleBatch.name || sampleBatch.dishName} (${sampleBatch.batchCode})`,
        isSuccess: true,
      });
      setIsSampleModalOpen(false);
      setSampleBatch(null);
    } catch (err) {
      notice({
        msg: err.message || "Không thể lưu mẫu thực phẩm.",
        isSuccess: false,
      });
    } finally {
      setSampleLoading(false);
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
      } catch (err) {
        console.warn("Không thể tải chi tiết lô từ API:", err);
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
          subtitle="Khởi tạo lô và theo dõi quy trình chế biến món ăn trong ngày"
        />

        <MenuScopeSelect menus={menuOptions} value={menuId} onChange={setMenuId} disabled={loading || Boolean(submittingId || actionLoadingId)} />
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
        ) : menuOptions.length > 1 && !menuId ? (
          <p role="status">Chọn thực đơn và khối ở trên để xem tiến độ chế biến riêng.</p>
        ) : !hasAnyData ? (
          <div className="p-8 my-6 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-800 font-semibold text-lg mb-2">
              Chưa có thực đơn được duyệt cho ngày hôm nay
            </h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Hệ thống không tìm thấy món ăn nào thuộc thực đơn đã duyệt hôm nay. Vui lòng kiểm tra lại thực đơn trường học hoặc quay lại sau.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                type="button"
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition cursor-pointer"
                onClick={() => navigate(ROUTER.SCHOOL_KITCHEN_BATCHES)}
              >
                Về danh sách lô chế biến
              </button>
            </div>
          </div>
        ) : (
          <CreateBatchKanban
            pendingDishes={pendingDishes}
            batches={batches}
            selectedMeal={selectedMeal}
            onSelectMeal={setSelectedMeal}
            onOpenDetail={handleOpenDetail}
            onOpenPlanModal={handleOpenPlanModal}
            onOpenSampleModal={handleOpenSampleModal}
            onQuickCreate={handleCreateBatchForDish}
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
          onConfirmCreate={handleOpenPlanModal}
          onCompleteCooking={handleCompleteCooking}
          onOpenSampleModal={handleOpenSampleModal}
          submitting={Boolean(submittingId || actionLoadingId)}
          onViewBatchDetail={handleViewFullPage}
        />

        {/* Modal xem trước phương án phân bổ lô riêng trước khi xác nhận tạo */}
        <BatchPlanModal
          open={isPlanModalOpen}
          onClose={() => {
            if (!submittingId) {
              setIsPlanModalOpen(false);
              setDishToPlan(null);
            }
          }}
          dish={dishToPlan}
          cookingMode="SEPARATE_BY_LOT"
          onConfirm={async (dish) => {
            await handleCreateBatchForDish(dish);
            setIsPlanModalOpen(false);
            setDishToPlan(null);
          }}
          submitting={Boolean(submittingId)}
        />

        {/* Modal nhập lưu mẫu thực phẩm 24h ngay tại chỗ */}
        <RetainedSampleModal
          isOpen={isSampleModalOpen}
          onClose={() => {
            if (!sampleLoading) {
              setIsSampleModalOpen(false);
              setSampleBatch(null);
            }
          }}
          onConfirm={handleSaveSample}
          batchData={
            sampleBatch
              ? {
                  ...sampleBatch,
                  code: sampleBatch.batchCode || sampleBatch.code,
                  dishName: sampleBatch.name || sampleBatch.dishName,
                  dishes: sampleBatch.dishes?.length
                    ? sampleBatch.dishes
                    : [
                        {
                          dishId: sampleBatch.dishId,
                          name: sampleBatch.name || sampleBatch.dishName,
                        },
                      ],
                  retainedFoodSamples: sampleBatch.retainedFoodSamples || [],
                }
              : {}
          }
          loading={sampleLoading}
        />
      </div>
    </div>
  );
}
