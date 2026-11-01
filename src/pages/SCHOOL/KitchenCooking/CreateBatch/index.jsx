import React, { useState } from "react";
import CreateBatchHeader from "./CreateBatchHeader";
import BasicInfoSection from "./BasicInfoSection";
import IngredientAllocationSection from "./IngredientAllocationSection";
import ProposedBatchSection from "./ProposedBatchSection";
import CreateBatchFooter from "./CreateBatchFooter";
import styles from "./index.module.scss";

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm - Nấu Chung (Nhân viên Bếp)
 * Khởi đầu ở trạng thái trống, nhân viên chọn món ăn từ thực đơn hôm nay,
 * hệ thống tự động đối soát tồn kho và tính toán phương án gộp lô tối ưu (ít mẻ nhất).
 */
export default function CreateBatch() {
  const [selectedDish, setSelectedDish] = useState(null);
  const [portions, setPortions] = useState(1250);
  const [selectedMeal, setSelectedMeal] = useState("lunch");

  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        {/* Header Bar: Breadcrumb + Action Mode Tag */}
        <CreateBatchHeader />

        {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
        <BasicInfoSection
          selectedDish={selectedDish}
          setSelectedDish={setSelectedDish}
          portions={portions}
          setPortions={setPortions}
          selectedMeal={selectedMeal}
          setSelectedMeal={setSelectedMeal}
        />

        {/* PHẦN 2: CHỌN LÔ NGUYÊN LIỆU & ĐỐI SOÁT SỐ LƯỢNG */}
        <IngredientAllocationSection
          selectedDish={selectedDish}
          portions={portions}
        />

        {/* PHẦN 3: PHƯƠNG ÁN CHẾ BIẾN DỰ KIẾN (NẤU CHUNG) */}
        <ProposedBatchSection
          selectedDish={selectedDish}
          portions={portions}
          selectedMeal={selectedMeal}
        />

        {/* CHÂN TRANG & THANH TÁC VỤ */}
        <CreateBatchFooter selectedDish={selectedDish} />
      </div>
    </div>
  );
}
