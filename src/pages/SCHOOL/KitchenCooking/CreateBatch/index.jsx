import React, { useState } from "react";
import CreateBatchHeader from "./component/CreateBatchHeader";
import BasicInfoSection from "./component/BasicInfoSection";
import IngredientAllocationSection from "./component/IngredientAllocationSection";
import ProposedBatchSection from "./component/ProposedBatchSection";
import CreateBatchFooter from "./component/CreateBatchFooter";
import styles from "./index.module.scss";

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm - Nấu Chung (Nhân viên Bếp)
 * Tuân thủ quy chuẩn ai_coding_rule: Cấu trúc component/, token màu, mobile-first touch >= 44px
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
