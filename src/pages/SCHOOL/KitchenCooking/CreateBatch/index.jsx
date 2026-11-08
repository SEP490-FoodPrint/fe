import React, { useState } from "react";
import CreateBatchHeader from "./component/CreateBatchHeader";
import BasicInfoSection, { INITIAL_DISHES } from "./component/BasicInfoSection";
import ProposedBatchSection from "./component/ProposedBatchSection";
import CreateBatchFooter from "./component/CreateBatchFooter";
import styles from "./index.module.scss";

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm - Nấu Chung (Nhân viên Bếp)
 * Giao diện tinh gọn, trực quan, hỗ trợ nhân viên bếp thao tác nhanh:
 * 1. Nhìn thấy ngay danh sách món trong thực đơn hôm nay, món nào đã tạo, món nào chưa tạo.
 * 2. Chọn món là giao diện tự động cập nhật mẻ nấu tại chỗ, không cần vào ra nhiều lần.
 * 3. Đã loại bỏ "Gia vị an toàn" và các cột tiêu chuẩn rườm rà.
 */
export default function CreateBatch() {
  const [dishes, setDishes] = useState(INITIAL_DISHES);
  // Mặc định chọn món đầu tiên chưa tạo lô
  const [selectedDish, setSelectedDish] = useState(() => {
    return INITIAL_DISHES.find((d) => !d.isBatchCreated) || INITIAL_DISHES[0];
  });
  const [portions, setPortions] = useState(1250);
  const [selectedMeal, setSelectedMeal] = useState("lunch");

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

    // Tìm món tiếp theo chưa tạo
    const nextPending = updatedDishes.find((d) => !d.isBatchCreated && d.id !== dishId);
    if (nextPending) {
      setSelectedDish(nextPending);
      if (nextPending.portionStandard) {
        setPortions(nextPending.portionStandard);
      }
    } else {
      // Nếu đã tạo hết, giữ nguyên món hiện tại ở trạng thái isBatchCreated: true
      const current = updatedDishes.find((d) => d.id === dishId);
      if (current) setSelectedDish(current);
    }
  };

  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        {/* Header Bar: Breadcrumb + Action Mode Tag */}
        <CreateBatchHeader />

        {/* PHẦN 1: THÔNG TIN PHIÊN NẤU & BỘ CHỌN MÓN KÈM TRẠNG THÁI */}
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
          setSelectedDish={setSelectedDish}
        />

        {/* CHÂN TRANG & THANH TÁC VỤ TIẾP TỤC / HOÀN TẤT */}
        <CreateBatchFooter
          selectedDish={selectedDish}
          dishes={dishes}
          onBatchCreated={handleBatchCreated}
          onSelectNextDish={setSelectedDish}
        />
      </div>
    </div>
  );
}
