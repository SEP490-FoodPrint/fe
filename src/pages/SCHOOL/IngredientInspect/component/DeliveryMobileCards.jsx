import React from "react"
import PropTypes from "prop-types"
import { Eye, Truck, Store, Calendar, Clock } from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import styles from "./DeliveryMobileCards.module.scss"

export default function DeliveryMobileCards({ deliveries, onSelectDelivery }) {
  const formatDate = (isoString) => {
    if (!isoString) return "--"
    try {
      const d = new Date(isoString)
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return "--"
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return "--"
    try {
      const d = new Date(isoString)
      const hours = String(d.getHours()).padStart(2, "0")
      const minutes = String(d.getMinutes()).padStart(2, "0")
      return `${hours}:${minutes}`
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
              <span className={styles.label}>Ngày giao:</span>
              <span className={styles.value}>
                {formatDate(item.expectedArrivalAt)} ({formatTime(item.expectedArrivalAt)})
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>Đến thực tế:</span>
              <span className={styles.value}>
                {item.arrivedAt ? formatTime(item.arrivedAt) : "Chưa đến"}
              </span>
            </div>

            {item.vehiclePlate && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Biển số xe:</span>
                <span className={styles.plate}>{item.vehiclePlate}</span>
              </div>
            )}
          </div>

          <div className={styles.cardFooter}>
            <button
              type="button"
              className={styles.viewBtn}
              onClick={() => onSelectDelivery(item)}
            >
              <Eye size={15} />
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
