import React from "react"
import PropTypes from "prop-types"
import { Eye, ArrowRight, Store, Calendar, Clock, Truck } from "lucide-react"
import DeliveryStatusBadge from "./DeliveryStatusBadge"
import styles from "./DeliveryTableView.module.scss"

export default function DeliveryTableView({ deliveries, onSelectDelivery }) {
  // Format date helper: DD/MM/YYYY
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

  // Format time helper: HH:mm
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
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thDeliveryNo}>Mã giao hàng</th>
            <th className={styles.thSupplier}>Nhà cung cấp</th>
            <th className={styles.thDate}>Ngày giao dự kiến</th>
            <th className={styles.thArrive}>Thời gian đến thực tế</th>
            <th className={styles.thPlate}>Biển số xe</th>
            <th className={styles.thStatus}>Trạng thái</th>
            <th className={styles.thAction}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((item) => (
            <tr key={item.id} className={styles.tableRow}>
              {/* 1. Mã giao hàng */}
              <td className={styles.tdDeliveryNo}>
                <button
                  type="button"
                  className={styles.linkNo}
                  onClick={() => onSelectDelivery(item)}
                  title="Nhấn để xem chi tiết đợt giao này"
                >
                  {item.deliveryNo}
                </button>
              </td>

              {/* 2. Nhà cung cấp */}
              <td className={styles.tdSupplier}>
                <div className={styles.supplierText}>
                  <span className={styles.supplierPrimary}>{item.supplierName}</span>
                </div>
              </td>

              {/* 3. Ngày giao dự kiến */}
              <td className={styles.tdDate}>
                <div className={styles.dateTimeCell}>
                  <span className={styles.dateText}>{formatDate(item.expectedArrivalAt)}</span>
                  <span className={styles.timeMuted}>{formatTime(item.expectedArrivalAt)}</span>
                </div>
              </td>

              {/* 4. Thời gian đến thực tế */}
              <td className={styles.tdArrive}>
                {item.arrivedAt ? (
                  <div className={styles.arriveWrap}>
                    <span className={styles.timeMain}>{formatTime(item.arrivedAt)}</span>
                    <span className={styles.onTimeTag}>Đã tới</span>
                  </div>
                ) : (
                  <span className={styles.emptyDash}>--</span>
                )}
              </td>

              {/* 5. Biển số xe */}
              <td className={styles.tdPlate}>
                {item.vehiclePlate ? (
                  <span className={styles.plateText}>{item.vehiclePlate}</span>
                ) : (
                  <span className={styles.emptyDash}>--</span>
                )}
              </td>

              {/* 6. Trạng thái */}
              <td className={styles.tdStatus}>
                <DeliveryStatusBadge status={item.status} />
              </td>

              {/* 7. Thao tác */}
              <td className={styles.tdAction}>
                <button
                  type="button"
                  className={styles.viewDetailBtn}
                  onClick={() => onSelectDelivery(item)}
                  title="Xem chi tiết đợt giao"
                >
                  <Eye size={15} />
                  <span>Xem chi tiết</span>
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
