import React from "react"
import PropTypes from "prop-types"
import { SearchX, ShieldCheck, RotateCcw } from "lucide-react"
import styles from "./AllergyEmptyState.module.scss"

export default function AllergyEmptyState({ isSearching, onResetFilters }) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconCircle}>
        {isSearching ? (
          <SearchX size={32} className={styles.emptyIcon} />
        ) : (
          <ShieldCheck size={32} className={styles.emptyIcon} />
        )}
      </div>

      <h3 className={styles.emptyTitle}>
        {isSearching ? "Không tìm thấy kết quả phù hợp" : "Chưa có thông tin dị ứng"}
      </h3>

      <p className={styles.emptyDescription}>
        {isSearching
          ? "Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc"
          : "Hiện tại chưa có lớp học nào ghi nhận thông tin dị ứng"}
      </p>

      {isSearching && onResetFilters && (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={onResetFilters}
        >
          <RotateCcw size={14} />
          <span>Đặt lại bộ lọc</span>
        </button>
      )}
    </div>
  )
}

AllergyEmptyState.propTypes = {
  isSearching: PropTypes.bool,
  onResetFilters: PropTypes.func,
}
