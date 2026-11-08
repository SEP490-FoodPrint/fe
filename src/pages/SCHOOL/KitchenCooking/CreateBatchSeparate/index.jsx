import React, { useState } from "react";
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader";
import BasicInfoSeparateSection, {
  INITIAL_SEPARATE_DISHES,
} from "./component/BasicInfoSeparateSection";
import ProposedSeparateBatchSection from "./component/ProposedSeparateBatchSection";
import CreateBatchSeparateFooter from "./component/CreateBatchSeparateFooter";
import styles from "./index.module.scss";

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến - Nấu Riêng Từng Lô (Nhân viên Bếp)
 * Hỗ trợ đa ca ăn (Bữa trưa / Bữa xế / Tất cả trong ngày) và thực đơn nhiều món:
 * 1. Chuyển đổi linh hoạt giữa các ca ăn và trạng thái tạo lô.
 * 2. Lưới thẻ tự co giãn (Responsive Auto-fill Grid).
 * 3. Tự động chuyển tiếp thông minh giữa các món chưa tạo lô.
 */
export default function CreateBatchSeparate() {
  const [dishes, setDishes] = useState(INITIAL_SEPARATE_DISHES);
  const [selectedMeal, setSelectedMeal] = useState("lunch");
  const [selectedDish, setSelectedDish] = useState(() => {
    return (
      INITIAL_SEPARATE_DISHES.find(
        (d) => !d.isBatchCreated && d.mealType === "lunch"
      ) ||
      INITIAL_SEPARATE_DISHES.find((d) => !d.isBatchCreated) ||
      INITIAL_SEPARATE_DISHES[0]
    );
  });
  const [portions, setPortions] = useState(1250);

  const handleBatchCreated = (dishId) => {
    const updatedDishes = dishes.map((d) => {
      if (d.id === dishId) {
        return {
          ...d,
          isBatchCreated: true,
          batchCode: d.batchCode || `LÔ-${d.name.slice(0, 3).toUpperCase()}-01 & 02`,
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
      </div>
    </div>
  );
}
