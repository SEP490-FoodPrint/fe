import React from "react"
import PropTypes from "prop-types"
import { MessageSquareText, ArrowRight } from "lucide-react"
import styles from "./DeliveryHeader.module.scss"

export default function DeliveryHeader({ feedbackCount, onOpenFeedbackList }) {
  return (
    <div className={styles.header}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>Giao hàng nguyên liệu</h1>
        <p className={styles.description}>
          Theo dõi tình hình giao hàng và kiểm tra thông tin nguyên liệu được cung cấp bởi các nhà cung cấp.
        </p>
      </div>

      <div className={styles.actionArea}>
        <button
          type="button"
          className={styles.feedbackListBtn}
          onClick={onOpenFeedbackList}
          title="Xem danh sách phản hồi chất lượng đã gửi"
        >
          <MessageSquareText size={18} className={styles.btnIcon} />
          <span>Danh sách phản hồi đã gửi</span>
          {feedbackCount > 0 && (
            <span className={styles.countBadge}>{feedbackCount}</span>
          )}
          <ArrowRight size={16} className={styles.arrowIcon} />
        </button>
      </div>
    </div>
  )
}

DeliveryHeader.propTypes = {
  feedbackCount: PropTypes.number.isRequired,
  onOpenFeedbackList: PropTypes.func.isRequired,
}
