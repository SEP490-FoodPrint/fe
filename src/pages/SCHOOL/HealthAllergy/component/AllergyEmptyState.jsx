import React from "react"
import PropTypes from "prop-types"
import { SearchX, ShieldCheck, RotateCcw } from "lucide-react"
import styles from "./AllergyEmptyState.module.scss"

export default function AllergyEmptyState({ isSearching, onResetFilters }) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconCircle}>
        {isSearching ? (
          <SearchX size={36} className={styles.emptyIcon} />
        ) : (
          <ShieldCheck size={36} className={styles.emptyIcon} />
        )}
      </div>

      <h3 className={styles.emptyTitle}>
        {isSearching
          ? "Không tìm thấy kết quả phù hợp"
          : "Chưa có thông tin dị ứng nào được ghi nhận"}
      </h3>

      <p className={styles.emptyDescription}>
        {isSearching
          ? "Không tìm thấy lớp học hoặc nguyên liệu dị ứng nào khớp với từ khóa và bộ lọc hiện tại. Vui lòng thử tìm kiếm khác hoặc đặt lại bộ lọc."
          : "Toàn bộ các lớp học hiện tại chưa có ghi nhận dị ứng nào từ phiếu y bạ đầu năm của phụ huynh và giáo viên chủ nhiệm."}
      </p>

      {isSearching && onResetFilters && (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={onResetFilters}
        >
          <RotateCcw size={16} />
          <span>Đặt lại bộ lọc tìm kiếm</span>
        </button>
      )}
    </div>
  )
}

AllergyEmptyState.propTypes = {
  isSearching: PropTypes.bool,
  onResetFilters: PropTypes.func,
}
