import React, { useState } from "react";
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader";
import BasicInfoSeparateSection from "./component/BasicInfoSeparateSection";
import IngredientSeparateSection from "./component/IngredientSeparateSection";
import ProposedSeparateBatchSection from "./component/ProposedSeparateBatchSection";
import CreateBatchSeparateFooter from "./component/CreateBatchSeparateFooter";
import styles from "./index.module.scss";

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến - Nấu Riêng Từng Lô (Nhân viên Bếp)
 * Khởi đầu ở trạng thái trống, nhân viên chọn món ăn từ thực đơn hôm nay,
 * hệ thống tự động nhận diện các lô nguyên liệu khác nguồn gốc và đề xuất tách thành 02 lô độc lập song song.
 */
export default function CreateBatchSeparate() {
  const [selectedDish, setSelectedDish] = useState(null);
  const [portions, setPortions] = useState(1250);
  const [selectedMeal, setSelectedMeal] = useState("lunch");

  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        <CreateBatchSeparateHeader />
        <BasicInfoSeparateSection
          selectedDish={selectedDish}
          setSelectedDish={setSelectedDish}
          portions={portions}
          setPortions={setPortions}
          selectedMeal={selectedMeal}
          setSelectedMeal={setSelectedMeal}
        />
        <IngredientSeparateSection
          selectedDish={selectedDish}
          portions={portions}
        />
        <ProposedSeparateBatchSection
          selectedDish={selectedDish}
          portions={portions}
          selectedMeal={selectedMeal}
        />
        <CreateBatchSeparateFooter selectedDish={selectedDish} />
      </div>
    </div>
  );
}
