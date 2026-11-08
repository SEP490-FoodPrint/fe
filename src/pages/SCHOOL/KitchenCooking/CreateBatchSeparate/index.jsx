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
 * Giao diện tinh gọn, trực quan, hỗ trợ nhân viên bếp thao tác nhanh:
 * 1. Nhìn thấy ngay danh sách món trong thực đơn hôm nay, món nào đã tạo, món nào chưa tạo.
 * 2. Chọn món là giao diện tự động cập nhật mẻ nấu tại chỗ, không cần vào ra nhiều lần.
 * 3. Đã loại bỏ "Gia vị an toàn" và các khung bo rườm rà.
 */
export default function CreateBatchSeparate() {
  const [dishes, setDishes] = useState(INITIAL_SEPARATE_DISHES);
  const [selectedDish, setSelectedDish] = useState(() => {
    return INITIAL_SEPARATE_DISHES.find((d) => !d.isBatchCreated) || INITIAL_SEPARATE_DISHES[0];
  });
  const [portions, setPortions] = useState(1250);
  const [selectedMeal, setSelectedMeal] = useState("lunch");

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

    const nextPending = updatedDishes.find((d) => !d.isBatchCreated && d.id !== dishId);
    if (nextPending) {
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
          setSelectedDish={setSelectedDish}
        />
        <CreateBatchSeparateFooter
          selectedDish={selectedDish}
          dishes={dishes}
          onBatchCreated={handleBatchCreated}
          onSelectNextDish={setSelectedDish}
        />
      </div>
    </div>
  );
}
