import React from "react"
import PropTypes from "prop-types"
import { SearchX, RotateCcw } from "lucide-react"
import styles from "./DeliveryEmptyState.module.scss"

export default function DeliveryEmptyState({ message, onResetFilters }) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconWrap}>
        <SearchX size={32} />
      </div>
      <h3 className={styles.title}>Không tìm thấy chuyến giao hàng phù hợp</h3>
      <p className={styles.desc}>
        {message || "Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trạng thái và ngày giao hàng."}
      </p>
      {onResetFilters && (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={onResetFilters}
        >
          <RotateCcw size={14} />
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  )
}

DeliveryEmptyState.propTypes = {
  message: PropTypes.string,
  onResetFilters: PropTypes.func,
}

