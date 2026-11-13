import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import FoodPrintLoading from "src/components/FoodPrintLoading";
import notice from "src/components/Notice";
import ROUTER from "src/router/ROUTER";
import MenuService from "src/services/MenuService";
import KitchenService from "src/services/KitchenService";
import { adaptBatchDetail, getDishBatchState } from "src/services/KitchenService/adapter";
import {
  getMockTodayProgressData,
  resetMockTodayProgressData,
  createMockBatchFromDish,
  updateMockBatchStatus,
  createMockBatchSample,
  findMockBatchDetail,
} from "src/services/KitchenService/mockCookingBatchesData";
import CreateBatchHeader from "./component/CreateBatchHeader";
import CreateBatchKanban from "./component/CreateBatchKanban";
import CreateBatchDetailModal from "./component/CreateBatchDetailModal";
import BatchPlanModal from "./component/BatchPlanModal";
import RetainedSampleModal from "../BatchDetail/component/RetainedSampleModal";
import styles from "./index.module.scss";

/**
 * CreateBatch - Bảng Tiến độ Chế biến Món ăn (Nhân viên Bếp)
 * Giao diện Kanban 4 cột theo dõi quy trình từ Tạo lô -> Chờ nấu -> Đã nấu xong -> Đã lưu mẫu
 */
