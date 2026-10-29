import React from "react"
import KitchenSidebar from "../component/KitchenSidebar"
import KitchenHeader from "../component/KitchenHeader"
import KitchenFooter from "../component/KitchenFooter"
import CreateBatchSeparateHeader from "./CreateBatchSeparateHeader"
import BasicInfoSeparateSection from "./BasicInfoSeparateSection"
import IngredientSeparateSection from "./IngredientSeparateSection"
import ProposedSeparateBatchSection from "./ProposedSeparateBatchSection"
import CreateBatchSeparateFooter from "./CreateBatchSeparateFooter"
import RoleSwitcher from "src/components/Common/RoleSwitcher"
import styles from "./index.module.scss"

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến — Chế độ Nấu Riêng (Nhân viên Bếp)
 * Chuẩn hóa 100% theo bản thiết kế Google Stitch (SCREEN_110):
 * - Left Sidebar xanh Forest Emerald #0A8066 với Logo thương hiệu chính thức
 * - Top Header cố định đồng bộ
 * - Breadcrumb & Mode Badge "Chế độ kiểm thực: Nghiêm ngặt (Nấu riêng)"
 * - Phần 1: Thông tin cơ bản (Ngày ăn khóa, Bữa ăn, Searchable Dropdown, 1.250 suất)
 * - Phần 2: Chọn lô nguyên liệu & Đối soát (Quy tắc nấu riêng, Bảng đối soát với tag "Gây tách mẻ (2 lô)")
 * - Phần 3: Phương án chế biến dự kiến (Phân chia 02 mẻ độc lập: Mẻ 1 731 suất, Mẻ 2 519 suất)
 * - Chân trang tác vụ: Nút quay lại, Lưu nháp (DRAFT), Khởi tạo lô chế biến
 */
export default function CreateBatchSeparate() {
  return (
    <div className={styles.dashboardContainer}>
      {/* 1. Sidebar Trái cố định với nền xanh Forest Emerald #0A8066 */}
      <KitchenSidebar activePath="lo-che-bien" />

      {/* 2. Cột Nội Dung Chính */}
      <div className={styles.mainWrapper}>
        {/* Header Cố Định */}
        <KitchenHeader />

        {/* Nội Dung Biểu Mẫu Tạo Mẻ Nấu Riêng */}
        <main className={styles.contentCanvas}>
          <div className={styles.formContainer}>
            {/* Header Bar */}
            <CreateBatchSeparateHeader />

            {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
            <BasicInfoSeparateSection />

            {/* PHẦN 2: CHỌN LÔ NGUYÊN LIỆU & ĐỐI SOÁT */}
            <IngredientSeparateSection />

            {/* PHẦN 3: PHƯƠNG ÁN CHẾ BIẾN DỰ KIẾN (2 MẺ ĐỘC LẬP) */}
            <ProposedSeparateBatchSection />

            {/* CHÂN TRANG & THANH TÁC VỤ */}
            <CreateBatchSeparateFooter />
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
