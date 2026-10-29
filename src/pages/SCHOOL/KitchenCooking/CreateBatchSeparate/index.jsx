import React from "react"
import KitchenSidebar from "../component/KitchenSidebar"
import KitchenHeader from "../component/KitchenHeader"
import KitchenFooter from "../component/KitchenFooter"
import CreateBatchSeparateHeader from "./component/CreateBatchSeparateHeader"
import BasicInfoSeparateSection from "./component/BasicInfoSeparateSection"
import IngredientSeparateSection from "./component/IngredientSeparateSection"
import ProposedSeparateBatchSection from "./component/ProposedSeparateBatchSection"
import CreateBatchSeparateFooter from "./component/CreateBatchSeparateFooter"
import RoleSwitcher from "src/components/Common/RoleSwitcher"
import styles from "./index.module.scss"

/**
 * CreateBatchSeparate - Màn hình Khởi tạo Lô Chế Biến - Chế độ Nấu Riêng (Nhân viên Bếp)
 * Kiến trúc tinh gọn (Clean & High Density per ai_coding_rule.md):
 * - Left Sidebar xanh Forest Emerald #0A8066
 * - Top Header cố định đồng bộ
 * - Breadcrumb & Mode Badge "Chế độ: Nấu riêng 1:1"
 * - Phần 1: Thông tin phiên nấu 4 cột (Single-row 4-column Grid)
 * - Phần 2: Đối soát lô & Phân tách lô với icon phân loại thực phẩm
 * - Phần 3: Phương án 02 mẻ độc lập song song (Side-by-side 50%-50%)
 * - Chân trang tác vụ tinh gọn
 */
export default function CreateBatchSeparate() {
  return (
    <div className={styles.dashboardContainer}>
      <KitchenSidebar activePath="lo-che-bien" />

      <div className={styles.mainWrapper}>
        <KitchenHeader />

        <main className={styles.contentCanvas}>
          <div className={styles.formContainer}>
            <CreateBatchSeparateHeader />
            <BasicInfoSeparateSection />
            <IngredientSeparateSection />
            <ProposedSeparateBatchSection />
            <CreateBatchSeparateFooter />
          </div>
        </main>

        <KitchenFooter />
      </div>

      <RoleSwitcher />
    </div>
  )
}
