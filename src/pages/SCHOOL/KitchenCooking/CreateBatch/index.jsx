import React from "react"
import KitchenSidebar from "../component/KitchenSidebar"
import KitchenHeader from "../component/KitchenHeader"
import KitchenFooter from "../component/KitchenFooter"
import CreateBatchHeader from "./CreateBatchHeader"
import BasicInfoSection from "./BasicInfoSection"
import IngredientAllocationSection from "./IngredientAllocationSection"
import ProposedBatchSection from "./ProposedBatchSection"
import CreateBatchFooter from "./CreateBatchFooter"
import RoleSwitcher from "src/components/Common/RoleSwitcher"
import styles from "./index.module.scss"

/**
 * CreateBatch - Màn hình Khởi tạo Lô Chế Biến Thực Phẩm (Nhân viên Bếp)
 * Chuẩn hóa 100% theo bản thiết kế Google Stitch (SCREEN_108):
 * - Left Sidebar xanh Forest Emerald #0A8066 với Logo thương hiệu chính thức
 * - Top Header cố định đồng bộ
 * - Breadcrumb & Mode Badge "Chế độ: Nấu chung (Cho phép kết hợp nhiều lô nguyên liệu cùng loại)"
 * - Phần 1: Thông tin cơ bản (Ngày ăn khóa, Bữa ăn, Searchable Dropdown món ăn, Số suất dự kiến)
 * - Phần 2: Chọn lô nguyên liệu & Đối soát định lượng (Quy định nấu chung, Bảng đối soát đa lô rowspan, Tổng kết)
 * - Phần 3: Phương án chế biến dự kiến (Thẻ tóm tắt, Bảng mẻ hợp nhất, 4 Thẻ chi tiết thành phần con, Dòng ghi nhận)
 * - Chân trang tác vụ: Nút quay lại, Lưu nháp (DRAFT), Khởi tạo lô chế biến
 */
export default function CreateBatch() {
  return (
    <div className={styles.dashboardContainer}>
      {/* 1. Sidebar Trái cố định với nền xanh Forest Emerald #0A8066 */}
      <KitchenSidebar activePath="lo-che-bien" />

      {/* 2. Cột Nội Dung Chính */}
      <div className={styles.mainWrapper}>
        {/* Header Cố Định */}
        <KitchenHeader />

        {/* Nội Dung Biểu Mẫu Tạo Mẻ */}
        <main className={styles.contentCanvas}>
          <div className={styles.formContainer}>
            {/* Header Bar: Breadcrumb + Action Mode Tag */}
            <CreateBatchHeader />

            {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
            <BasicInfoSection />

            {/* PHẦN 2: CHỌN LÔ NGUYÊN LIỆU & ĐỐI SOÁT ĐỊNH LƯỢNG */}
            <IngredientAllocationSection />

            {/* PHẦN 3: PHƯƠNG ÁN CHẾ BIẾN DỰ KIẾN */}
            <ProposedBatchSection />

            {/* CHÂN TRANG & THANH TÁC VỤ */}
            <CreateBatchFooter />
          </div>
        </main>

        {/* Chân trang thông tin hệ thống */}
        <KitchenFooter />
      </div>

      {/* Nút chuyển đổi Role nhanh */}
      <RoleSwitcher />
    </div>
  )
}
