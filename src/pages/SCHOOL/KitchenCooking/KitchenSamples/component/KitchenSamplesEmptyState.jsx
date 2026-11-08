import React from "react"
import PropTypes from "prop-types"
import { FlaskConical, Plus, RotateCcw } from "lucide-react"
import styles from "./KitchenSamplesEmptyState.module.scss"

export default function KitchenSamplesEmptyState({
  isFiltered = false,
  onResetFilters,
  onOpenCreateModal,
}) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconCircle}>
        <FlaskConical size={32} />
      </div>

      <h3 className={styles.emptyTitle}>
        {isFiltered
          ? "Không tìm thấy mẫu lưu phù hợp bộ lọc"
          : "Chưa có mẫu lưu thực phẩm nào trong sổ"}
      </h3>

      <p className={styles.emptyDesc}>
        {isFiltered
          ? "Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các tiêu chí lọc trạng thái, bữa ăn để xem kết quả."
          : "Mẫu lưu thức ăn được trích xuất từ các mẻ nấu đã hoàn thành để phục vụ kiểm thực 3 bước và lưu giữ 24 giờ."}
      </p>

      <div className={styles.actionsRow}>
        {isFiltered ? (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onResetFilters}
          >
            <RotateCcw size={15} />
            <span>Xóa bộ lọc</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.createBtn}
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Ghi nhận mẫu lưu ngay</span>
          </button>
        )}
      </div>
    </div>
  )
}

KitchenSamplesEmptyState.propTypes = {
  isFiltered: PropTypes.bool,
  onResetFilters: PropTypes.func,
  onOpenCreateModal: PropTypes.func,
}
