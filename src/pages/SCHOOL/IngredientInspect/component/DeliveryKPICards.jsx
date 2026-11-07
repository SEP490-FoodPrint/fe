import React from "react"
import PropTypes from "prop-types"
import { Truck, MessageSquareText } from "lucide-react"
import styles from "./DeliveryKPICards.module.scss"

export default function DeliveryKPICards({
  deliveries = [],
  feedbacks = [],
}) {
  // Thống kê chuyến giao
  const totalDeliveries = deliveries.length
  const receivedCount = deliveries.filter((d) => d.status === "RECEIVED").length
  const inTransitCount = deliveries.filter((d) => d.status === "IN_TRANSIT").length
  const arrivedCount = deliveries.filter((d) => d.status === "ARRIVED").length

  // Thống kê phản hồi chất lượng
  const totalFeedbacks = feedbacks.length
  const pendingCount = feedbacks.filter((f) => f.status === "SUBMITTED").length
  const respondedCount = feedbacks.filter((f) => f.status === "RESPONDED").length

  return (
    <div className={styles.kpiGrid}>
      {/* Thẻ 1: Đợt giao hôm nay */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.metaCol}>
            <span className={styles.cardLabel}>Đợt giao hôm nay</span>
            <div className={styles.valueRow}>
              <span className={styles.mainValue}>{String(totalDeliveries).padStart(2, "0")}</span>
              <span className={styles.unitText}>đợt giao</span>
            </div>
          </div>
          <div className={`${styles.iconWrap} ${styles.iconGreen}`}>
            <Truck size={22} />
          </div>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotGreen}`} />
            <span><strong>{receivedCount}</strong> đã nhận</span>
          </div>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotBlue}`} />
            <span><strong>{inTransitCount}</strong> vận chuyển</span>
          </div>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotOrange}`} />
            <span><strong>{arrivedCount}</strong> đã đến</span>
          </div>
        </div>
      </div>

      {/* Thẻ 2: Phản hồi chất lượng (viết ngắn gọn, dễ hiểu) */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.metaCol}>
            <span className={styles.cardLabel}>Phản hồi chất lượng</span>
            <div className={styles.valueRow}>
              <span className={`${styles.mainValue} ${styles.blueValue}`}>
                {String(totalFeedbacks).padStart(2, "0")}
              </span>
              <span className={styles.unitText}>phản hồi gửi nhà cung cấp</span>
            </div>
          </div>
          <div className={`${styles.iconWrap} ${styles.iconBlue}`}>
            <MessageSquareText size={22} />
          </div>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotBlue}`} />
            <span><strong>{pendingCount}</strong> đang chờ trả lời</span>
          </div>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotGreen}`} />
            <span><strong>{respondedCount}</strong> đã phản hồi</span>
          </div>
        </div>
      </div>
    </div>
  )
}

DeliveryKPICards.propTypes = {
  deliveries: PropTypes.array.isRequired,
  feedbacks: PropTypes.array.isRequired,
}
