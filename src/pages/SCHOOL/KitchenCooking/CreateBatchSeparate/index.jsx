import React from "react"
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader"
import BasicInfoSeparateSection from "./component/BasicInfoSeparateSection"
import IngredientSeparateSection from "./component/IngredientSeparateSection"
import ProposedSeparateBatchSection from "./component/ProposedSeparateBatchSection"
import CreateBatchSeparateFooter from "./component/CreateBatchSeparateFooter"
import styles from "./index.module.scss"

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến - Chế độ Nấu Riêng (Nhân viên Bếp)
 * Chuẩn hóa Mobile-First & UI/UX Pro Max:
 * - Kế thừa MainLayout dùng chung (Sidebar xanh Forest Emerald #0A8066 + DashboardHeader)
 * - Header Bar: Breadcrumb + Mode Badge "Chế độ: Nấu riêng 1:1"
 * - Phần 1: Thông tin phiên nấu
 * - Phần 2: Đối soát lô & Phân tách lô theo nguồn gốc nguyên liệu
 * - Phần 3: Phương án 02 lô độc lập song song
 * - Chân trang tác vụ tinh gọn & Sticky Bar cho Mobile
 */
export default function CreateBatchSeparate() {
  return (
    <div className={styles.createBatchContainer}>
      <div className={styles.formContainer}>
        <CreateBatchSeparateHeader />
        <BasicInfoSeparateSection />
        <IngredientSeparateSection />
        <ProposedSeparateBatchSection />
        <CreateBatchSeparateFooter />
      </div>
    </div>
  )
}
