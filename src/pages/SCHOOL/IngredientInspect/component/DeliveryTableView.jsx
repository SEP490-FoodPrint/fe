import React from "react"
import PropTypes from "prop-types"
import { Eye } from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import styles from "./DeliveryTableView.module.scss"

export default function DeliveryTableView({ deliveries, onSelectDelivery }) {
  // Format date helper: HH:mm • DD/MM/YYYY
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
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thSupplier}>Nhà cung cấp & Mã đợt giao</th>
            <th className={styles.thDate}>Thời gian giao</th>
            <th className={styles.thStatus}>Trạng thái</th>
            <th className={styles.thAction}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((item) => (
            <tr key={item.id} className={styles.tableRow}>
              {/* 1. Nhà cung cấp & Mã giao hàng tích hợp */}
              <td className={styles.tdSupplier}>
                <div className={styles.supplierBlock}>
                  <button
                    type="button"
                    className={styles.supplierNameBtn}
                    onClick={() => onSelectDelivery(item)}
                    title="Nhấn để xem chi tiết đợt giao này"
                  >
                    {item.supplierName}
                  </button>
                  <span className={styles.deliveryCode}>{item.deliveryNo}</span>
                </div>
              </td>

              {/* 2. Thời gian giao */}
              <td className={styles.tdDate}>
                <span className={styles.dateText}>
                  {formatDateTime(item.expectedArrivalAt, item.arrivedAt)}
                </span>
              </td>

              {/* 3. Trạng thái */}
              <td className={styles.tdStatus}>
                <DeliveryStatusBadge status={item.status} />
              </td>

              {/* 4. Thao tác: Chỉ để Icon */}
              <td className={styles.tdAction}>
                <button
                  type="button"
                  className={styles.iconActionBtn}
                  onClick={() => onSelectDelivery(item)}
                  title="Xem chi tiết đợt giao"
                  aria-label={`Xem chi tiết đợt giao ${item.deliveryNo}`}
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

DeliveryTableView.propTypes = {
  deliveries: PropTypes.array.isRequired,
  onSelectDelivery: PropTypes.func.isRequired,
}
