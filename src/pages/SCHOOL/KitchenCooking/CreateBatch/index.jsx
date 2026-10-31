import React from "react"
import CreateBatchHeader from "./CreateBatchHeader"
import BasicInfoSection from "./BasicInfoSection"
import IngredientAllocationSection from "./IngredientAllocationSection"
import ProposedBatchSection from "./ProposedBatchSection"
import CreateBatchFooter from "./CreateBatchFooter"
import styles from "./index.module.scss"

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm (Nhân viên Bếp)
 * Chuẩn hóa Mobile-First & UI/UX Pro Max:
 * - Kế thừa MainLayout dùng chung (Sidebar xanh Forest Emerald #0A8066 + DashboardHeader)
 * - Header Bar: Breadcrumb + Action Mode Tag
 * - Phần 1: Thông tin cơ bản (Ngày ăn, Bữa ăn, Chọn món ăn, Số suất dự kiến)
 * - Phần 2: Chọn lô nguyên liệu & Đối soát số lượng
 * - Phần 3: Phương án chế biến dự kiến
 * - Chân trang tác vụ: Nút quay lại, Lưu nháp (DRAFT), Khởi tạo lô chế biến
 */
export default function CreateBatch() {
  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        {/* Header Bar: Breadcrumb + Action Mode Tag */}
        <CreateBatchHeader />

        {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
        <BasicInfoSection />

        {/* PHẦN 2: CHỌN LÔ NGUYÊN LIỆU & ĐỐI SOÁT SỐ LƯỢNG */}
        <IngredientAllocationSection />

        {/* PHẦN 3: PHƯƠNG ÁN CHẾ BIẾN DỰ KIẾN */}
        <ProposedBatchSection />

        {/* CHÂN TRANG & THANH TÁC VỤ */}
        <CreateBatchFooter />
      </div>
    </div>
  )
}
