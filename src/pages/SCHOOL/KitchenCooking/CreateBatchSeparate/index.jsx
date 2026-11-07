import React, { useState } from "react";
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader";
import BasicInfoSeparateSection from "./component/BasicInfoSeparateSection";
import ProposedSeparateBatchSection from "./component/ProposedSeparateBatchSection";
import CreateBatchSeparateFooter from "./component/CreateBatchSeparateFooter";
import styles from "./index.module.scss";

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến - Nấu Riêng Từng Lô (Nhân viên Bếp)
 * Giao diện tinh gọn, tối giản, hỗ trợ nhân viên bếp thao tác nhanh:
 * 1. Thông tin phiên nấu (Chọn món từ thực đơn hôm nay, ca ăn, suất ăn điểm danh)
 * 2. Phương án tách lô chế biến độc lập (Thiết bị, quy mô suất, nguồn gốc từng mẻ)
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
