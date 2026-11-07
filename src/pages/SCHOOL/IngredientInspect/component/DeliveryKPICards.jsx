import React from "react"
import PropTypes from "prop-types"
import { Truck, Store, ShieldCheck } from "lucide-react"
import styles from "./DeliveryKPICards.module.scss"

export default function DeliveryKPICards({
  deliveries = [],
  feedbacks = [],
}) {
  // Đếm chuyến giao
  const totalDeliveries = deliveries.length
  const receivedCount = deliveries.filter((d) => d.status === "RECEIVED").length
  const inTransitCount = deliveries.filter((d) => d.status === "IN_TRANSIT").length
  const arrivedCount = deliveries.filter((d) => d.status === "ARRIVED").length

  // Đếm nhà cung cấp duy nhất
  const uniqueSuppliers = Array.from(
    new Set(deliveries.map((d) => d.supplierName).filter(Boolean))
  )

  // Đếm phản hồi
  const totalFeedbacks = feedbacks.length
  const pendingFeedbacks = feedbacks.filter((f) => f.status === "SUBMITTED").length

  return (
    <div className={styles.kpiGrid}>
      {/* Card 1: Chuyến giao */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.metaCol}>
            <span className={styles.cardLabel}>Hôm nay • Đợt giao hàng</span>
            <div className={styles.valueRow}>
              <span className={styles.mainValue}>{String(totalDeliveries).padStart(2, "0")}</span>
              <span className={styles.unitText}>chuyến giao</span>
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

      {/* Card 2: Nhà cung cấp */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.metaCol}>
            <span className={styles.cardLabel}>Đối tác cung ứng</span>
            <div className={styles.valueRow}>
              <span className={styles.mainValue}>{String(uniqueSuppliers.length).padStart(2, "0")}</span>
              <span className={styles.unitText}>nhà cung cấp hoạt động</span>
            </div>
          </div>
          <div className={`${styles.iconWrap} ${styles.iconNeutral}`}>
            <Store size={22} />
          </div>
        </div>

        <div className={styles.cardBottomSupplier}>
          {uniqueSuppliers.slice(0, 2).map((name) => (
            <span key={name} className={styles.supplierTag}>
              {name}
            </span>
          ))}
          {uniqueSuppliers.length > 2 && (
            <span className={styles.supplierMoreTag}>+{uniqueSuppliers.length - 2}</span>
          )}
        </div>
      </div>

      {/* Card 3: Phản hồi chất lượng */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.metaCol}>
            <span className={styles.cardLabel}>Giám sát & An toàn</span>
            <div className={styles.valueRow}>
              <span className={`${styles.mainValue} ${styles.blueValue}`}>
                {String(totalFeedbacks).padStart(2, "0")}
              </span>
              <span className={styles.unitText}>phản hồi chất lượng</span>
            </div>
          </div>
          <div className={`${styles.iconWrap} ${styles.iconBlue}`}>
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.feedbackStat}>
            <span className={styles.feedbackStatusText}>
              {pendingFeedbacks > 0
                ? `${pendingFeedbacks} phản hồi đang chờ xử lý`
                : "Tất cả phản hồi đã được giải quyết"}
            </span>
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
