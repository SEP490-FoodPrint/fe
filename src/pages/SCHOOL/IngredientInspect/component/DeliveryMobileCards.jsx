import React from "react"
import PropTypes from "prop-types"
import { Eye } from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import styles from "./DeliveryMobileCards.module.scss"

export default function DeliveryMobileCards({ deliveries, onSelectDelivery }) {
  const formatDateTime = (expectedAt, arrivedAt) => {
    const timeSrc = arrivedAt || expectedAt
    if (!timeSrc) return "--"
    try {
      const d = new Date(timeSrc)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      const hours = String(d.getHours()).padStart(2, "0")
      const minutes = String(d.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes} • ${day}/${month}/${year}`
    } catch {
      return "--"
    }
  }

  return (
    <div className={styles.cardsWrap}>
      {deliveries.map((item) => (
        <div key={item.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.deliveryNo}>{item.deliveryNo}</span>
            <DeliveryStatusBadge status={item.status} />
          </div>

          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Nhà cung cấp:</span>
              <span className={styles.valueStrong}>{item.supplierName}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Thời gian giao:</span>
              <span className={styles.value}>
                {formatDateTime(item.expectedArrivalAt, item.arrivedAt)}
              </span>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <button
              type="button"
              className={styles.viewBtn}
              onClick={() => onSelectDelivery(item)}
              aria-label={`Xem chi tiết ${item.deliveryNo}`}
            >
              <Eye size={16} />
              <span>Xem chi tiết</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

DeliveryMobileCards.propTypes = {
  deliveries: PropTypes.array.isRequired,
  onSelectDelivery: PropTypes.func.isRequired,
}