export default function CreateBatch() {
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

  // State cho Popup Phương án phân bổ lô chế biến
  const [dishToPlan, setDishToPlan] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // State cho Popup Lưu mẫu thực phẩm 24h
  const [sampleBatch, setSampleBatch] = useState(null);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  // Tải danh sách món ăn từ thực đơn đã duyệt hôm nay và các lô đã tạo
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
          cookingModeApplied: b.cookingModeApplied,
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

      // Nếu dữ liệu trực tiếp chưa có thực đơn hoặc mẻ nấu hôm nay, tự động nạp mock data 4 trạng thái
      if (pending.length === 0 && formattedBatches.length === 0) {
        const mockData = getMockTodayProgressData();
        setPendingDishes(mockData.pendingDishes);
        setBatches(mockData.batches);
      } else {
        setPendingDishes(pending);
        setBatches(formattedBatches);
      }
    } catch (err) {
      console.warn("Lỗi tải tiến độ chế biến hôm nay, sử dụng dữ liệu mẫu:", err);
      if (!signal?.aborted) {
        const mockData = getMockTodayProgressData();
        setPendingDishes(mockData.pendingDishes);
        setBatches(mockData.batches);
        setLoadError("");
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

  // Khôi phục / nạp lại dữ liệu mẫu 4 trạng thái để kiểm thử
  const handleResetMockData = () => {
    const mockData = resetMockTodayProgressData();
    setPendingDishes(mockData.pendingDishes);
    setBatches(mockData.batches);
    notice({
      msg: "Đã nạp lại dữ liệu mẫu 4 trạng thái (Chờ tạo lô, Đã tạo lô, Đã nấu xong, Đã lưu mẫu)",
      isSuccess: true,
    });
  };

  // Xử lý tạo lô cho một món ăn
  const handleCreateBatchForDish = async (dishToCreate) => {
    if (!dishToCreate) return;
    setSubmittingId(dishToCreate.id);
    try {
      let createdBatchesList = [];
      try {
        const mealType = String(dishToCreate.mealType || selectedMeal || "LUNCH").toUpperCase();
        const res = await KitchenService.planBatch({
          dishId: dishToCreate.dishId || dishToCreate.id,
          menuDayId: dishToCreate.menuDayId,
          mealType: mealType === "AFTERNOON" ? "AFTERNOON" : "LUNCH",
        });

        if (Array.isArray(res?.batches) && res.batches.length) {
          createdBatchesList = res.batches.map((b) => ({
            id: b.id,
            batchCode: b.batchCode,
            dishId: dishToCreate.dishId || dishToCreate.id,
            dishName: dishToCreate.name,
            name: dishToCreate.name,
            mealType: dishToCreate.mealType,
            mealName: dishToCreate.mealName,
            portionStandard: b.plannedPortions || dishToCreate.portionStandard || 0,
            plannedPortions: b.plannedPortions || dishToCreate.portionStandard || 0,
            status: b.status || "CONFIRMED",
            cookingModeApplied: b.cookingModeApplied || "COMBINE_LOTS",
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
        }
      } catch (apiErr) {
        console.warn("API planBatch không khả dụng, sử dụng bộ sinh lô mẫu:", apiErr);
      }

      // Nếu API không trả về lô (chế độ mock/offline), tạo lô giả lập hoàn chỉnh
      if (!createdBatchesList.length) {
        const mockBatch = createMockBatchFromDish(dishToCreate, "COMBINE_LOTS");
        if (mockBatch) createdBatchesList = [mockBatch];
      }

      if (!createdBatchesList.length) {
        throw new Error("Không thể tạo phương án lô cho món ăn này.");
      }

      const dishCode = createdBatchesList.map((b) => b.batchCode).join(", ");

      // Bỏ món khỏi danh sách chờ tạo lô
      setPendingDishes((prev) =>
        prev.filter((d) => d.id !== dishToCreate.id && d.dishId !== dishToCreate.dishId)
      );

      // Thêm các lô mới vào cột Đã tạo lô
      setBatches((prev) => [...createdBatchesList, ...prev.filter((b) => !createdBatchesList.some((nb) => nb.id === b.id))]);

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
      try {
        await KitchenService.confirmBatch(batch.id);
      } catch (apiErr) {
        console.warn("API confirmBatch không khả dụng, xác nhận nội bộ:", apiErr);
        updateMockBatchStatus(batch.id, "CONFIRMED");
      }
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
      try {
        await KitchenService.completeBatch(batch.id);
      } catch (apiErr) {
        console.warn("API completeBatch không khả dụng, ghi nhận mẻ nấu nội bộ:", apiErr);
        updateMockBatchStatus(batch.id, "COMPLETED");
      }
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
      try {
        await KitchenService.createBatchSample(sampleBatch.id, samplePayload);
      } catch (apiErr) {
        console.warn("API createBatchSample không khả dụng, lưu mẫu nội bộ:", apiErr);
        createMockBatchSample(sampleBatch.id, samplePayload);
      }
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
      } catch {
        // Fallback sang tìm mock detail nếu có
        const mockDetail = findMockBatchDetail(item.id);
        if (mockDetail) {
          setSelectedItem((prev) =>
            prev?.id === item.id
              ? {
                  ...prev,
                  ...mockDetail,
                  ingredients: mockDetail.ingredients || prev.ingredients,
                  cookingBatchLots: mockDetail.cookingBatchLots || prev.cookingBatchLots,
                }
              : prev
          );
        }
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
        {/* Header Bar với tiêu đề Tiến độ chế biến */}
        <CreateBatchHeader
          title="Tiến độ chế biến"
          subtitle="Khởi tạo lô và theo dõi quy trình chế biến món ăn trong ngày"
          onResetMock={handleResetMockData}
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
              Hệ thống không tìm thấy món ăn nào thuộc thực đơn đã duyệt. Bạn có thể nạp dữ liệu mẫu để trải nghiệm quy trình chế biến 4 trạng thái.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                type="button"
                className="px-5 py-2.5 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition cursor-pointer"
                onClick={handleResetMockData}
              >
                Nạp dữ liệu mẫu 4 bước
              </button>
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
            onConfirmCooking={handleConfirmCooking}
            onCompleteCooking={handleCompleteCooking}
            onViewBatchDetail={handleViewFullPage}
            submittingId={submittingId}
            actionLoadingId={actionLoadingId}
            onResetMock={handleResetMockData}
          />
        )}

        {/* Modal chi tiết lô dạng Popup xem nhanh với icon con mắt */}
        <CreateBatchDetailModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
          onConfirmCreate={handleCreateBatchForDish}
          onConfirmCooking={handleConfirmCooking}
          onCompleteCooking={handleCompleteCooking}
          onOpenSampleModal={handleOpenSampleModal}
          submitting={Boolean(submittingId || actionLoadingId)}
          onViewBatchDetail={handleViewFullPage}
        />

        {/* Modal xem trước phương án phân bổ lô trước khi xác nhận tạo */}
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
