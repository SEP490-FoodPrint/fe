import React, { useState } from "react";
import CreateBatchHeader from "./component/CreateBatchHeader";
import BasicInfoSection from "./component/BasicInfoSection";
import ProposedBatchSection from "./component/ProposedBatchSection";
import CreateBatchFooter from "./component/CreateBatchFooter";
import styles from "./index.module.scss";

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm - Nấu Chung (Nhân viên Bếp)
 * Giao diện tinh gọn, tối giản, hỗ trợ nhân viên bếp thao tác nhanh:
 * 1. Thông tin phiên nấu (Chọn món từ thực đơn hôm nay, ca ăn, suất ăn điểm danh)
 * 2. Phương án chế biến dự kiến (Thiết bị, quy mô suất, lô nguyên liệu liên kết)
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

        {/* PHẦN 1: THÔNG TIN PHIÊN NẤU */}
        <BasicInfoSection
          selectedDish={selectedDish}
          setSelectedDish={setSelectedDish}
          portions={portions}
          setPortions={setPortions}
          selectedMeal={selectedMeal}
          setSelectedMeal={setSelectedMeal}
        />

        {/* PHẦN 2: PHƯƠNG ÁN CHẾ BIẾN DỰ KIẾN (NẤU CHUNG) */}
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
