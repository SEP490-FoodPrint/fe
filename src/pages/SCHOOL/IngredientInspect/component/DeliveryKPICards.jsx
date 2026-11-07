import React from "react"
import PropTypes from "prop-types"
import { Truck, ShieldCheck } from "lucide-react"
import styles from "./DeliveryKPICards.module.scss"

export default function DeliveryKPICards({ deliveries = [] }) {
  // Thống kê tiến độ chuyến giao
  const totalDeliveries = deliveries.length
  const receivedCount = deliveries.filter((d) => d.status === "RECEIVED").length
  const inTransitCount = deliveries.filter((d) => d.status === "IN_TRANSIT").length
  const arrivedCount = deliveries.filter((d) => d.status === "ARRIVED").length

  // Thống kê kiểm thực của Cán bộ Y tế
  const rejectedCount = deliveries.filter(
    (d) =>
      d.status === "REJECTED" ||
      d.deliveryApprovals?.some((a) => a.decision === "REJECT")
  ).length

  const approvedCount = deliveries.filter(
    (d) =>
      (d.status === "RECEIVED" || d.status === "APPROVED") &&
      !d.deliveryApprovals?.some((a) => a.decision === "REJECT")
  ).length

  const pendingInspectCount = deliveries.filter(
    (d) =>
      (d.status === "ARRIVED" || d.status === "PENDING_APPROVAL") &&
      !d.deliveryApprovals?.some((a) => a.roleCode === "SCHOOL_NUTRITION_OFFICER")
  ).length

  return (
    <div className={styles.kpiGrid}>
      {/* Thẻ 1: Tiến độ giao hàng */}
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

      {/* Thẻ 2: Kiểm thực an toàn thực phẩm */}
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.metaCol}>
            <span className={styles.cardLabel}>Kiểm thực an toàn thực phẩm</span>
            <div className={styles.valueRow}>
              <span className={styles.mainValue}>
                {String(approvedCount + rejectedCount).padStart(2, "0")}
              </span>
              <span className={styles.unitText}>đợt đã kiểm tra</span>
            </div>
          </div>
          <div className={`${styles.iconWrap} ${styles.iconGreen}`}>
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotGreen}`} />
            <span><strong>{approvedCount}</strong> đạt chuẩn</span>
          </div>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotRed}`} />
            <span><strong>{rejectedCount}</strong> từ chối</span>
          </div>
          <div className={styles.subItem}>
            <span className={`${styles.subDot} ${styles.dotOrange}`} />
            <span><strong>{pendingInspectCount}</strong> chờ kiểm thực</span>
          </div>
        </div>
      </div>
    </div>
  )
}

DeliveryKPICards.propTypes = {
  deliveries: PropTypes.array.isRequired,
}
