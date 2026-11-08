import React from "react"
import PropTypes from "prop-types"
import { Plus } from "lucide-react"
import styles from "./KitchenSamplesHeader.module.scss"

export default function KitchenSamplesHeader({
  onOpenCreateModal,
}) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleCol}>
        <h1 className={styles.pageTitle}>Sổ lưu mẫu 24 giờ</h1>
      </div>

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={onOpenCreateModal}
          title="Ghi nhận mẫu lưu mới từ mẻ nấu"
        >
          <Plus size={18} />
          <span>Ghi nhận mẫu lưu</span>
        </button>
      </div>
    </div>
  )
}

KitchenSamplesHeader.propTypes = {
  onOpenCreateModal: PropTypes.func.isRequired,
}
