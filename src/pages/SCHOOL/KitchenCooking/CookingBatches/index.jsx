import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileDown, Clock } from "lucide-react";
import ROUTER from "src/router/ROUTER";
import STORAGE, { getStorage } from "src/lib/storage";
import { StoreContext } from "src/contexts";
import CookingBatchesKPI from "./CookingBatchesKPI";
import CookingBatchesFilter from "./CookingBatchesFilter";
import CookingBatchesTable from "./CookingBatchesTable";
import SampleReminderBanner from "./SampleReminderBanner";
import styles from "./index.module.scss";

/**
 * CookingBatches - Màn hình Quản lý Lô Chế Biến (Nhân viên Bếp)
 * Tự động hiển thị ca ăn và chuyển hướng theo cấu hình chế độ nấu của trường:
 * - Trường Nấu chung Cầu Giấy (COMBINE_LOTS): Ca trưa 11:00 -> /batches/create (Nấu chung)
 * - Trường Nấu riêng FoodPrint DEMO (SEPARATE_BY_LOT): Ca trưa 11:30 -> /batches/create-separate (Nấu riêng)
 */
function CookingBatches() {
  const navigate = useNavigate();
  const { userStore } = useContext(StoreContext) || {};
  const [filterChip, setFilterChip] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Tự động phát hiện trường học của tài khoản Bếp đang đăng nhập
  const userInfo = userStore?.user || getStorage(STORAGE.USER_INFO) || {};
  const isSeparateMode =
    userInfo.cookingMode === "SEPARATE_BY_LOT" ||
    userInfo.orgName?.toLowerCase().includes("demo") ||
    userInfo.schoolName?.toLowerCase().includes("demo") ||
    userInfo.username === "fp_demo_kitchen" ||
    userInfo.email === "fp_demo_kitchen@example.invalid" ||
    userInfo.email?.includes("demo_kitchen") ||
    userInfo.schoolId === "4eabb820-f445-52db-8aeb-2fd0f6cb882a";

  // Giờ ăn do BGH trường thiết lập trong CSDL
  const shiftTimeLabel = isSeparateMode ? "Ca trưa (11:30)" : "Ca trưa (11:00)";
  const schoolLabel = isSeparateMode
    ? "Trường DEMO (Nấu riêng 1:1)"
    : "Trường Cầu Giấy (Nấu chung)";

  const handleNavigateCreate = () => {
    if (isSeparateMode) {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_CREATE_SEPARATE);
    } else {
      navigate(ROUTER.SCHOOL_KITCHEN_BATCH_CREATE);
    }
  };

  return (
    <div className={styles.batchesContainer}>
      {/* 1. Header Trang: Tiêu đề + Badge ca ăn đồng bộ cấu hình BGH + Nút thao tác Desktop */}
      <div className={styles.pageHeader}>
        <div className={styles.titleWrap}>
          <h1 className={styles.title}>Quản lý lô chế biến</h1>
          <div className={styles.shiftBadge}>
            <span className={styles.pulseDot} />
            <Clock size={13} className={styles.clockIcon} />
            <span>{shiftTimeLabel}</span>
            <span style={{ opacity: 0.6, margin: "0 2px" }}>•</span>
            <span style={{ fontSize: "11.5px" }}>{schoolLabel}</span>
          </div>
        </div>

        {/* Action buttons (Desktop) */}
        <div className={styles.actionBtns}>
          <button
            type="button"
            className={styles.exportBtn}
            title="Xuất báo cáo danh sách lô chế biến"
          >
            <FileDown size={16} />
            <span>Xuất báo cáo</span>
          </button>

          {/* Nút hành động chuẩn theo cấu hình chế độ nấu của nhà trường */}
          <button
            type="button"
            className={styles.createBtn}
            onClick={() => handleNavigateCreate()}
            title={
              isSeparateMode
                ? "Chế độ trường: Nấu riêng từng lô"
                : "Chế độ trường: Nấu chung hợp nhất lô"
            }
          >
            <Plus size={18} />
            <span>
              {isSeparateMode ? "Tạo lô nấu riêng" : "Tạo lô nấu mới"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Nhắc nhở lưu mẫu thanh mảnh */}
      <SampleReminderBanner />

      {/* 3. 4 Ô KPI Mật độ cao (2 cột compact trên mobile) */}
      <CookingBatchesKPI />

      {/* 4. Dải Bộ Lọc (Search box + Filter Chips cuộn ngang) */}
      <CookingBatchesFilter
        activeQuickFilter={filterChip}
        onQuickFilterChange={(chipId) => setFilterChip(chipId)}
        onFilterChange={({ searchTerm: term }) => setSearchTerm(term)}
      />

      {/* 5. Bảng / Thẻ Dữ Liệu Lô Chế Biến */}
      <CookingBatchesTable filterChip={filterChip} searchTerm={searchTerm} />

      {/* 6. Nút Tạo mẻ ghim đáy màn hình cho Mobile (Thumb-friendly Sticky CTA) */}
      <div className={styles.mobileStickyBar}>
        <button
          type="button"
          className={styles.mobileCreateBtn}
          onClick={() => handleNavigateCreate()}
        >
          <Plus size={19} />
          <span>{isSeparateMode ? "Tạo lô nấu riêng" : "Tạo lô nấu mới"}</span>
        </button>
      </div>
    </div>
  );
}

export default CookingBatches;
