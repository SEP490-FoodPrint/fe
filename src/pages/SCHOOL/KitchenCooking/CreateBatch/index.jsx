import React, { useState } from "react";
import CreateBatchHeader from "./component/CreateBatchHeader";
import BasicInfoSection, { INITIAL_DISHES } from "./component/BasicInfoSection";
import ProposedBatchSection from "./component/ProposedBatchSection";
import CreateBatchFooter from "./component/CreateBatchFooter";
import styles from "./index.module.scss";

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm - Nấu Chung (Nhân viên Bếp)
 * Hỗ trợ đa ca ăn (Bữa trưa / Bữa xế / Tất cả trong ngày) và thực đơn nhiều món:
 * 1. Chuyển đổi linh hoạt giữa các bữa ăn và trạng thái tạo lô.
 * 2. Lưới thẻ tự co giãn (Responsive Auto-fill Grid).
 * 3. Tự động chuyển tiếp thông minh giữa các món chưa tạo lô.
 */
export default function CreateBatch() {
  const [dishes, setDishes] = useState(INITIAL_DISHES);
  const [selectedMeal, setSelectedMeal] = useState("lunch");

  // Mặc định chọn món đầu tiên chưa tạo lô trong ca ăn hiện tại
  const [selectedDish, setSelectedDish] = useState(() => {
    return (
      INITIAL_DISHES.find((d) => !d.isBatchCreated && d.mealType === "lunch") ||
      INITIAL_DISHES.find((d) => !d.isBatchCreated) ||
      INITIAL_DISHES[0]
    );
  });
  const [portions, setPortions] = useState(1250);

  // Xử lý tạo lô thành công và chuyển ngay sang món chưa tạo tiếp theo
  const handleBatchCreated = (dishId) => {
    const updatedDishes = dishes.map((d) => {
      if (d.id === dishId) {
        return {
          ...d,
          isBatchCreated: true,
          batchCode: d.batchCode || `LÔ-${d.name.slice(0, 3).toUpperCase()}-01`,
        };
      }
      return d;
    });

    setDishes(updatedDishes);

    // Ưu tiên tìm món tiếp theo chưa tạo trong cùng ca ăn
    const nextInSameMeal = updatedDishes.find(
      (d) =>
        !d.isBatchCreated &&
        d.id !== dishId &&
        (selectedMeal === "all" || d.mealType === selectedMeal)
    );

    // Nếu ca hiện tại đã xong hết, tìm món chưa tạo ở ca khác
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
        {/* Header Bar: Breadcrumb + Action Mode Tag */}
        <CreateBatchHeader />

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

        {/* PHẦN 2: PHƯƠNG ÁN CHẾ BIẾN DỰ KIẾN (TỰ ĐỘNG CẬP NHẬT THEO MÓN ĐÃ CHỌN) */}
        <ProposedBatchSection
          selectedDish={selectedDish}
          dishes={dishes}
          selectedMeal={selectedMeal}
          setSelectedDish={setSelectedDish}
        />

        {/* CHÂN TRANG & THANH TÁC VỤ TIẾP TỤC / HOÀN TẤT */}
        <CreateBatchFooter
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
