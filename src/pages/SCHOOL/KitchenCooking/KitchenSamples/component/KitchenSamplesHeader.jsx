import React from "react"
import PropTypes from "prop-types"
import { Plus, Printer } from "lucide-react"
import styles from "./KitchenSamplesHeader.module.scss"

export default function KitchenSamplesHeader({
  onOpenCreateModal,
  onPrint,
}) {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleCol}>
        <div className={styles.badgeRow}>
          <h1 className={styles.pageTitle}>Sổ lưu mẫu 24 giờ</h1>
          <span className={styles.stepBadge}>Kiểm thực bước 3</span>
        </div>
        <p className={styles.pageDesc}>
          Theo dõi, ghi nhận và quản lý mẫu thức ăn lưu từ các lô chế biến theo quy chuẩn an toàn thực phẩm 24 giờ của Bộ Y Tế.
        </p>
      </div>

      <div className={styles.actionsRow}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={onPrint}
          title="In biên bản sổ lưu mẫu"
        >
          <Printer size={16} />
          <span>In sổ kiểm thực</span>
        </button>

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
  onPrint: PropTypes.func,
}
